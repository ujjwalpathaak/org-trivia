import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

import QuizRepository from './quiz.repository.js';
import OrgRepository from './org.repository.js';

import { ObjectId } from 'mongodb';

const quizRepository = new QuizRepository();
const orgRepository = new OrgRepository();

class QuestionRepository {
  async saveQuestion(newQuestion) {
    return new Question(newQuestion).save();
  }

  async addQuestions(newQuestions) {
    return Question.insertMany(newQuestions);
  }

  async getApprovedWeeklyQuizQuestion(orgId) {
    return WeeklyQuestion.find({
      orgId: new ObjectId(orgId),
      isApproved: true,
    })
      .select({ 'question.answer': 0 })
      .lean();
  }

  async dropWeeklyQuestionCollection() {
    return WeeklyQuestion.deleteMany({});
  }

  async updateWeeklyQuestionsStatusToApproved(idsOfQuestionsToApprove) {
    return WeeklyQuestion.updateMany(
      { 'question._id': { $in: idsOfQuestionsToApprove } },
      { $set: { isApproved: true } },
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
    await quizRepository.updateQuizStatus(quizId, 'unapproved');
    return WeeklyQuestion.insertMany(newQuestions);
  }

  async getExtraEmployeeQuestions(orgId, quizId, genre) {
    return orgRepository.fetchExtraEmployeeQuestions(orgId, quizId, genre);
  }

  async getWeeklyUnapprovedQuestions(quizId) {
    return WeeklyQuestion.find({ quizId: quizId });
  }

  async fetchHRDQuestions(orgId) {
    return orgRepository.fetchHRDQuestions(orgId);
  }
}

export default QuestionRepository;
