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

  async pushQuestionsInOrg(finalFormatedRefactoredQuestions, genre, orgId) {
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

  async saveWeeklyQuizQuestions(quizId, newQuestions) {
    await Quiz.updateOne({_id: new ObjectId(quizId)}, {$set: {
      status: 'unapproved'
    }})
    return WeeklyQuestion.insertMany(newQuestions);
  }

  // move to quiz repo
  async getUpcomingWeeklyQuiz(orgId) {
    return Quiz.findOne({
      orgId: new ObjectId(orgId),
      status: 'unapproved',
    });
  }

  async getExtraEmployeeQuestions(orgId, quizId, genre) {
    return Org.aggregate([
      {
        $match: { _id: new ObjectId(orgId) }
      },
      {
        $unwind: '$questionsPnA'
      },
      {
        $match: {
          'questionsPnA.isUsed': false,
          'questionsPnA.source': 'Employee'
        }
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionsPnA.questionId',
          foreignField: '_id',
          as: 'questionDetails'
        }
      },
      {
        $unwind: '$questionDetails'
      },
      {
        $replaceRoot: {
          newRoot: '$questionDetails'
        }
      }
    ]);
  }

  async getWeeklyUnapprovedQuestions(quizId) {
    return WeeklyQuestion.find({ quizId: quizId });
  }

  async fetchHRDQuestions(orgId) {
    return Org.aggregate([
      {
        $match: { _id: new ObjectId(orgId) },
      },
      {
        $unwind: '$questionsHRD',
      },
      {
        $match: { 'questionsHRD.isUsed': false },
      },
      {
        $group: {
          _id: '$questionsHRD.file',
          questions: { $push: '$questionsHRD' },
        },
      },
      {
        $project: {
          _id: 1,
          questions: { $slice: ['$questions', 2] },
        },
      },
      {
        $unwind: '$questions',
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions.questionId',
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
