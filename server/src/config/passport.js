import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // Update profile photo if from Google
      if (!user.profilePhoto && profile.photos[0]?.value) {
        user.profilePhoto = profile.photos[0].value;
        await user.save();
      }
      return done(null, user);
    }


    user = await User.create({
      name:         profile.displayName,
      userId:       profile.emails[0].value.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 999),
      email:        profile.emails[0].value,
      password:     Math.random().toString(36).slice(-16) + 'Aa1!', // random strong password
      profilePhoto: profile.photos[0]?.value || null,
      isVerified:   true,
    });

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

export default passport;