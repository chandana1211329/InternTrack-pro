import bcrypt from 'bcryptjs';
import { db } from '../config/firebase';

export enum UserRole {
  ADMIN = 'ADMIN',
  INTERN = 'INTERN'
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  private static collection = db.collection('users');

  static async create(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const now = new Date();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const userDoc = {
      ...userData,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.collection.add(userDoc);
    return {
      id: docRef.id,
      ...userDoc
    };
  }

  static async findById(id: string): Promise<IUser | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data()
    } as IUser;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as IUser;
  }

  static async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    const updateDoc = {
      ...updateData,
      updatedAt: new Date()
    };

    if (updateData.password) {
      updateDoc.password = await bcrypt.hash(updateData.password, 12);
    }

    await this.collection.doc(id).update(updateDoc);
    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch {
      return false;
    }
  }

  static async findAll(filter: { role?: UserRole; isActive?: boolean } = {}): Promise<IUser[]> {
    let query = this.collection as any;
    
    if (filter.role) {
      query = query.where('role', '==', filter.role);
    }
    if (filter.isActive !== undefined) {
      query = query.where('isActive', '==', filter.isActive);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as IUser[];
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default UserModel;
