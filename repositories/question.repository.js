import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { ObjectId } from 'mongodb';
import OrgRepository from './org.repository.js';
import QuizRepository from './quiz.repository.js';
import QuizService from '../services/quiz.service.js';
import Quiz from '../models/quiz.model.js';

const orgRepository = new OrgRepository();
const quizService = new QuizService(new QuizRepository());

class QuestionRepository {
  async saveQuestion(newQuestion) {
    const question = await new Question(newQuestion).save();
    await orgRepository.addQuestionToOrg(question.org, question._id);

    return question;
  }

  async saveWeeklyQuizQuestions(newQuestions) {
    return await WeeklyQuestion.insertMany(newQuestions);
  }

  // get quizID & then get questions for that qioz odf
  async getWeeklyUnapprovedQuestions(orgId) {
    const quiz = await Quiz.findOne({ orgId: new ObjectId(orgId) });
    const quizId = quiz._id;

    const weeklyQuizQuestions = await WeeklyQuestion.find({ quizId: quizId });

    return weeklyQuizQuestions;
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
    console.log(formatedWeeklyQuizCorrectAnswers);

    return formatedWeeklyQuizCorrectAnswers;
  }

  async saveHRdocQuestions(orgId, questions) {
    return Question.insertMany(questions);
  }

  async pushQuestionsForApproval(questions, category, orgId, quizId) {
    const weeklyQuestions = await quizService.formatWeeklyQuestions(
      questions,
      orgId,
      category,
      quizId,
    );
    const formatedQuestions = await quizService.formatQuestions(
      questions,
      orgId,
      category,
    );
    const response = await this.saveWeeklyQuizQuestions(weeklyQuestions);
    await this.questions(formatedQuestions);

    return response;
  }

  async fetchPnAQuestions() {
    const questions = await Question.aggregate([
      {
        $match: {
          category: 'PnA',
          status: 'extra',
        },
      },
      {
        $group: {
          _id: '$config.puzzleType',
          question: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$question',
        },
      },
    ]);

    return questions;
  }
}

export default QuestionRepository;
