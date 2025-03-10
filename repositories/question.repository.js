import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { ObjectId } from 'mongodb';
import Quiz from '../models/quiz.model.js';
import Org from '../models/org.model.js';

class QuestionRepository {
  async saveQuestion(newQuestion) {
    return new Question(newQuestion).save();
  }

  async addQuestions(newQuestions) {
    return Question.insertMany(newQuestions);
  }

  async fetchPnAQuestions(orgId) {
    return Org.aggregate([
      {
        $match: {
          _id: orgId,
        },
      },
      {
        $unwind: '$questionsPnA',
      },
      {
        $match: {
          'questionsPnA.isUsed': false,
        },
      },
      {
        $group: {
          _id: '$questionsPnA.puzzleType',
          question: { $first: '$questionsPnA' },
        },
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'question.questionId',
          foreignField: '_id',
          as: 'questionDetails',
        },
      },
      {
        $unwind: '$questionDetails',
      },
      {
        $replaceRoot: {
          newRoot: '$questionDetails',
        },
      },
    ]);
  }

  async pushQuestionsInOrg(finalFormatedRefactoredQuestions, orgId, genre) {
    const fieldName = `questions${genre}`;

    return Org.updateMany(
      { _id: new ObjectId(orgId) },
      {
        $push: {
          [fieldName]: {
            $each: finalFormatedRefactoredQuestions,
          },
        },
      },
    );
  }

  async getCorrectWeeklyQuizAnswers(orgId) {
    return WeeklyQuestion.find({
      orgId: new ObjectId(orgId),
    })
      .select('question._id question.answer')
      .lean();
  }

  async saveWeeklyQuizQuestions(newQuestions) {
    return WeeklyQuestion.insertMany(newQuestions);
  }

  // move to quiz repo
  async getUpcomingWeeklyQuiz(orgId) {
    return Quiz.findOne({
      orgId: new ObjectId(orgId),
      status: 'upcoming',
    });
  }

  async getExtraAIQuestions(quizId, genre) {
    return [];
    // return Question.find({ source: 'AI' });
  }

  async getExtraEmployeeQuestions(quizId, genre) {
    return [];
    // return Question.find({ source: 'Employee' });
  }

  async getWeeklyUnapprovedQuestions(quizId) {
    return WeeklyQuestion.find({ quizId: quizId });
  }

  async fetchHRDQuestions(orgId) {
    return Org.aggregate([
      {
        $match: { _id: orgId },
      },
      {
        $unwind: '$questionsHRD',
      },
      {
        $match: { 'questionsHRD.isUsed': false },
      },
      {
        $sample: { size: 5 },
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionsHRD.questionId',
          foreignField: '_id',
          as: 'questionDetails',
        },
      },
      {
        $unwind: '$questionDetails',
      },
      {
        $replaceRoot: { newRoot: '$questionDetails' },
      },
    ]);
  }
}

export default QuestionRepository;
