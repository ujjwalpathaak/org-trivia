import { ObjectId } from 'mongodb';

import Org from '../models/org.model.js';
import Question from '../models/question.model.js';

export const createNewQuestion = async (newQuestion) => {
  return await new Question(newQuestion).save();
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

export const updateQuestion = async (question) => {
  return Question.updateOne(
    { _id: new ObjectId(question._id) },
    {
      $set: {
        ...question,
      },
    },
  );
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