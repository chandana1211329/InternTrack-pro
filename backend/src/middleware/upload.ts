import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { IUser } from '../models/User';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
const screenshotsDir = path.join(uploadsDir, 'screenshots');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, screenshotsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-date-timestamp.ext
    const userId = req.user?.id?.toString() || 'unknown';
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}-${date}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

// Upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

export const uploadScreenshot = upload.single('screenshot');
export { storage, fileFilter };
