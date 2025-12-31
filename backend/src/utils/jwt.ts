import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models';

export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
