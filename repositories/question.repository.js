import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { ObjectId } from 'mongodb';
import OrgRepository from './org.repository.js';

const orgRepository = new OrgRepository();

class QuestionRepository {
  async saveQuestion(newQuestion) {
      const question = new Question(newQuestion);
      await question.save();
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
      status: 'live',
    });
  }

  async weeklyQuizQuestions(orgId) {
    const questions = await WeeklyQuestion.find({ org: new ObjectId(orgId) })
      .select({ 'question.answer': 0 })
      .lean();
    return questions.map((curr) => {
      return curr.question;
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
}

export default QuestionRepository;
