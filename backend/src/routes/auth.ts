import express from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel, UserRole } from '../models/User';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// Register new user
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(Object.values(UserRole)).withMessage('Invalid role'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role = UserRole.INTERN, department } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password,
      role,
      department,
      isActive: true
    });

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      isActive: user.isActive
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with password
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await UserModel.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      isActive: user.isActive
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const user = (req as any).user;
    const userResponse = {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      department: user?.department,
      avatar: user?.avatar,
      isActive: user?.isActive,
      createdAt: user?.createdAt
    };

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, department, avatar } = req.body;
    const user = (req as any).user;
    const userId = user?.id;

    const updatedUser = await UserModel.update(
      userId,
      { name, department, avatar }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      avatar: updatedUser.avatar,
      isActive: updatedUser.isActive
    };

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

export default router;
