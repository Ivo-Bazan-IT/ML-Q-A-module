import { Schema, model, Document } from 'mongoose';

export interface IOAuthToken extends Document {
  userId: string;
  mlUserId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
  createdAt: Date;
  updatedAt: Date;
}

const oauthTokenSchema = new Schema<IOAuthToken>(
  {
    userId: { type: String, required: true, index: true },
    mlUserId: { type: String, required: true, index: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    scope: [{ type: String }],
  },
  { timestamps: true }
);

// Index for automatic cleanup of expired tokens
oauthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthToken = model<IOAuthToken>('OAuthToken', oauthTokenSchema);
