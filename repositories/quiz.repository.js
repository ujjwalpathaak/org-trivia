import { ObjectId } from 'mongodb';

import Quiz from '../models/quiz.model.js';
import { updateQuestionsStatus } from './org.repository.js';
import { findResultByQuizId } from './result.repository.js';

export const findLiveQuizByOrgId = (orgId) => {
  return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
};

export const findQuiz = (quizId) => {
  return Quiz.findOne({ _id: new ObjectId(quizId) });
};

export const getLiveQuizQuestionsByOrgId = () => {
  return Quiz.aggregate([
    {
      $match: {
        orgId: new ObjectId('67c6904cf8c3ce19ef544cac'),
        status: 'live',
      },
    },
    {
      $lookup: {
        from: 'quizzes',
        localField: '_id',
        foreignField: '_id',
        as: 'questions',
      },
    },
    {
      $unwind: {
        path: '$questions',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$questions',
      },
    },
    {
      $unwind: {
        path: '$questions',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questions',
        foreignField: '_id',
        as: 'question',
      },
    },
    {
      $unwind: {
        path: '$question',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        'question.quizId': '$quizId',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$question',
      },
    },
  ]);
};

export const getQuizStatus = (orgId, date) => {
  return Quiz.findOne(
    {
      orgId: new ObjectId(orgId),
      scheduledDate: date,
    },
    { genre: 1, status: 1, _id: 0 },
  );
};

export const cancelScheduledQuiz = async (quizId) => {
  return Quiz.findOneAndUpdate(
    { _id: new ObjectId(quizId) },
    { $set: { status: 'cancelled' } },
    { returnDocument: 'after' },
  );
};

export const cancelLiveQuiz = async (quizId) => {
  return Quiz.findOneAndUpdate(
    { _id: new ObjectId(quizId), status: 'live' },
    { $set: { status: 'expired' } },
    { returnDocument: 'after' },
  );
};

export const allowScheduledQuiz = async (quizId) => {
  const quiz = await Quiz.findOne({ _id: new ObjectId(quizId) });
  console.log(quiz);
  const quizQuestionsCount = quiz.questions.length;
  console.log(quizQuestionsCount);
  const newStatus = quizQuestionsCount === 0 ? 'upcoming' : 'scheduled';
  console.log(newStatus);

  return Quiz.findOneAndUpdate(
    { _id: new ObjectId(quizId), status: 'cancelled' },
    { $set: { status: newStatus } },
    { returnDocument: 'after' },
  );
};

export const getScheduledQuizzes = (orgId, startDate, endDate) => {
  return Quiz.find({
    orgId: new ObjectId(orgId),
    scheduledDate: { $gte: startDate, $lte: endDate },
  }).sort({
    scheduledDate: 1,
  });
};

export const lastQuizByGenre = () => {
  return Quiz.aggregate([
    {
      $match: { genre: 'CAnIT', status: 'expired' },
    },
    {
      $sort: {
        scheduledDate: -1,
      },
    },
    {
      $group: {
        _id: '$orgId',
        scheduledDate: {
          $first: '$scheduledDate',
        },
        quizId: {
          $first: '$_id',
        },
      },
    },
    {
      $project: {
        orgId: '$_id',
        scheduledDate: 1,
        quizId: 1,
        _id: 0,
      },
    },
  ]);
};

export const getCAnITQuizzesScheduledNext = () => {
  return Quiz.aggregate([
    {
      $match: {
        genre: 'CAnIT',
        status: 'upcoming',
      },
    },
    {
      $sort: {
        scheduledDate: 1,
      },
    },
    {
      $group: {
        _id: '$orgId',
        scheduledDate: { $first: '$scheduledDate' },
        quizId: { $first: '$_id' },
      },
    },
    {
      $project: {
        orgId: '$_id',
        scheduledDate: 1,
        quizId: 1,
        _id: 0,
      },
    },
  ]);
};

