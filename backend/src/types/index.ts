import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  userId: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface GraphQLContext {
  req: AuthRequest;
  user?: IUser;
}
