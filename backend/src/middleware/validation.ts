import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((error: any) => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
  }
  next();
};

export const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
  const { id, userId, reportId, attendanceId } = req.params;
  const objectId = id || userId || reportId || attendanceId;
  
  if (!objectId) {
    return next();
  }
  
  // Basic MongoDB ObjectId validation (24 character hex string)
  if (!/^[0-9a-fA-F]{24}$/.test(objectId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  next();
};
