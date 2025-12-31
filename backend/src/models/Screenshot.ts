import mongoose, { Document, Schema } from 'mongoose';

export interface IScreenshot extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  timestamp: Date;
  imageUrl: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const screenshotSchema = new Schema<IScreenshot>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required'],
    default: Date.now
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: ['image/jpeg', 'image/png', 'image/webp']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
screenshotSchema.index({ userId: 1, date: 1 });
screenshotSchema.index({ userId: 1, timestamp: -1 });
screenshotSchema.index({ date: 1 });
screenshotSchema.index({ timestamp: -1 });
screenshotSchema.index({ isActive: 1 });

export const Screenshot = mongoose.model<IScreenshot>('Screenshot', screenshotSchema);
