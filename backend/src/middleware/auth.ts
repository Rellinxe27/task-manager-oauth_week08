import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const ensureAuthenticated = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    message: 'Authentication required. Please login first.',
    loginUrl: '/auth/google'
  });
};

export const ensureGuest = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
    return;
  }
  next();
};
