import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserModel, UserRole } from '../models/User';
import { AttendanceModel } from '../models/Attendance';
import { DailyReportModel } from '../models/DailyReport';

const router: express.Router = express.Router();

// Get all users (admin only)
router.get('/users', authenticate, authorize([UserRole.ADMIN]), async (req: express.Request, res: express.Response) => {
  try {
    const users = await UserModel.findAll();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get dashboard stats with real data
router.get('/dashboard-stats', authenticate, authorize([UserRole.ADMIN]), async (req: express.Request, res: express.Response) => {
  try {
    const users = await UserModel.findAll();
    const attendance = await AttendanceModel.findAll();
    const reports = await DailyReportModel.findAll();
    
    // Filter interns only
    const interns = users.filter(user => user.role === UserRole.INTERN);
    
    res.json({
      message: 'Admin dashboard stats',
      stats: {
        totalUsers: users.length,
        totalInterns: interns.length,
        totalAttendance: attendance.length,
        totalReports: reports.length,
        activeUsers: users.filter(user => user.isActive).length
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

// Get user attendance (admin only)
router.get('/users/:userId/attendance', authenticate, authorize([UserRole.ADMIN]), async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const attendance = await AttendanceModel.findAll({ userId });
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get user attendance error:', error);
    res.status(500).json({ message: 'Server error fetching user attendance' });
  }
});

// Get detailed intern information
router.get('/interns/:userId/details', authenticate, authorize([UserRole.ADMIN]), async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    
    // Get user info
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user attendance
    const attendance = await AttendanceModel.findAll({ userId });
    
    // Get user reports
    const reports = await DailyReportModel.findAll({ userId });
    
    // Calculate statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    
    res.json({
      success: true,
      intern: {
        ...user,
        password: undefined // Remove password from response
      },
      statistics: {
        totalDays,
        presentDays,
        totalHours,
        attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0
      },
      attendance,
      reports
    });
  } catch (error) {
    console.error('Get intern details error:', error);
    res.status(500).json({ message: 'Server error fetching intern details' });
  }
});

export default router;
