import { db } from '../config/firebase';

export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IDailyReport {
  id: string;
  userId: string;
  date: string;
  taskTitle: string;
  taskDescription: string;
  toolsUsed: string[];
  timeSpent: string;
  status: ReportStatus;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DailyReportModel {
  private static collection = db.collection('dailyReports');

  static async create(reportData: Omit<IDailyReport, 'id' | 'createdAt' | 'updatedAt' | 'submittedAt'>): Promise<IDailyReport> {
    const now = new Date();
    
    const reportDoc = {
      ...reportData,
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.collection.add(reportDoc);
    return {
      id: docRef.id,
      ...reportDoc
    };
  }

  static async findById(id: string): Promise<IDailyReport | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data()
    } as IDailyReport;
  }

  static async findByUserAndDate(userId: string, date: string): Promise<IDailyReport | null> {
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
    } as IDailyReport;
  }

  static async update(id: string, updateData: Partial<IDailyReport>): Promise<IDailyReport | null> {
    const updateDoc = {
      ...updateData,
      updatedAt: new Date()
    };

    // Set reviewedAt if status is being updated to APPROVED or REJECTED
    if (updateData.status && ['APPROVED', 'REJECTED'].includes(updateData.status)) {
      updateDoc.reviewedAt = new Date();
    }

    await this.collection.doc(id).update(updateDoc);
    return this.findById(id);
  }

  static async findByUserId(userId: string, limit?: number): Promise<IDailyReport[]> {
    let query = this.collection.where('userId', '==', userId).orderBy('date', 'desc') as any;
    
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as IDailyReport[];
  }

  static async findAll(filter: { 
    userId?: string; 
    status?: ReportStatus; 
    date?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<IDailyReport[]> {
    let query = this.collection as any;
    
    if (filter.userId) {
      query = query.where('userId', '==', filter.userId);
    }
    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }
    if (filter.date) {
      query = query.where('date', '==', filter.date);
    }
    if (filter.startDate) {
      query = query.where('date', '>=', filter.startDate);
    }
    if (filter.endDate) {
      query = query.where('date', '<=', filter.endDate);
    }

    query = query.orderBy('date', 'desc');

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as IDailyReport[];
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch {
      return false;
    }
  }

  static async getReportStats(userId?: string): Promise<any> {
    let query = this.collection as any;
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();
    const reports = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as IDailyReport[];

    const stats = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'PENDING').length,
      approved: reports.filter(r => r.status === 'APPROVED').length,
      rejected: reports.filter(r => r.status === 'REJECTED').length,
      thisMonth: reports.filter(r => {
        const reportDate = new Date(r.date);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && 
               reportDate.getFullYear() === now.getFullYear();
      }).length
    };

    return stats;
  }
}

export default DailyReportModel;
