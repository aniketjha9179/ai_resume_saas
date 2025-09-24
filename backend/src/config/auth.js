const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password');
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google Strategy (for Gmail integration)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      callbackURL: process.env.GMAIL_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          // Update tokens
          user.googleAccessToken = accessToken;
          user.googleRefreshToken = refreshToken;
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          user.googleAccessToken = accessToken;
          user.googleRefreshToken = refreshToken;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profilePicture: profile.photos[0].value,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
          isVerified: true,
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// LinkedIn Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_REDIRECT_URI,
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ linkedinId: profile.id });
        
        if (user) {
          user.linkedinAccessToken = accessToken;
          user.linkedinRefreshToken = refreshToken;
          await user.save();
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.linkedinId = profile.id;
          user.linkedinAccessToken = accessToken;
          user.linkedinRefreshToken = refreshToken;
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          linkedinId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profilePicture: profile.photos[0].value,
          linkedinAccessToken: accessToken,
          linkedinRefreshToken: refreshToken,
          isVerified: true,
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;