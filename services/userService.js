const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');

class UserService {
  /**
   * Get all users with pagination and filtering
   * @param {Object} query - Query parameters for filtering
   * @param {Number} page - Page number
   * @param {Number} limit - Number of results per page
   * @returns {Object} - Users and pagination info
   */
  async getUsers(query = {}, page = 1, limit = 10) {
    try {
      const filter = {};
      
      // Apply filters if provided
      if (query.role) filter.role = query.role;
      if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
      if (query.search) {
        filter.$or = [
          { username: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
          { firstName: { $regex: query.search, $options: 'i' } },
          { lastName: { $regex: query.search, $options: 'i' } }
        ];
      }
      
      // Count total documents for pagination
      const total = await User.countDocuments(filter);
      
      // Get users with pagination
      const users = await User.find(filter)
        .select('-password')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @returns {Object} - User object
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get associated profile (student or teacher) if available
      let profile = null;
      if (user.role === 'student') {
        profile = await Student.findOne({ userId }).populate('classrooms', 'name subject');
      } else if (user.role === 'teacher') {
        profile = await Teacher.findOne({ userId }).populate('classrooms', 'name subject');
      }
      
      return { user, profile };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update user
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Updated user
   */
  async updateUser(userId, updateData) {
    try {
      // Prevent updating sensitive fields
      const { password, role, ...safeUpdateData } = updateData;
      
      const user = await User.findByIdAndUpdate(
        userId,
        safeUpdateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update user role (admin only)
   * @param {String} userId - User ID
   * @param {String} newRole - New role
   * @returns {Object} - Updated user
   */
  async updateUserRole(userId, newRole) {
    try {
      if (!['student', 'teacher', 'admin'].includes(newRole)) {
        throw new Error('Invalid role');
      }
      
      const user = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Activate or deactivate user
   * @param {String} userId - User ID
   * @param {Boolean} isActive - Active status
   * @returns {Object} - Updated user
   */
  async setUserStatus(userId, isActive) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Delete user (admin only)
   * @param {String} userId - User ID
   * @returns {Boolean} - Success status
   */
  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Delete associated profile (student or teacher)
      if (user.role === 'student') {
        await Student.findOneAndDelete({ userId });
      } else if (user.role === 'teacher') {
        await Teacher.findOneAndDelete({ userId });
      }
      
      // Delete the user
      await User.findByIdAndDelete(userId);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();