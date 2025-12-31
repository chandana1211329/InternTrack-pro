import express from 'express';
import { body, validationResult } from 'express-validator';
import { DailyReportModel } from '../models';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// Submit daily report
router.post('/submit', authenticate, [
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('taskTitle').trim().isLength({ min: 1, max: 200 }).withMessage('Task title must be between 1 and 200 characters'),
  body('taskDescription').trim().isLength({ min: 1, max: 2000 }).withMessage('Task description must be between 1 and 2000 characters'),
  body('toolsUsed').isArray().withMessage('Tools used must be an array'),
  body('timeSpent').matches(/^\d+h\s*\d*m$|^\d+h$|^\d+m$/).withMessage('Time spent must be in format "Xh Ym", "Xh", or "Ym"')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, taskTitle, taskDescription, toolsUsed, timeSpent } = req.body;
    const user = (req as any).user;
    const userId = user?.id;

    // Check if report already exists for this date
    const existingReport = await DailyReportModel.findByUserAndDate(userId, date);
    if (existingReport) {
      return res.status(400).json({ message: 'Report already submitted for this date' });
    }

    const report = await DailyReportModel.create({
      userId,
      date,
      taskTitle,
      taskDescription,
      toolsUsed,
      timeSpent,
      status: 'PENDING'
    });

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Server error submitting report' });
  }
});

// Get my reports
router.get('/my-reports', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = (req as any).user;
    const userId = user?.id;

    const reports = await DailyReportModel.findByUserId(userId, Number(limit));

    res.json({
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: reports.length,
        pages: Math.ceil(reports.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

export default router;
