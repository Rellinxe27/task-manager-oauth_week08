import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import User from '../models/User';
import { IUser } from '../types';

// Serialize user for the session
// This determines what data is stored in the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          displayName: profile.displayName,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          picture: profile.photos?.[0]?.value
        });

        done(null, user);
      } catch (error) {
        console.error('Error in Google Strategy:', error);
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;
