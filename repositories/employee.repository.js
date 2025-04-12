import { ObjectId } from 'mongodb';

import { getMonth } from '../middleware/utils.js';
import Employee from '../models/employee.model.js';
import { findBadgeByStreak } from './badge.repository.js';
import { getQuestionsByIds, updateQuestion } from './question.repository.js';

/**
 * Checks if an employee has given the weekly quiz
 * @param {string} employeeId - The ID of the employee
 * @returns {Promise<Object|null>} Employee document with quizGiven field or null if not found
 */
export const isWeeklyQuizGiven = async (employeeId) => {
  return Employee.findById(employeeId, 'quizGiven');
};

/**
 * Awards streak badges to employees based on their streak duration
 * @returns {Promise<void>}
 */
export const awardStreakBadges = async () => {
  const [
    quater_year_streak_employees,
    half_year_streak_employees,
    yearly_streak_employees,
  ] = await Promise.all([
    Employee.find({ streak: 13 }),
    Employee.find({ streak: 26 }),
    Employee.find({ streak: 52 }),
  ]);

  const streaks = await Promise.all([
    findBadgeByStreak('3 Months'),
    findBadgeByStreak('6 Months'),
    findBadgeByStreak('1 Year'),
  ]);

  const badges = {
    '3 Months': streaks[0]._id,
    '6 Months': streaks[1]._id,
    '1 Year': streaks[2]._id,
  };

  await Promise.all([
    ...quater_year_streak_employees.map((employee) =>
      addBadgesToEmployees(
        employee._id,
        badges['3 Months'],
        new Date().getMonth(),
        new Date().getFullYear(),
      ),
    ),
    ...half_year_streak_employees.map((employee) =>
      addBadgesToEmployees(
        employee._id,
        badges['6 Months'],
        new Date().getMonth(),
        new Date().getFullYear(),
      ),
    ),
    ...yearly_streak_employees.map((employee) =>
      addBadgesToEmployees(
        employee._id,
        badges['1 Year'],
        new Date().getMonth(),
        new Date().getFullYear(),
      ),
    ),
  ]);
};

/**
 * Updates employee streaks and marks all employees as not having given the quiz
 * @returns {Promise<Object>} Result of the bulk write operation
 */
export const updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven =
  async () => {
    await Employee.bulkWrite([
      {
        updateMany: {
          filter: { quizGiven: true },
          update: { $inc: { streak: 1 } },
        },
      },
      {
        updateMany: {
          filter: { quizGiven: false },
          update: { $set: { streak: 0 } },
        },
      },
      { updateMany: { filter: {}, update: { $set: { quizGiven: false } } } },
    ]);
  };

/**
 * Adds a submitted question to an employee's record
 * @param {string} questionId - The ID of the question
 * @param {string} employeeId - The ID of the employee
 * @returns {Promise<Object>} Result of the update operation
 */
export const addSubmittedQuestion = async (questionId, employeeId) => {
  const newQuestion = {
    questionId: new ObjectId(questionId),
    state: 'submitted',
  }
  return Employee.updateOne(
    { _id: new ObjectId(employeeId) },
    { $push: { questions: newQuestion } },
  );
};

/**
 * Updates an employee's weekly quiz score
 * @param {string} employeeId - The ID of the employee
 * @param {number} points - Points to add to the score
 * @param {Object} session - MongoDB session for transaction support
 * @returns {Promise<Object|boolean>} Score update result or false if quiz already given
 */
export const updateWeeklyQuizScore = async (employeeId, points, session) => {
  const employee = await Employee.findById(employeeId, 'streak quizGiven');
  if (employee.quizGiven) return false;

  await Employee.updateOne(
    { _id: employeeId },
    { $set: { quizGiven: true }, $inc: { score: points } },
    { session },
  );

  return { score: points };
};

/**
 * Adds a badge to an employee's record
 * @param {string} employeeId - The ID of the employee
 * @param {string} badgeId - The ID of the badge
 * @param {number} month - The month the badge was earned
 * @param {number} year - The year the badge was earned
 * @returns {Promise<Object>} Result of the update operation
 */
