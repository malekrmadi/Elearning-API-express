const User = require('./models/User');
const { generateToken, generateRefreshToken } = require('../config/auth');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User data (username, email, password, etc.)
   * @returns {Object} - User object and tokens
   */
  async register(userData) {
    try {
      const { username, email } = userData;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      
      if (existingUser) {
        throw new Error(
          existingUser.email === email 
            ? 'Email already in use' 
            : 'Username already taken'
        );
      }
      
      // Create the user
      const user = await User.create(userData);
      
      // Generate tokens
      const accessToken = generateToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
      
      return {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Login a user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object} - User object and tokens
   */
  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check if user is active
      if (!user.isActive) {
        throw new Error('Your account has been deactivated');
      }
      
      // Check if password matches
      const isMatch = await user.matchPassword(password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      
      // Generate tokens
      const accessToken = generateToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
      
      return {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Refresh access token using refresh token
   * @param {String} refreshToken - User's refresh token
   * @returns {Object} - New access token and refresh token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token & get user id
      const { verifyRefreshToken } = require('../config/auth');
      const decoded = verifyRefreshToken(refreshToken);
      
      if (!decoded.valid) {
        throw new Error('Invalid or expired refresh token');
      }
      
      // Get user
      const user = await User.findById(decoded.decoded.id);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }
      
      // Generate new tokens
      const newAccessToken = generateToken(user._id, user.role);
      const newRefreshToken = generateRefreshToken(user._id);
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Send password reset email
   * @param {String} email - User email
   * @returns {String} - Reset token
   */
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new Error('User not found with this email');
      }
      
      // Generate reset token
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });
      
      return resetToken;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Reset password using token
   * @param {String} token - Reset token
   * @param {String} newPassword - New password
   * @returns {Boolean} - Success status
   */
  async resetPassword(token, newPassword) {
    try {
      // Hash the token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Token is invalid or has expired');
      }
      
      // Set new password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      await user.save();
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update user password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Boolean} - Success status
   */
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check current password
      const isMatch = await user.matchPassword(currentPassword);
      
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }
      
      // Set new password
      user.password = newPassword;
      await user.save();
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();