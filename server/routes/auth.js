import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many auth requests, please try again later' },
});

router.post('/sync', authLimiter, verifyFirebaseToken, async (req, res) => {
  try {
    const { firebaseUser } = req;
    const updates = {
      email: firebaseUser.email || req.user.email,
      name: firebaseUser.name || req.user.name,
      avatar: firebaseUser.picture || req.user.avatar,
    };

    const user = await User.findOneAndUpdate(
      { firebaseUid: firebaseUser.uid },
      { $set: updates },
      { new: true }
    );

    res.json({
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(500).json({ message: 'Failed to sync user profile' });
  }
});

router.get('/me', verifyFirebaseToken, async (req, res) => {
  res.json({
    id: req.user._id,
    firebaseUid: req.user.firebaseUid,
    email: req.user.email,
    name: req.user.name,
    avatar: req.user.avatar,
    role: req.user.role,
  });
});

export default router;