export const addBadgesToEmployees = async (
  employeeId,
  badgeId,
  month,
  year,
) => {
  return Employee.updateOne(
    { _id: employeeId },
    {
      $push: {
        badges: { badgeId, description: `${getMonth(month)} ${year}` },
      },
    },
  );
};

/**
 * Resets all employees' scores and streaks to zero
 * @returns {Promise<Object>} Result of the update operation
 */
export const resetAllEmployeesScores = async () => {
  return Employee.updateMany({}, { $set: { score: 0, streak: 0 } });
};

const updateQuestionState = async (mp, newState) => {
  for (const [employeeId, questionIdsRaw] of Object.entries(mp)) {
    const questionIds = questionIdsRaw.map(id => new ObjectId(id));

    await Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $set: {
          'questions.$[elem].state': newState
        }
      },
      {
        arrayFilters: [
          { 'elem.questionId': { $in: questionIds }, 'elem.state': 'submitted' }
        ]
      }
    );
  }
};

export const approveEmployeeQuestion = (mp) => updateQuestionState(mp, 'approved');
export const rejectEmployeeQuestion = (mp) => updateQuestionState(mp, 'rejected');

export const getEmployeeQuestionsToApprove = async (orgId) => {
  return Employee.aggregate([{
    $match: {
      orgId: new ObjectId(orgId)
    }
  },
   {
     $unwind: {
       path: '$questions'
     }
   },
   {
    $match: {
      "questions.state": 'submitted'
    }
  },
    {
     $lookup: {
       from: 'questions',
       localField: 'questions.questionId',
       foreignField: '_id',
       as: 'question'
     }
   },
   {
     $unwind: {
       path: '$question'
     }
   },
   {
    $addFields: {
      'question.employeeId': '$_id',
    }
  },{
     $replaceRoot: {
       newRoot: '$question'
     }
   }
   ])
} 

/**
 * Gets questions submitted by an employee with pagination
 * @param {string} employeeId - The ID of the employee
 * @param {number} page - Page number for pagination
 * @param {number} size - Number of results per page
 * @returns {Promise<Object>} Object containing submitted questions and total count
 */
export const getSubmittedQuestions = async (employeeId, page, size) => {
  const employee = await Employee.findById(
    employeeId,
    'questions',
  );
  const questionsIds = employee.questions.map((q) => q.questionId);

  const questions = await getQuestionsByIds(
    questionsIds,
    page,
    size,
  );

  const questionsWithState = questions.map((question) => {
    const questionId = question._id.toString();
    const questionState = employee.questions.find(
      (q) => q.questionId.toString() === questionId,
    ).state;
    return { ...question, state: questionState };
  }
  );

  return { data: questionsWithState, total: questionsIds.length };
};

export const checkEmployeeHasSubmittedThisQuestion = async (
  employeeId,
  questionId,
) => {
  const employee = await Employee.findById(employeeId, 'questions');
  const questionIds = employee.questions.map((q) => q.questionId.toString());
  return questionIds.includes(questionId);
}

// ------------------------------------------------------------------------

/**
 * Gets detailed information about an employee including their badges
 * @param {string} employeeId - The ID of the employee
 * @returns {Promise<Object|null>} Employee details with badges or null if not found
 */
export const getEmployeeDetails = async (employeeId) => {
  const employee = await Employee.findById(employeeId, '-password').lean();
  if (!employee) return null;

  const data = await Employee.aggregate([
    { $match: { _id: new ObjectId(employeeId) } },
    { $unwind: { path: '$badges', preserveNullAndEmptyArrays: true } },
    { $sort: { 'badges.earnedAt': -1 } },
    {
      $lookup: {
        from: 'badges',
        localField: 'badges.badgeId',
        foreignField: '_id',
        as: 'badgeDetails',
      },
    },
    { $unwind: { path: '$badgeDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        badges: {
          $push: {
            $cond: [
              { $gt: [{ $type: '$badgeDetails._id' }, 'missing'] },
              {
                badgeDetails: '$badgeDetails',
                description: '$description',
                earnedAt: '$earnedAt',
              },
              '$$REMOVE',
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        badges: 1,
      },
    },
  ]);

  return {
    employee,
    badges: data[0].badges,
  };
};
