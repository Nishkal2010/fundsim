const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'missing',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing',
  callbackURL: process.env.NODE_ENV === 'production'
    ? `${process.env.CLIENT_URL}/api/auth/google/callback`
    : `http://localhost:${process.env.PORT || 3002}/api/auth/google/callback`,
}, (accessToken, refreshToken, profile, done) => {
  // Stateless — no DB. Build user object directly from Google profile.
  const user = {
    id: profile.id,
    email: profile.emails?.[0]?.value || null,
    name: profile.displayName,
    picture: profile.photos?.[0]?.value || null,
  };
  return done(null, user);
}));

// serializeUser / deserializeUser not needed with session:false + JWT,
// but passport requires them to be defined.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
