require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

require('./config/passport');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3002;
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5200').trim();

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`FundSim server running on http://localhost:${PORT}`));

module.exports = app;
