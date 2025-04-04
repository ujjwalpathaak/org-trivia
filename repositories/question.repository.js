import { ObjectId } from 'mongodb';

import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { fetchExtraEmployeeQuestions, updateQuestionsStatus } from './org.repository.js';
import { updateQuizStatus } from './quiz.repository.js';

export const saveQuestion = async (newQuestion) => {
  return await new Question(newQuestion).save();
};

export const getUnusedQuestionsFromTimeline = async (orgId, isApproved) => {
  const questions = await WeeklyQuestion.find({ orgId, isApproved })
    .select('question._id')
    .lean();

  return questions.map((q) => q.question._id);
}

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
  return WeeklyQuestion.aggregate(
    [
      {
        $match: {
          quizId: new ObjectId(
            quizId,
          )
        }
      },
      {
        $unwind: {
          path: "$questions",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "questions",
          localField: "questions",
          foreignField: "_id",
          as: 'question'
        }
      },
      {
        $unwind: {
          path: "$question",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $replaceRoot: {
          newRoot: '$question'
        }
      }
    ]
  )
};

export const getWeeklyQuizLiveQuestions = async (orgId) => {
  // only if quiz is live
  return await WeeklyQuestion.find({ orgId })
    .select('-question.answer')
    .lean();
};

export const dropWeeklyQuestionCollection = async () => {
  return await WeeklyQuestion.deleteMany();
};

export const editQuestions = async (questionsToEdit) => {
  if (!Array.isArray(questionsToEdit) || questionsToEdit.length === 0) {
    throw new Error("Invalid input: questionsToEdit must be a non-empty array.");
  }

  const bulkOps = questionsToEdit.map(({ _id, ...rest }) => {
    console.log("Updating:", _id, rest);

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
    console.error("Error updating weekly quiz questions:", error);
    throw new Error("Failed to update quiz questions.");
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

export const getCorrectWeeklyQuizAnswers = async (orgId) => {
  return await WeeklyQuestion.find({ orgId })
    .select('question._id question.answer')
    .lean();
};

export const removeQuestionsPnAFromDatabase = async (questionsToRemove) => {
  return Question.deleteMany({
    _id: { $in: questionsToRemove }
  })
}

export const saveWeeklyQuiz = async (orgId,
  quizId,
  weeklyQuiz,
  genre) => {

  if (weeklyQuiz.questions.length > 0) {
    await updateQuizStatus(quizId, 'scheduled');
    await updateQuestionsStatus(orgId, weeklyQuiz.questions, genre)
    return await WeeklyQuestion.insertOne(weeklyQuiz);
  }
  return [];
};

export const getWeeklyQuestions = async (quizId) => {
  return await WeeklyQuestion.find({ quizId: new ObjectId(quizId) });
};
