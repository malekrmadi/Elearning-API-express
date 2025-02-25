// services/gradeService.js
const Grade = require('../models/Grade');
const mongoose = require('mongoose');

/**
 * Service layer for Grade operations
 */
class GradeService {
  /**
   * Create a new grade
   * @param {Object} gradeData - The grade data
   * @returns {Promise<Object>} Created grade
   */
  async createGrade(gradeData) {
    try {
      const grade = await Grade.create(gradeData);
      return grade;
    } catch (error) {
      throw new Error(`Error creating grade: ${error.message}`);
    }
  }

  /**
   * Get a grade by ID
   * @param {string} id - Grade ID
   * @returns {Promise<Object>} The grade
   */
  async getGradeById(id) {
    try {
      const grade = await Grade.findById(id);
      if (!grade) {
        throw new Error('Grade not found');
      }
      return grade;
    } catch (error) {
      throw new Error(`Error retrieving grade: ${error.message}`);
    }
  }

  /**
   * Get all grades for a student
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} Array of grades
   */
  async getGradesByStudent(studentId) {
    try {
      const grades = await Grade.find({ studentId })
        .populate('classroomId', 'name subject')
        .sort({ submissionDate: -1 });
      return grades;
    } catch (error) {
      throw new Error(`Error retrieving student grades: ${error.message}`);
    }
  }

  /**
   * Get all grades for a classroom
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Array>} Array of grades
   */
  async getGradesByClassroom(classroomId) {
    try {
      const grades = await Grade.find({ classroomId })
        .populate('studentId', 'userId')
        .populate('gradedBy', 'username')
        .sort({ submissionDate: -1 });
      return grades;
    } catch (error) {
      throw new Error(`Error retrieving classroom grades: ${error.message}`);
    }
  }

  /**
   * Get student's grades for a specific classroom
   * @param {string} studentId - Student ID
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Array>} Array of grades
   */
  async getStudentClassroomGrades(studentId, classroomId) {
    try {
      const grades = await Grade.find({ studentId, classroomId })
        .sort({ submissionDate: -1 });
      return grades;
    } catch (error) {
      throw new Error(`Error retrieving student classroom grades: ${error.message}`);
    }
  }

  /**
   * Calculate student's average grade for a classroom
   * @param {string} studentId - Student ID
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<number>} Average grade percentage
   */
  async getStudentAverage(studentId, classroomId) {
    try {
      const grades = await Grade.find({ studentId, classroomId });
      
      if (grades.length === 0) {
        return 0;
      }
      
      let totalWeightedScore = 0;
      let totalWeightage = 0;
      
      grades.forEach(grade => {
        const percentage = (grade.score / grade.maxScore) * 100;
        totalWeightedScore += percentage * grade.weightage;
        totalWeightage += grade.weightage;
      });
      
      return totalWeightage > 0 ? (totalWeightedScore / totalWeightage).toFixed(2) : 0;
    } catch (error) {
      throw new Error(`Error calculating student average: ${error.message}`);
    }
  }

  /**
   * Update a grade
   * @param {string} id - Grade ID
   * @param {Object} updateData - Updated grade data
   * @returns {Promise<Object>} Updated grade
   */
  async updateGrade(id, updateData) {
    try {
      const grade = await Grade.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });
      
      if (!grade) {
        throw new Error('Grade not found');
      }
      
      return grade;
    } catch (error) {
      throw new Error(`Error updating grade: ${error.message}`);
    }
  }

  /**
   * Delete a grade
   * @param {string} id - Grade ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteGrade(id) {
    try {
      const grade = await Grade.findByIdAndDelete(id);
      
      if (!grade) {
        throw new Error('Grade not found');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Error deleting grade: ${error.message}`);
    }
  }

  /**
   * Get grade statistics for a classroom
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Object>} Grade statistics
   */
  async getClassroomGradeStatistics(classroomId) {
    try {
      const grades = await Grade.find({ classroomId });
      
      if (grades.length === 0) {
        return {
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          assignmentCount: 0,
          assignmentTypes: {}
        };
      }
      
      let totalPercentage = 0;
      let highestScore = 0;
      let lowestScore = 100;
      const assignmentTypes = {};
      
      grades.forEach(grade => {
        const percentage = (grade.score / grade.maxScore) * 100;
        totalPercentage += percentage;
        
        if (percentage > highestScore) highestScore = percentage;
        if (percentage < lowestScore) lowestScore = percentage;
        
        // Count assignment types
        if (assignmentTypes[grade.assignmentType]) {
          assignmentTypes[grade.assignmentType]++;
        } else {
          assignmentTypes[grade.assignmentType] = 1;
        }
      });
      
      return {
        averageScore: (totalPercentage / grades.length).toFixed(2),
        highestScore: highestScore.toFixed(2),
        lowestScore: lowestScore.toFixed(2),
        assignmentCount: grades.length,
        assignmentTypes
      };
    } catch (error) {
      throw new Error(`Error generating grade statistics: ${error.message}`);
    }
  }
}

module.exports = new GradeService();