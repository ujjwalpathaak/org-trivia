import { ObjectId } from 'mongodb';

import { calculateMultiplier, getMonth } from '../middleware/utils.js';
import Employee from '../models/employee.model.js';
import Question from '../models/question.model.js';

const isWeeklyQuizGiven = async (employeeId) => {
  return Employee.findById(employeeId, 'quizGiven');
};

const updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven = async () => {
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

const addSubmittedQuestion = async (questionId, employeeId) => {
  return Employee.updateOne(
    { _id: new ObjectId(employeeId) },
    { $push: { submittedQuestions: new ObjectId(questionId) } },
  );
};

const updateWeeklyQuizScore = async (employeeId, points) => {
  const employee = await Employee.findById(
    employeeId,
    'streak score quizGiven',
  );
  if (employee.quizGiven) return false;

  const multiplier = calculateMultiplier(employee.streak);
  const updatedScore = points * multiplier;

  console.log(employee)

  await Employee.updateOne(
    { _id: employeeId },
    { $set: { quizGiven: true }, $inc: { score: updatedScore } },
  );

  return { multiplier, score: updatedScore };
};

const addBadgesToEmployees = async (employeeId, badgeId, month, year) => {
  return Employee.updateOne(
    { _id: employeeId },
    {
      $push: {
        badges: { badgeId, description: `${getMonth(month)} ${year}` },
      },
    },
  );
};

const resetAllEmployeesScores = async () => {
  return Employee.updateMany({}, { $set: { score: 0, streak: 0 } });
};

const getSubmittedQuestions = async (employeeId, page, size) => {
  const questionsIds = await Employee.findById(
    employeeId,
    'submittedQuestions',
  );
  const questions = await Question.find({
    _id: { $in: questionsIds.submittedQuestions },
  })
    .skip(parseInt(page) * parseInt(size))
    .limit(parseInt(size))
    .lean();
  return { data: questions, total: questionsIds.length };
};

const getEmployeeDetails = async (employeeId) => {
  const employee = await Employee.findById(employeeId).lean();
  if (!employee) return null;

  const badges = await Employee.aggregate([
    { $match: { _id: new ObjectId(employeeId) } },
    { $unwind: '$badges' },
    { $sort: { 'badges.earnedAt': -1 } },
    {
      $lookup: {
        from: 'badges',
        localField: 'badges.badgeId',
        foreignField: '_id',
        as: 'badgeDetails',
      },
    },
    { $unwind: '$badgeDetails' },
    {
      $group: {
        _id: '$_id',
        badges: {
          $push: {
            badgeDetails: '$badgeDetails',
            description: '$badges.description',
            rank: '$badges.rank',
            earnedAt: '$badges.earnedAt',
          },
        },
      },
    },
  ]);

  return {
    employee,
    badges: badges[0]?.badges || [],
    multiplier: calculateMultiplier(employee.streak),
  };
};

export default {
  isWeeklyQuizGiven,
  updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven,
  addSubmittedQuestion,
  updateWeeklyQuizScore,
  addBadgesToEmployees,
  resetAllEmployeesScores,
  getSubmittedQuestions,
  getEmployeeDetails,
};
