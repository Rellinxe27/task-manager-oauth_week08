import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

// Middleware to check if user is authenticated
// Protects routes that require login
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

// Middleware to check if user is guest (not authenticated)
// Redirects logged-in users away from login pages
export const ensureGuest = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
        return;
    }
    next();
};