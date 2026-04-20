const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5200').trim();
const JWT_SECRET = process.env.SESSION_SECRET;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, please try again later.' },
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Kick off Google OAuth
router.get('/google', authLimiter, passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Google callback
router.get('/google/callback',
  authLimiter,
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/?error=auth_failed`, session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name, picture: req.user.picture },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('fundsim_token', token, COOKIE_OPTIONS);
    res.redirect(CLIENT_URL);
  }
);

// Get current user
router.get('/me', (req, res) => {
  const token = req.cookies?.fundsim_token;
  if (!token) return res.json({ user: null });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    return res.json({ user });
  } catch {
    return res.json({ user: null });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('fundsim_token', COOKIE_OPTIONS);
  res.json({ success: true });
});

module.exports = router;
