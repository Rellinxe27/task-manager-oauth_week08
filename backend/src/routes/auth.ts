import express, { Request, Response } from 'express';
import passport from 'passport';
import { AuthRequest } from '../types';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login-failed' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

router.get('/logout', (req: AuthRequest, res: Response) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error logging out' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

router.get('/status', (req: AuthRequest, res: Response) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            authenticated: true,
            user: {
                id: req.user!._id,
                email: req.user!.email,
                displayName: req.user!.displayName,
                picture: req.user!.picture
            }
        });
    } else {
        res.json({ success: true, authenticated: false, message: 'Not authenticated' });
    }
});

router.get('/profile', (req: AuthRequest, res: Response) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    res.json({
        success: true,
        user: {
            id: req.user!._id,
            googleId: req.user!.googleId,
            email: req.user!.email,
            displayName: req.user!.displayName,
            firstName: req.user!.firstName,
            lastName: req.user!.lastName,
            picture: req.user!.picture,
            createdAt: req.user!.createdAt,
            lastLogin: req.user!.lastLogin
        }
    });
});

export default router;