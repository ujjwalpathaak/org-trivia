import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { ObjectId } from 'mongodb';
import OrgRepository from './org.repository.js';
import QuizRepository from './quiz.repository.js';
import QuizService from '../services/quiz.service.js';
import Quiz from '../models/quiz.model.js';
import Org from '../models/org.model.js';

const orgRepository = new OrgRepository();
const quizService = new QuizService(new QuizRepository());

class QuestionRepository {
  async saveQuestion(newQuestion) {
    const orgId = newQuestion.orgId;
    const question = await new Question(newQuestion).save();
    const addedToList = await orgRepository.addQuestionToOrg(question, orgId);
    if (!question || !addedToList) return false;

    return true;
  }

  async addLambdaCallbackQuestions(newQuestions, category, orgId, quizId){
    console.log("newQuestions", newQuestions)
    const formatedQuestions = newQuestions.map((question) => {
      return {
        question: question.question,
        answer: question.answer,
        options: question.options,
        category: category,
        source: 'AI',
        status: 'extra',
        image: null,
        config: { },
      };
    })    
    const temp = await Question.insertMany(formatedQuestions)
    console.log("temp", temp)
    await this.pushQuestionsForApproval(temp, orgId, quizId);
  }

  async fetchPnAQuestions(orgId) {
    const simplePnAQuestions = await Org.aggregate([
      {
        $match: {
          _id: orgId,
        },
      },
      {
        $unwind: '$questionsPnA',
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

    return simplePnAQuestions;
  }

  async pushQuestionsForApproval(refactoredQuestions, orgId, quizId) {
    const formatedQuestionsWeeklyFormat =
    await quizService.formatQuestionsWeeklyFormat(
      refactoredQuestions,
      orgId,
      quizId,
    );

    const temp = refactoredQuestions.map((question) => {
      return {
        questionId: new ObjectId(question._id),
        isUsed: false,
      };
    })

    await Org.updateMany({
      _id: new ObjectId(orgId),
    }, {
      $push: {
        questionsCAnIT: {
          $each: temp,
        },
      },
    })
    
    await this.saveWeeklyQuizQuestions(formatedQuestionsWeeklyFormat);
  }

  async saveWeeklyQuizQuestions(newQuestions) {
    return await WeeklyQuestion.insertMany(newQuestions);
  }

  async getWeeklyUnapprovedQuestions(orgId) {
    const quiz = await Quiz.findOne({
      orgId: new ObjectId(orgId),
      status: 'upcoming',
    });
    if (!quiz) return false;

    const quizId = quiz._id;

    const weeklyQuizQuestions = await WeeklyQuestion.find({ quizId: quizId });
    return weeklyQuizQuestions || [];
  }

  async getWeeklyQuizCorrectAnswers(orgId) {
    const weeklyQuizCorrectAnswers = await WeeklyQuestion.find({
      orgId: new ObjectId(orgId),
    })
      .select('question._id question.answer')
      .lean();

    const formatedWeeklyQuizCorrectAnswers = weeklyQuizCorrectAnswers.map(
      (curr) => curr.question,
    );

    return formatedWeeklyQuizCorrectAnswers;
  }

  async saveHRdocQuestions(orgId, questions) {    
    return Question.insertMany(questions);
  }
}

export default QuestionRepository;