export const getCAnITQuizzesScheduledTomm = () => {
  const today = new Date();

  const todayInUTCFormat = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  return Quiz.find({
    genre: 'CAnIT',
    status: 'upcoming',
    questionGenerationDate: todayInUTCFormat,
  });
};

export const scheduleNewWeeklyQuiz = (
  orgId,
  date,
  genre,
  companyCurrentAffairsTimeline = undefined,
) => {
  return Quiz.create({
    orgId,
    status: 'upcoming',
    scheduledDate: date,
    genre,
    ...(companyCurrentAffairsTimeline !== undefined && {
      questionGenerationTimeline: companyCurrentAffairsTimeline,
    }),
  });
};

export const makeQuizLive = async (date) => {
  return Quiz.bulkWrite([
    {
      updateMany: {
        filter: {
          status: 'upcoming',
          scheduledDate: date,
        },
        update: { $set: { status: 'cancelled' } },
      },
    },
    {
      updateMany: {
        filter: {
          status: 'scheduled',
          scheduledDate: date,
        },
        update: { $set: { status: 'live' } },
      },
    },
  ]);
};

export const markAllLiveQuizAsExpired = async () => {
  const liveQuizzes = await Quiz.find({ status: 'live' }, { _id: 1 }).lean();
  const quizIds = liveQuizzes.map((q) => q._id);

  return Quiz.updateMany(
    { _id: { $in: quizIds } },
    { $set: { status: 'expired' } },
  );
};

export const getUpcomingWeeklyQuiz = (orgId) => {
  return Quiz.findOne({
    orgId: new ObjectId(orgId),
    status: 'unapproved',
  });
};

const updateQuizStatus = (quizId, status) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId) },
    {
      $set: {
        status: status,
      },
    },
  );
};

export const getLiveQuizByEmployeeId = async (employeeId) => {
  const result = await findResultByQuizId(employeeId);
  return result?.quizId;
};

export const getQuizByQuizId = (quizId) => {
  return Quiz.findOne({ _id: new ObjectId(quizId) });
};

export const changeQuizGenre = async (newGenre, quizId) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'upcoming' },
    { $set: { genre: newGenre } },
  );
};

export const saveQuizQuestions = async (orgId, quizId, questionIds, genre) => {
  if (questionIds.length > 0) {
    await updateQuizStatus(quizId, 'scheduled');
    await updateQuestionsStatus(orgId, questionIds, genre);
    return await Quiz.updateOne(
      { _id: new ObjectId(quizId) },
      { $set: { questions: questionIds } },
    );
  }
  return [];
};

export const getCorrectQuizAnswers = async (quizId) => {
  return await Quiz.aggregate([
    {
      $match: {
        _id: new ObjectId(quizId),
      },
    },
    {
      $unwind: {
        path: '$questions',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questions',
        foreignField: '_id',
        as: 'question',
      },
    },
    {
      $unwind: {
        path: '$question',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$question',
      },
    },
    {
      $project: {
        _id: 1,
        answer: 1,
      },
    },
  ]);
};

export const replaceQuizQuestions = async (idsToAdd, idsToRemove, quizId) => {
  const { orgId, genre, questions } = await Quiz.findOne({
    _id: new ObjectId(quizId),
  })
    .select('questions orgId genre')
    .lean();

  let updatedQuestions = questions.map((q) => new ObjectId(q));

  updatedQuestions.push(...idsToAdd.map((id) => new ObjectId(id)));

  updatedQuestions = updatedQuestions.filter(
    (q) => !idsToRemove.includes(q.toString()),
  );

  await Quiz.updateOne(
    { _id: new ObjectId(quizId) },
    { $set: { questions: updatedQuestions } },
  );

  return { orgId, genre };
};

export const getScheduledQuizQuestions = async (orgId, quizId) => {
  return Quiz.aggregate([
    {
      $match: {
        _id: new ObjectId(quizId),
      },
    },
    {
      $unwind: {
        path: '$questions',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questions',
        foreignField: '_id',
        as: 'question',
      },
    },
    {
      $unwind: {
        path: '$question',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$question',
      },
    },
  ]);
};
