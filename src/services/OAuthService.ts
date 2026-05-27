import axios, { AxiosError } from 'axios';
import { config } from '../config/index.js';
import { OAuthToken, IOAuthToken } from '../models/OAuthToken.js';
import NodeCache from 'node-cache';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token?: string;
}

interface MLUserInfo {
  id: number;
  nickname: string;
  email: string;
}

class OAuthService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: config.cache.ttl });
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.mercadoLibre.clientId,
      redirect_uri: config.mercadoLibre.redirectUri,
      state,
    });

    return `${config.mercadoLibre.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      const response = await axios.post<TokenResponse>(config.mercadoLibre.tokenUrl, {
        grant_type: 'authorization_code',
        client_id: config.mercadoLibre.clientId,
        client_secret: config.mercadoLibre.clientSecret,
        code,
        redirect_uri: config.mercadoLibre.redirectUri,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error exchanging code for token:', axiosError.response?.data);
      throw new Error(`Failed to exchange authorization code: ${axiosError.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await axios.post<TokenResponse>(config.mercadoLibre.tokenUrl, {
        grant_type: 'refresh_token',
        client_id: config.mercadoLibre.clientId,
        client_secret: config.mercadoLibre.clientSecret,
        refresh_token: refreshToken,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error refreshing token:', axiosError.response?.data);
      throw new Error(`Failed to refresh access token: ${axiosError.message}`);
    }
  }

  /**
   * Save or update OAuth token in database
   */
  async saveToken(
    userId: string,
    mlUserId: string,
    tokenData: TokenResponse
  ): Promise<IOAuthToken> {
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    const scope = tokenData.scope.split(' ');

    const token = await OAuthToken.findOneAndUpdate(
      { userId, mlUserId },
      {
        userId,
        mlUserId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
        expiresAt,
        scope,
      },
      { upsert: true, new: true }
    );

    // Clear cache for this user
    this.cache.del(`token:${userId}`);

    return token;
  }

  /**
   * Get valid access token for a user
   */
  async getValidAccessToken(userId: string): Promise<string> {
    // Check cache first
    const cachedToken = this.cache.get<string>(`token:${userId}`);
    if (cachedToken) {
      return cachedToken;
    }

    const tokenDoc = await OAuthToken.findOne({ userId });

    if (!tokenDoc) {
      throw new Error(`No OAuth token found for user ${userId}`);
    }

    // Check if token is expired or expiring soon (within 5 minutes)
    const expirationBuffer = 5 * 60 * 1000; // 5 minutes
    if (tokenDoc.expiresAt.getTime() - Date.now() < expirationBuffer) {
      // Refresh the token
      if (!tokenDoc.refreshToken) {
        throw new Error(`Cannot refresh token for user ${userId}: no refresh token available`);
      }

      const newTokenData = await this.refreshAccessToken(tokenDoc.refreshToken);
      await this.saveToken(userId, tokenDoc.mlUserId, newTokenData);

      return newTokenData.access_token;
    }

    // Cache the token
    const cacheSeconds = Math.floor(
      (tokenDoc.expiresAt.getTime() - Date.now() - expirationBuffer) / 1000
    );
    this.cache.set(`token:${userId}`, tokenDoc.accessToken, cacheSeconds);

    return tokenDoc.accessToken;
  }

  /**
   * Get user info from Mercado Libre API
   */
  async getUserInfo(accessToken: string): Promise<MLUserInfo> {
    try {
      const response = await axios.get<MLUserInfo>(`${config.mercadoLibre.apiBaseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching user info:', axiosError.response?.data);
      throw new Error(`Failed to get user info: ${axiosError.message}`);
    }
  }

  /**
   * Revoke token
   */
  async revokeToken(userId: string): Promise<void> {
    await OAuthToken.deleteOne({ userId });
    this.cache.del(`token:${userId}`);
  }

  /**
   * Check if user has valid token
   */
  async hasValidToken(userId: string): Promise<boolean> {
    try {
      const token = await OAuthToken.findOne({ userId });

      if (!token) {
        return false;
      }

      // Check if token is expired
      return token.expiresAt > new Date();
    } catch {
      return false;
    }
  }
}

export const oauthService = new OAuthService();
