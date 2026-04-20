const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${(process.env.CLIENT_URL || "http://localhost:5200").trim()}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      // Stateless — no DB. Build user object directly from Google profile.
      const user = {
        id: profile.id,
        email: profile.emails?.[0]?.value || null,
        name: profile.displayName,
        picture: profile.photos?.[0]?.value || null,
      };
      return done(null, user);
    },
  ),
);

// serializeUser / deserializeUser not needed with session:false + JWT,
// but passport requires them to be defined.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
