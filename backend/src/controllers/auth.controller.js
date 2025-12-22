import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Generate JWT Token
const generateToken = (userId, email, userType) => {
  return jwt.sign(
    { userId, email, userType },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, fullName, userType, phone } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, and full name are required'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user (PostgreSQL returns the inserted row with RETURNING)
    const userResult = await query(
      `INSERT INTO users (email, password_hash, user_type, is_verified, is_active) 
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
      [email, passwordHash, userType || 'customer', false, true]
    );

    const userId = userResult[0].user_id;

    // Create user profile
    await query(
      `INSERT INTO user_profiles (user_id, full_name, phone) 
       VALUES ($1, $2, $3)`,
      [userId, fullName, phone || null]
    );

    // Generate token
    const token = generateToken(userId, email, userType || 'customer');

    // Get complete user data
    const userDataResult = await query(
      `SELECT u.user_id, u.email, u.user_type, u.is_verified, 
              up.full_name, up.avatar_url, up.phone, up.location
       FROM users u
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );
    
    const user = userDataResult[0];

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          isVerified: user.is_verified,
          avatarUrl: user.avatar_url,
          phone: user.phone,
          location: user.location
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed. Please try again.'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Get user
    const users = await query(
      `SELECT u.user_id, u.email, u.password_hash, u.user_type, u.is_verified, u.is_active,
              up.full_name, up.avatar_url, up.phone, up.location
       FROM users u
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.user_id, user.email, user.user_type);

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE user_id = $1',
      [user.user_id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          isVerified: user.is_verified,
          avatarUrl: user.avatar_url,
          phone: user.phone,
          location: user.location
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again.'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await query(
      `SELECT u.user_id, u.email, u.user_type, u.is_verified,
              up.full_name, up.avatar_url, up.bio, up.phone, up.location, up.city, up.state
       FROM users u
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );
    
    const user = userResult[0];

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          isVerified: user.is_verified,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          city: user.city,
          state: user.state
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user data'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, location, city, state, bio, avatarUrl } = req.body;

    // Update user profile (only overwrite fields provided)
    await query(
      `UPDATE user_profiles 
       SET 
         full_name    = COALESCE($1, full_name),
         phone        = COALESCE($2, phone),
         location     = COALESCE($3, location),
         city         = COALESCE($4, city),
         state        = COALESCE($5, state),
         bio          = COALESCE($6, bio),
         avatar_url   = COALESCE($7, avatar_url),
         updated_at   = NOW()
       WHERE user_id = $8`,
      [fullName, phone, location, city, state, bio, avatarUrl, userId]
    );

    // Get updated user data
    const userResult = await query(
      `SELECT u.user_id, u.email, u.user_type, u.is_verified,
              up.full_name, up.avatar_url, up.bio, up.phone, up.location, up.city, up.state
       FROM users u
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );
    
    const user = userResult[0];

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          isVerified: user.is_verified,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          city: user.city,
          state: user.state
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // In a more complete implementation, you would invalidate the token here
    // For now, we'll just send a success response
    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
};

