import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { protect } from '../middleware/auth.js';
import passport from '../config/passport.js';


const router = Router();

// ── SIGNUP 
router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('userId').trim().isAlphanumeric().isLength({ min: 3 }).withMessage('Username must be 3+ alphanumeric characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be 8+ characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { name, userId, email, password } = req.body;

  try {
    const exists = await User.findOne({ $or: [{ email }, { userId }] });
    if (exists)
      return res.status(409).json({
        error: exists.email === email
          ? 'Email already registered'
          : 'Username already taken'
      });

    const user = await User.create({ name, userId, email, password });

    const accessToken  = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id:           user._id,
        name:         user.name,
        userId:       user.userId,
        email:        user.email,
        profilePhoto: user.profilePhoto ?? null,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ── SIGNIN ────────────────────────────────────────────────
router.post('/signin', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const accessToken  = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id:           user._id,
        name:         user.name,
        userId:       user.userId,
        email:        user.email,
        profilePhoto: user.profilePhoto ?? null,
      },
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Server error during signin' });
  }
});

// ── REFRESH TOKEN ─────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const stored  = await RefreshToken.findOne({ token: refreshToken });
    if (!stored)
      return res.status(401).json({ error: 'Invalid or expired refresh token' });

    await stored.deleteOne();

    const newAccess  = signAccessToken(decoded.id);
    const newRefresh = signRefreshToken(decoded.id);

    await RefreshToken.create({
      user: decoded.id,
      token: newRefresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    res.status(401).json({ error: 'Refresh token expired or invalid' });
  }
});

// ── ME ────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  const u = req.user;
  res.json({
    user: {
      id:           u._id,
      name:         u.name,
      userId:       u.userId,
      email:        u.email,
      profilePhoto: u.profilePhoto ?? null,
    },
  });
});

// ── SIGNOUT ───────────────────────────────────────────────
router.post('/signout', protect, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken)
    await RefreshToken.deleteOne({ token: refreshToken });
  res.json({ message: 'Signed out successfully' });
});




// ── GOOGLE AUTH ───────────────────────────────────────────


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}?auth=failed` }),
  async (req, res) => {
    try {
      const user = req.user;

      const accessToken  = signAccessToken(user._id);
      const refreshToken = signRefreshToken(user._id);

      await RefreshToken.create({
        user:      user._id,
        token:     refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });


      res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}?auth=failed`);
    }
  }
);

export default router;