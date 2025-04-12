import { ObjectId } from 'mongodb';

import { getMonth } from '../middleware/utils.js';
import Employee from '../models/employee.model.js';
import { findBadgeByStreak } from './badge.repository.js';
import { getQuestionsByIds } from './question.repository.js';

export const isWeeklyQuizGiven = async (employeeId) => {
  return Employee.findById(employeeId, 'quizGiven');
};

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

export const addSubmittedQuestion = async (questionId, employeeId) => {
  const newQuestion = {
    questionId: new ObjectId(questionId),
    state: 'submitted',
  };
  return Employee.updateOne(
    { _id: new ObjectId(employeeId) },
    { $push: { questions: newQuestion } },
  );
};

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

export const resetAllEmployeesScores = async () => {
  return Employee.updateMany({}, { $set: { score: 0, streak: 0 } });
};

const updateQuestionState = async (mp, newState) => {
  for (const [employeeId, questionIdsRaw] of Object.entries(mp)) {
    const questionIds = questionIdsRaw.map((id) => new ObjectId(id));

    await Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $set: {
          'questions.$[elem].state': newState,
        },
      },
      {
        arrayFilters: [
          {
            'elem.questionId': { $in: questionIds },
            'elem.state': 'submitted',
          },
        ],
      },
    );
  }
};

export const approveEmployeeQuestion = (mp) =>
  updateQuestionState(mp, 'approved');
export const rejectEmployeeQuestion = (mp) =>
  updateQuestionState(mp, 'rejected');

export const getEmployeeQuestionsToApprove = async (orgId) => {
  return Employee.aggregate([
    {
      $match: {
        orgId: new ObjectId(orgId),
      },
    },
    {
      $unwind: {
        path: '$questions',
      },
    },
    {
      $match: {
        'questions.state': 'submitted',
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questions.questionId',
        foreignField: '_id',
        as: 'question',
      },
    },
    {
      $unwind: {
        path: '$question',
      },
    },
    {
      $addFields: {
        'question.employeeId': '$_id',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$question',
      },
    },
  ]);
};

export const getSubmittedQuestions = async (employeeId, page, size) => {
  const employee = await Employee.findById(employeeId, 'questions');
  const questionsIds = employee.questions.map((q) => q.questionId);

  const questions = await getQuestionsByIds(questionsIds, page, size);

  const questionsWithState = questions.map((question) => {
    const questionId = question._id.toString();
    const questionState = employee.questions.find(
      (q) => q.questionId.toString() === questionId,
    ).state;
    return { ...question, state: questionState };
  });

  return { data: questionsWithState, total: questionsIds.length };
};

export const checkEmployeeHasSubmittedThisQuestion = async (
  employeeId,
  questionId,
) => {
  const employee = await Employee.findById(employeeId, 'questions');
  const questionIds = employee.questions.map((q) => q.questionId.toString());
  return questionIds.includes(questionId);
};

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
