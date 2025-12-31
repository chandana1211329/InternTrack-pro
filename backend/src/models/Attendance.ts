import { db } from '../config/firebase';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface IBreak {
  id: string;
  breakStartTime: string;
  breakEndTime?: string;
  breakDuration?: number; // in minutes
}

export interface IAttendance {
  id: string;
  userId: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  status: AttendanceStatus;
  totalHours?: number;
  totalBreakMinutes?: number;
  breaks: IBreak[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AttendanceModel {
  private static collection = db.collection('attendance');

  static async create(attendanceData: Omit<IAttendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAttendance> {
    const now = new Date();
    
    const attendanceDoc = {
      ...attendanceData,
      breaks: attendanceData.breaks || [],
      totalBreakMinutes: attendanceData.totalBreakMinutes || 0,
      createdAt: now,
      updatedAt: now
    };

    // Calculate total hours if clock out time is provided
    if (attendanceData.clockInTime && attendanceData.clockOutTime) {
      attendanceDoc.totalHours = this.calculateTotalHours(attendanceData.clockInTime, attendanceData.clockOutTime);
    }

    const docRef = await this.collection.add(attendanceDoc);
    return {
      id: docRef.id,
      ...attendanceDoc
    };
  }

  static async findById(id: string): Promise<IAttendance | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data()
    } as IAttendance;
  }

  static async findByUserAndDate(userId: string, date: string): Promise<IAttendance | null> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .where('date', '==', date)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as IAttendance;
  }

  static async update(id: string, updateData: Partial<IAttendance>): Promise<IAttendance | null> {
    const updateDoc = {
      ...updateData,
      updatedAt: new Date()
    };

    // Recalculate total hours if clock times are updated
    if (updateData.clockInTime || updateData.clockOutTime) {
      const current = await this.findById(id);
      if (current) {
        const clockInTime = updateData.clockInTime || current.clockInTime;
        const clockOutTime = updateData.clockOutTime || current.clockOutTime;
        
        if (clockInTime && clockOutTime) {
          updateDoc.totalHours = this.calculateTotalHours(clockInTime, clockOutTime);
        }
      }
    }

    await this.collection.doc(id).update(updateDoc);
    return this.findById(id);
  }

  static async findByUserId(userId: string, limit?: number): Promise<IAttendance[]> {
    let query = this.collection.where('userId', '==', userId).orderBy('date', 'desc') as any;
    
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as IAttendance[];
  }

  static async findAll(filter: { userId?: string; date?: string; status?: AttendanceStatus } = {}): Promise<IAttendance[]> {
    let query = this.collection as any;
    
    if (filter.userId) {
      query = query.where('userId', '==', filter.userId);
    }
    if (filter.date) {
      query = query.where('date', '==', filter.date);
    }
    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as IAttendance[];
  }

  static async getAttendanceStats(userId?: string): Promise<any> {
    let query = this.collection as any;
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();
    const attendance = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as IAttendance[];

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'PRESENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      averageHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length || 0
    };

    return stats;
  }

  private static calculateTotalHours(clockInTime: string, clockOutTime: string, totalBreakMinutes: number = 0): number {
    const [inHour, inMin] = clockInTime.split(':').map(Number);
    const [outHour, outMin] = clockOutTime.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    let totalMinutes = outMinutes - inMinutes;
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Handle overnight shifts
    }
    
    // Subtract break time
    totalMinutes = totalMinutes - totalBreakMinutes;
    
    return Math.round((totalMinutes / 60) * 100) / 100;
  }

  // Break management methods
  static async startBreak(attendanceId: string): Promise<IAttendance | null> {
    const attendance = await this.findById(attendanceId);
    if (!attendance) return null;

    const newBreak: IBreak = {
      id: Math.random().toString(36).substr(2, 9),
      breakStartTime: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    attendance.breaks.push(newBreak);
    attendance.updatedAt = new Date();

    await this.collection.doc(attendanceId).update({
      breaks: attendance.breaks,
      updatedAt: attendance.updatedAt
    });

    return attendance;
  }

  static async endBreak(attendanceId: string): Promise<IAttendance | null> {
    const attendance = await this.findById(attendanceId);
    if (!attendance) return null;

    // Find the last break that doesn't have an end time
    const lastBreak = attendance.breaks.find(b => !b.breakEndTime);
    if (!lastBreak) return null;

    const endTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Calculate break duration in minutes
    const [startHour, startMin] = lastBreak.breakStartTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    let breakDuration = endMinutes - startMinutes;
    if (breakDuration < 0) {
      breakDuration += 24 * 60; // Handle overnight breaks
    }

    lastBreak.breakEndTime = endTime;
    lastBreak.breakDuration = breakDuration;

    // Update total break minutes
    attendance.totalBreakMinutes = (attendance.totalBreakMinutes || 0) + breakDuration;

    // Recalculate total hours if clock out time exists
    if (attendance.clockOutTime) {
      attendance.totalHours = this.calculateTotalHours(
        attendance.clockInTime, 
        attendance.clockOutTime, 
        attendance.totalBreakMinutes
      );
    }

    attendance.updatedAt = new Date();

    await this.collection.doc(attendanceId).update({
      breaks: attendance.breaks,
      totalBreakMinutes: attendance.totalBreakMinutes,
      totalHours: attendance.totalHours,
      updatedAt: attendance.updatedAt
    });

    return attendance;
  }

  static async getCurrentBreak(attendanceId: string): Promise<IBreak | null> {
    const attendance = await this.findById(attendanceId);
    if (!attendance) return null;

    // Find the break that doesn't have an end time (currently active break)
    return attendance.breaks.find(b => !b.breakEndTime) || null;
  }
}

export default AttendanceModel;
