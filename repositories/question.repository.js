import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { ObjectId } from 'mongodb';
import OrgRepository from './org.repository.js';
import QuizRepository from './quiz.repository.js';
import QuizService from '../services/quiz.service.js';

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

  async getWeeklyUnapprovedQuestions(orgId) {
    return await WeeklyQuestion.find({
      org: new ObjectId(orgId),
      isApproved: false,
    });
  }

  async weeklyQuizAnswers(orgId) {
    const questions = await WeeklyQuestion.find({ org: new ObjectId(orgId) })
      .select('question._id question.answer')
      .lean();
    return questions.map((curr) => {
      return curr.question;
    });
  }

  async saveHRdocQuestions(orgId, questions) {
    return Question.insertMany(questions);
  }

  async pushQuestionsForApproval(questions, category, orgId){
      const weeklyQuestions = await quizService.formatWeeklyQuestions(
          questions,
          orgId,
          category,
        );
      const response = await this.saveWeeklyQuizQuestions(weeklyQuestions);
      return response;
  }

  async fetchPnAQuestions(){
    const questions = await Question.aggregate([
      { $match: {
        category: 'PnA',
        status: 'extra',
      }},
      { $group: { 
        _id: "$config.puzzleType",
        question: { $first: "$$ROOT" }
      }},
      { $replaceRoot: {
        newRoot: "$question"
      }}
    ]);

    return questions;
  }
}

export default QuestionRepository;
