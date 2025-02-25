const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT settings
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '1d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

// Generate access token
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId,
      role: role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE }
  );
};

// Verify token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      expired: false,
      decoded
    };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      decoded: null
    };
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return {
      valid: true,
      expired: false,
      decoded
    };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      decoded: null
    };
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};