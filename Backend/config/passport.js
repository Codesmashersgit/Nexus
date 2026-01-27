const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../Model/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://nexus-ksiz.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ✅ SAFETY CHECK
        if (!profile.emails || !profile.emails.length) {
          return done(new Error("No email returned from Google"), null);
        }

        const email = profile.emails[0].value;

        // ✅ Check by email first
        let user = await User.findOne({ email });

        if (user && !user.googleId) {
          user.googleId = profile.id; // link Google account
          await user.save();
        }

        // ✅ Create new user if not exists
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email,
            username: profile.displayName,
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Google OAuth Error:", err);
        return done(err, null);
      }
    }
  )
);
