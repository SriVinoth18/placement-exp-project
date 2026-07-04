import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function verifyAdminToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split('Bearer ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured on the server');
      return res.status(500).json({ message: 'Internal server configuration error' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Admin account not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: '403 - Access Denied' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin token verification error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
}
