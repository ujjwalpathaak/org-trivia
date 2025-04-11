import { ObjectId } from 'mongodb';

import Org from '../models/org.model.js';
import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { updateQuestionsStatus } from './org.repository.js';
import { updateQuizStatus } from './quiz.repository.js';

/**
 * Creates a new question in the database
 * @param {Object} newQuestion - The question object to create
 * @returns {Promise<Object>} The created question document
 */
export const createNewQuestion = async (newQuestion) => {
  return await new Question(newQuestion).save();
};

/**
 * Gets unused questions from the timeline for an organization
 * @param {string} orgId - The ID of the organization
 * @param {boolean} isApproved - Whether to get approved or unapproved questions
 * @returns {Promise<Array<string>>} Array of question IDs
 */
export const getUnusedQuestionsFromTimeline = async (orgId, isApproved) => {
  const questions = await WeeklyQuestion.find({ orgId, isApproved })
    .select('question._id')
    .lean();

  return questions.map((q) => q.question._id);
};

/**
 * Adds multiple new questions to the database, filtering out duplicates
 * @param {Array<Object>} newQuestions - Array of question objects to add
 * @returns {Promise<Array<Object>>} Array of created question documents
 */
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

/**
 * Gets scheduled questions for a weekly quiz
 * @param {string} orgId - The ID of the organization
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array<Object>>} Array of question documents
 */
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

/**
 * Gets live questions for weekly quizzes in an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Array<Object>>} Array of question documents without answers
 */
export const getWeeklyQuizLiveQuestions = async (orgId) => {
  return await WeeklyQuestion.find({ orgId }).select('-question.answer').lean();
};

/**
 * Removes weekly questions for expired quizzes
 * @param {Array<string>} quizIds - Array of quiz IDs to remove questions for
 * @returns {Promise<Object>} Result of the deletion operation
 */
export const dropWeeklyQuestionForExpiredQuizzes = async (quizIds) => {
  const objectIds = quizIds.map((id) => new ObjectId(id));

  return WeeklyQuestion.deleteMany({
    quizId: { $in: objectIds },
  });
};

/**
 * Gets CAnIT questions in the timeline for an organization
 * @param {string} orgId - The ID of the organization
 * @param {string} newsTimelineStart - Start date for the timeline
 * @returns {Promise<Array<Object>>} Array of CAnIT questions with organization info
 */
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

/**
 * Gets questions by their IDs with pagination
 * @param {Array<string>} ids - Array of question IDs
 * @param {number} page - Page number for pagination
 * @param {number} size - Number of results per page
 * @returns {Promise<Array<Object>>} Array of question documents
 */
export const getQuestionsByIds = async (ids, page, size) => {
  return Question.find({
    _id: { $in: ids },
  })
    .skip(parseInt(page) * parseInt(size))
    .limit(parseInt(size))
    .lean();
};

/**
 * Replaces questions in a quiz
 * @param {Array<string>} idsToAdd - Array of question IDs to add
 * @param {Array<string>} idsToRemove - Array of question IDs to remove
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Object containing orgId and genre
 */
export const replaceQuizQuestions = async (idsToAdd, idsToRemove, quizId) => {
  const { orgId, genre, questions } = await WeeklyQuestion.findOne({
    quizId: new ObjectId(quizId),
  })
    .select('questions orgId genre')
    .lean();

  let updatedQuestions = questions.map((q) => new ObjectId(q));

  updatedQuestions.push(...idsToAdd.map((id) => new ObjectId(id)));

  updatedQuestions = updatedQuestions.filter(
    (q) => !idsToRemove.includes(q.toString()),
  );

  await WeeklyQuestion.updateOne(
    { quizId: new ObjectId(quizId) },
    { $set: { questions: updatedQuestions } },
  );

  return { orgId, genre };
};

/**
 * Edits multiple questions in bulk
 * @param {Array<Object>} questionsToEdit - Array of question objects with updates
 * @returns {Promise<Object>} Result of the bulk write operation
 * @throws {Error} If input is invalid or update fails
 */
export const editQuizQuestions = async (questionsToEdit) => {
  if (!Array.isArray(questionsToEdit) || questionsToEdit.length === 0) {
    throw new Error(
      'Invalid input: questionsToEdit must be a non-empty array.',
    );
  }

  const bulkOps = questionsToEdit.map(({ _id, ...rest }) => {
    return {
      updateOne: {
        filter: { _id: new ObjectId(_id) },
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

/**
 * Gets correct answers for a weekly quiz
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array<Object>>} Array of questions with their correct answers
 */
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

// export const removeQuestionsPnAFromDatabase = async (questionsToRemove) => {
//   return Question.deleteMany({
//     _id: { $in: questionsToRemove },
//   });
// };

/**
 * Saves a weekly quiz with its questions
 * @param {string} orgId - The ID of the organization
 * @param {string} quizId - The ID of the quiz
 * @param {Object} weeklyQuiz - The weekly quiz object to save
 * @param {string} genre - The genre of the quiz
 * @returns {Promise<Object|Array>} The saved weekly quiz or empty array
 */
export const saveWeeklyQuiz = async (orgId, quizId, weeklyQuiz, genre) => {
  if (weeklyQuiz.questions.length > 0) {
    await updateQuizStatus(quizId, 'scheduled');
    await updateQuestionsStatus(orgId, weeklyQuiz.questions, genre);
    return await WeeklyQuestion.insertOne(weeklyQuiz);
  }
  return [];
};

/**
 * Gets weekly questions for a quiz
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Array<Object>>} Array of weekly question documents
 */
export const getWeeklyQuestions = async (quizId) => {
  return await WeeklyQuestion.find({ quizId: new ObjectId(quizId) });
};
