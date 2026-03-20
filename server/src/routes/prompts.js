import { Router } from 'express';
import Prompt from '../models/Prompt.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { uploadToS3 } from '../lib/s3.js';
import { deleteFromS3 } from '../lib/s3.js';
import Notification from '../models/Notification.js';



const router = Router();
const upload = uploadToS3('prompts');

// Multer error wrapper — converts multer errors to clean JSON
const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(err); // passes to errorHandler
    next();
  });
};

// GET /api/prompts
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;

    const prompts = await Prompt.find(filter)

      .populate('creator', 'name userId email profilePhoto')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(prompts);
  } catch (err) {
    next(err);
  }
});

// POST /api/prompts
router.post('/', protect, uploadMiddleware, async (req, res, next) => {
  const s3Key = req.file?.key ?? null; // save key for cleanup if DB fails

  try {
    const { title, content, category } = req.body;

    // ── Presence checks ───────────────────────────────────
    if (!title || !content || !category)
      return res.status(400).json({ error: 'title, content and category are required' });

    // ── Length validation ─────────────────────────────────
    if (title.length > 100)
      return res.status(400).json({ error: 'Title must be under 100 characters' });
    if (content.length > 5000)
      return res.status(400).json({ error: 'Content must be under 5000 characters' });
    if (category.length > 50)
      return res.status(400).json({ error: 'Invalid category' });

    const prompt = await Prompt.create({
      title:   title.trim(),
      content: content.trim(),
      category,
      image:   req.file?.location ?? null,
      creator: req.user._id,
    });

    await prompt.populate('creator', 'name userId profilePhoto');
    res.status(201).json(prompt);

  } catch (err) {
    // ── Cleanup S3 if DB save failed ──────────────────────
    if (s3Key) {
      await deleteFromS3(s3Key).catch(e =>
        console.error('S3 cleanup failed:', e.message)
      );
    }
    next(err);
  }
});

// POST /api/prompts/:id/like
// POST /api/prompts/:id/like
router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });

    const liked = prompt.likes.some(id => id.equals(req.user._id));

    if (liked) {
      prompt.likes.pull(req.user._id);
    } else {
      prompt.likes.addToSet(req.user._id);
    }

    await prompt.save();

    // ✅ Only create notification if not already exists
    if (!liked && !prompt.creator.equals(req.user._id)) {
      const exists = await Notification.findOne({
        recipient: prompt.creator,
        sender:    req.user._id,
        type:      'like',
        prompt:    prompt._id,
      });

      if (!exists) {
        await Notification.create({
          recipient: prompt.creator,
          sender:    req.user._id,
          type:      'like',
          prompt:    prompt._id,
        }).catch(e => console.error('Notification error:', e.message));
      }
    }

    res.json({ likes: prompt.likes.length, liked: !liked });

  } catch (err) {
    next(err);
  }
});
// DELETE /api/prompts/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id);

    // Not found
    if (!prompt)
      return res.status(404).json({ error: 'Prompt not found' });

    // Only the creator can delete
    if (!prompt.creator.equals(req.user._id))
      return res.status(403).json({ error: 'Not authorized to delete this prompt' });

    // Delete image from S3 if exists
    if (prompt.image) {
      const key = prompt.image.split('.amazonaws.com/')[1];
      if (key) {
        await deleteFromS3(key).catch(e =>
          console.error('S3 delete failed:', e.message)
        );
      }
    }

    await prompt.deleteOne();
    res.json({ message: 'Prompt deleted successfully' });

  } catch (err) {
    next(err);
  }
});

export default router;