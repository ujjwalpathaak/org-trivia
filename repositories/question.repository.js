import { ObjectId } from 'mongodb';

import Org from '../models/org.model.js';
import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { updateQuestionsStatus } from './org.repository.js';
import { updateQuizStatus } from './quiz.repository.js';

export const createNewQuestion = async (newQuestion) => {
  return await new Question(newQuestion).save();
};

export const getUnusedQuestionsFromTimeline = async (orgId, isApproved) => {
  const questions = await WeeklyQuestion.find({ orgId, isApproved })
    .select('question._id')
    .lean();

  return questions.map((q) => q.question._id);
};

export const addQuestions = async (newQuestions) => {
  const existingQuestions = await Question.find(
    { question: { $in: newQuestions.map((q) => q.question) } },
    { question: 1, _id: 0 },
  );

  const existingQuestionSet = new Set(existingQuestions.map((q) => q.question));
  const filteredQuestions = newQuestions.filter(
    (q) => !existingQuestionSet.has(q.question),
  );

  if (filteredQuestions.length === 0) {
    return [];
  }

  return await Question.insertMany(filteredQuestions, { ordered: false });
};

export const getWeeklyQuizScheduledQuestions = async (orgId, quizId) => {
  return WeeklyQuestion.aggregate([
    {
      $match: {
        quizId: new ObjectId(quizId),
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

export const getWeeklyQuizLiveQuestions = async (orgId) => {
  // only if quiz is live
  return await WeeklyQuestion.find({ orgId }).select('-question.answer').lean();
};

export const dropWeeklyQuestionCollection = async () => {
  return await WeeklyQuestion.deleteMany();
};

export const getCAnITQuestionsInTimeline = async (orgId, newsTimelineStart) => {
  return Org.aggregate([
    {
      $match: {
        _id: new ObjectId(orgId),
        'questionsCAnIT.date': {
          $gt: new Date(newsTimelineStart),
          $lt: new Date(),
        },
      },
    },
    {
      $unwind: '$questionsCAnIT',
    },
    {
      $sort: {
        'questionsCAnIT.date': -1,
      },
    },
    {
      $addFields: {
        'questionsCAnIT.orgName': '$name',
        'questionsCAnIT.orgIndustry': '$settings.orgIndustry',
        'questionsCAnIT.orgCountry': '$settings.orgCountry',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$questionsCAnIT',
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'questionsInfo',
      },
    },
  ]);
};

export const getQuestionsByIds = async (ids, page, size) => {
  return Question.find({
    _id: { $in: ids },
  })
    .skip(parseInt(page) * parseInt(size))
    .limit(parseInt(size))
    .lean();
};

export const editQuizQuestions = async (questionsToEdit) => {
  if (!Array.isArray(questionsToEdit) || questionsToEdit.length === 0) {
    throw new Error(
      'Invalid input: questionsToEdit must be a non-empty array.',
    );
  }

  const bulkOps = questionsToEdit.map(({ _id, ...rest }) => {
    return {
      updateOne: {
        filter: { _id: new ObjectId(_id) }, // Correct filter format
        update: { $set: rest },
      },
    };
  });

  try {
    return await Question.bulkWrite(bulkOps);
  } catch (error) {
    console.error('Error updating weekly quiz questions:', error);
    throw new Error('Failed to update quiz questions.');
  }
};

// export const updateWeeklyQuestionsStatusToApproved = async (
//   ids,
//   employeeQuestionsToAdd,
//   idsOfQuestionsToDelete,
// ) => {
//   await WeeklyQuestion.deleteMany({
//     'question._id': { $in: idsOfQuestionsToDelete },
//   });
//   await WeeklyQuestion.insertMany(employeeQuestionsToAdd);
//   return await WeeklyQuestion.updateMany(
//     { 'question._id': { $in: ids } },
//     { $set: { isApproved: true } },
//     { multi: true },
//   );
// };

export const getCorrectWeeklyQuizAnswers = async (quizId) => {
  return await WeeklyQuestion.aggregate([
    {
      $match: {
        quizId: new ObjectId(quizId),
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

export const removeQuestionsPnAFromDatabase = async (questionsToRemove) => {
  return Question.deleteMany({
    _id: { $in: questionsToRemove },
  });
};

export const saveWeeklyQuiz = async (orgId, quizId, weeklyQuiz, genre) => {
  if (weeklyQuiz.questions.length > 0) {
    await updateQuizStatus(quizId, 'scheduled');
    await updateQuestionsStatus(orgId, weeklyQuiz.questions, genre);
    return await WeeklyQuestion.insertOne(weeklyQuiz);
  }
  return [];
};

export const getWeeklyQuestions = async (quizId) => {
  return await WeeklyQuestion.find({ quizId: new ObjectId(quizId) });
};
