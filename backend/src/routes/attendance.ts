import express from 'express';
import { body, validationResult } from 'express-validator';
import { AttendanceModel, AttendanceStatus } from '../models';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// Clock in
router.post('/clock-in', authenticate, [
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('clockInTime').matches(/^\d{2}:\d{2}$/).withMessage('Time must be in HH:MM format')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, clockInTime } = req.body;
    const user = (req as any).user;
    const userId = user?.id;

    // Check if attendance already exists for this date
    const existingAttendance = await AttendanceModel.findByUserAndDate(userId, date);
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded for this date' });
    }

    // Determine status based on clock-in time (assuming 9:00 AM as start time)
    const [hour, minute] = clockInTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    const startMinutes = 9 * 60; // 9:00 AM
    
    let status: AttendanceStatus = 'PRESENT';
    if (totalMinutes > startMinutes + 15) { // 15 minutes grace period
      status = 'LATE';
    }

    const attendance = await AttendanceModel.create({
      userId,
      date,
      clockInTime,
      status,
      breaks: [],
      totalBreakMinutes: 0
    });

    res.status(201).json({
      message: 'Clocked in successfully',
      attendance
    });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ message: 'Server error during clock in' });
  }
});

// Clock out
router.post('/clock-out', authenticate, [
  body('clockOutTime').matches(/^\d{2}:\d{2}$/).withMessage('Time must be in HH:MM format')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clockOutTime } = req.body;
    const user = (req as any).user;
    const userId = user?.id;
    const today = new Date().toISOString().split('T')[0];

    // Get today's attendance
    const attendance = await AttendanceModel.findByUserAndDate(userId, today);
    if (!attendance) {
      return res.status(400).json({ message: 'No attendance record found for today' });
    }

    if (attendance.clockOutTime) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    // Check if currently on break and end it automatically
    const currentBreak = await AttendanceModel.getCurrentBreak(attendance.id);
    if (currentBreak) {
      await AttendanceModel.endBreak(attendance.id);
    }

    // Update attendance with clock out time
    const updatedAttendance = await AttendanceModel.update(attendance.id, {
      clockOutTime
    });

    res.status(200).json({
      message: 'Clocked out successfully',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Server error during clock out' });
  }
});

// Get today's attendance for current user
router.get('/today', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const user = (req as any).user;
    const userId = user?.id;

    const attendance = await AttendanceModel.findByUserAndDate(userId, today);

    res.json({ attendance });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ message: 'Server error fetching today attendance' });
  }
});

// Start break
router.post('/start-break', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const user = (req as any).user;
    const userId = user?.id;
    const today = new Date().toISOString().split('T')[0];

    // Get today's attendance
    const attendance = await AttendanceModel.findByUserAndDate(userId, today);
    if (!attendance) {
      return res.status(400).json({ message: 'No attendance record found for today' });
    }

    if (attendance.clockOutTime) {
      return res.status(400).json({ message: 'Cannot take break after clocking out' });
    }

    // Check if already on break
    const currentBreak = await AttendanceModel.getCurrentBreak(attendance.id);
    if (currentBreak) {
      return res.status(400).json({ message: 'Already on break' });
    }

    const updatedAttendance = await AttendanceModel.startBreak(attendance.id);
    
    res.status(200).json({
      message: 'Break started successfully',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Start break error:', error);
    res.status(500).json({ message: 'Server error starting break' });
  }
});

// End break
router.post('/end-break', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const user = (req as any).user;
    const userId = user?.id;
    const today = new Date().toISOString().split('T')[0];

    // Get today's attendance
    const attendance = await AttendanceModel.findByUserAndDate(userId, today);
    if (!attendance) {
      return res.status(400).json({ message: 'No attendance record found for today' });
    }

    // Check if currently on break
    const currentBreak = await AttendanceModel.getCurrentBreak(attendance.id);
    if (!currentBreak) {
      return res.status(400).json({ message: 'No active break found' });
    }

    const updatedAttendance = await AttendanceModel.endBreak(attendance.id);
    
    res.status(200).json({
      message: 'Break ended successfully',
      attendance: updatedAttendance,
      breakDuration: currentBreak.breakDuration
    });
  } catch (error) {
    console.error('End break error:', error);
    res.status(500).json({ message: 'Server error ending break' });
  }
});

// Get current break status
router.get('/break-status', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const user = (req as any).user;
    const userId = user?.id;
    const today = new Date().toISOString().split('T')[0];

    // Get today's attendance
    const attendance = await AttendanceModel.findByUserAndDate(userId, today);
    if (!attendance) {
      return res.status(200).json({ 
        onBreak: false, 
        hasClockedIn: false,
        message: 'No attendance record found for today' 
      });
    }

    const currentBreak = await AttendanceModel.getCurrentBreak(attendance.id);
    
    res.status(200).json({
      onBreak: !!currentBreak,
      hasClockedIn: true,
      hasClockedOut: !!attendance.clockOutTime,
      currentBreak,
      totalBreakMinutes: attendance.totalBreakMinutes || 0,
      breaks: attendance.breaks
    });
  } catch (error) {
    console.error('Break status error:', error);
    res.status(500).json({ message: 'Server error fetching break status' });
  }
});

export default router;
