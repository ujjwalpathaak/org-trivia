import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { ObjectId } from 'mongodb';
import OrgRepository from './org.repository.js';

const orgRepository = new OrgRepository();

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
}

export default QuestionRepository;
