import { Router } from 'express';
import User from '../models/User.js';
import Prompt from '../models/Prompt.js';
import { protect } from '../middleware/auth.js';
import { uploadToS3 } from '../lib/s3.js';
import Notification from '../models/Notification.js';
const router = Router();
const avatarUpload = uploadToS3('avatars');

// GET /api/users/search
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  const users = await User.find({
    $or: [
      { name: new RegExp(q, 'i') },
      { userId: new RegExp(q, 'i') },
    ],
  }).select('name userId email profilePhoto').limit(10); 
  res.json(users);
});

// GET /api/users/:email/profile
router.get('/:email/profile', async (req, res) => {
  const user = await User.findOne({ email: req.params.email })
    .select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });

  const prompts = await Prompt.find({ creator: user._id })
    .sort({ createdAt: -1 });

  res.json({
    user: {
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length,
    },
    prompts,
  });
});

// POST /api/users/:email/follow
router.post('/:email/follow', protect, async (req, res) => {
  const target = await User.findOne({ email: req.params.email });
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target._id.equals(req.user._id))
    return res.status(400).json({ error: 'Cannot follow yourself' });

  target.followers.addToSet(req.user._id);
  req.user.following.addToSet(target._id);
  await Promise.all([target.save(), req.user.save()]);
  res.json({ followed: true });

await Notification.create({
  recipient: target._id,
  sender:    req.user._id,
  type:      'follow',
});
});

// DELETE /api/users/:email/follow
router.delete('/:email/follow', protect, async (req, res) => {
  const target = await User.findOne({ email: req.params.email });
  if (!target) return res.status(404).json({ error: 'User not found' });

  target.followers.pull(req.user._id);
  req.user.following.pull(target._id);
  await Promise.all([target.save(), req.user.save()]);
  res.json({ followed: false });
});

// PATCH /api/users/me/avatar — upload profile photo to S3

router.patch('/me/avatar', protect, avatarUpload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  req.user.profilePhoto = req.file.location;
  await req.user.save();
  res.json({ profilePhoto: req.user.profilePhoto });
});

export default router;