import { Schema, model, Document } from 'mongoose';

export interface IQuestion extends Document {
  mlQuestionId: string;
  mlItemId: string;
  mlSellerId: string;
  mlBuyerId: string;
  text: string;
  status: 'active' | 'archived' | 'banned';
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date;
}

export interface IAnswer extends Document {
  mlAnswerId: string;
  mlQuestionId: string;
  mlSellerId: string;
  text: string;
  status: 'active' | 'archived' | 'banned';
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    mlQuestionId: { type: String, required: true, unique: true, index: true },
    mlItemId: { type: String, required: true, index: true },
    mlSellerId: { type: String, required: true, index: true },
    mlBuyerId: { type: String, required: true },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'banned'],
      default: 'active',
      index: true,
    },
    deletedAt: { type: Date, default: null },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const answerSchema = new Schema<IAnswer>(
  {
    mlAnswerId: { type: String, required: true, unique: true, index: true },
    mlQuestionId: { type: String, required: true, index: true },
    mlSellerId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'banned'],
      default: 'active',
      index: true,
    },
    deletedAt: { type: Date, default: null },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create compound indexes for efficient queries
questionSchema.index({ mlSellerId: 1, status: 1 });
questionSchema.index({ mlItemId: 1, status: 1 });
answerSchema.index({ mlSellerId: 1, status: 1 });
answerSchema.index({ mlQuestionId: 1, status: 1 });

export const Question = model<IQuestion>('Question', questionSchema);
export const Answer = model<IAnswer>('Answer', answerSchema);
