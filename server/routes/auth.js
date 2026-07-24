import express from 'express';
import jwt from 'jsonwebtoken';
import { UserStore } from '../models/user.js';
import { authenticateToken, JWT_SECRET } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate JWT token (valid for 7 days)
function generateToken(user) {
  return jwt.sign(
    { userId: user.id || user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await UserStore.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const newUser = await UserStore.createUser({ name, email, password });
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id || newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    const user = await UserStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await UserStore.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({
      success: true,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Auth Check Error:', error);
    return res.status(500).json({ success: false, error: 'Server error verifying session.' });
  }
});

export default router;
