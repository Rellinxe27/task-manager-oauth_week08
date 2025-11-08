import express from 'express';
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

router.get('/logout', (req, res) => {
    const authReq = req as AuthRequest;
    authReq.logout((err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error logging out' });
            return;
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

router.get('/status', (req, res) => {
    const authReq = req as AuthRequest;
    if (authReq.isAuthenticated()) {
        res.json({
            success: true,
            authenticated: true,
            user: {
                id: authReq.user!._id,
                email: authReq.user!.email,
                displayName: authReq.user!.displayName,
                picture: authReq.user!.picture
            }
        });
    } else {
        res.json({ success: true, authenticated: false, message: 'Not authenticated' });
    }
});

router.get('/profile', (req, res) => {
    const authReq = req as AuthRequest;
    if (!authReq.isAuthenticated()) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }

    res.json({
        success: true,
        user: {
            id: authReq.user!._id,
            googleId: authReq.user!.googleId,
            email: authReq.user!.email,
            displayName: authReq.user!.displayName,
            firstName: authReq.user!.firstName,
            lastName: authReq.user!.lastName,
            picture: authReq.user!.picture,
            createdAt: authReq.user!.createdAt,
            lastLogin: authReq.user!.lastLogin
        }
    });
});

export default router;