import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  noteId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  noteId: { type: String, index: true, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
