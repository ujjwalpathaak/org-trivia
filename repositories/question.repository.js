import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

import QuizRepository from './quiz.repository.js';
import OrgRepository from './org.repository.js';

const quizRepository = new QuizRepository();
const orgRepository = new OrgRepository();

class QuestionRepository {
  async saveQuestion(newQuestion) {
    return await new Question(newQuestion).save();
  }

  async addQuestions(newQuestions) {
    return await Question.insertMany(newQuestions, { ordered: false });
  }

  async getApprovedWeeklyQuizQuestion(orgId) {
    return await WeeklyQuestion.find({ orgId, isApproved: true })
      .select('-question.answer')
      .lean();
  }

  async dropWeeklyQuestionCollection() {
    return await WeeklyQuestion.deleteMany();
  }

  async updateWeeklyQuestionsStatusToApproved(ids) {
    return await WeeklyQuestion.updateMany(
      { 'question._id': { $in: ids } },
      { $set: { isApproved: true } },
      { multi: true },
    );
  }

  async getCorrectWeeklyQuizAnswers(orgId) {
    return await WeeklyQuestion.find({ orgId })
      .select('question._id question.answer')
      .lean();
  }

  async saveWeeklyQuizQuestions(quizId, newQuestions) {
    await quizRepository.updateQuizStatus(quizId, 'unapproved');
    return await WeeklyQuestion.insertMany(newQuestions);
  }

  async getExtraEmployeeQuestions(orgId, quizId, genre) {
    return await orgRepository.fetchExtraEmployeeQuestions(
      orgId,
      quizId,
      genre,
    );
  }

  async getWeeklyUnapprovedQuestions(quizId) {
    return await WeeklyQuestion.find({ quizId });
  }

  async fetchHRDQuestions(orgId) {
    return await orgRepository.fetchHRDQuestions(orgId);
  }
}

export default QuestionRepository;
