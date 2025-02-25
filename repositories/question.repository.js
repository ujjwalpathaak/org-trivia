import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { ObjectId } from 'mongodb';

class QuestionRepository {
  async saveQuestion(newQuestion) {
    return await new Question(newQuestion).save();
  }

  async saveWeeklyQuestions(newQuestions) {
    try {
      return await WeeklyQuestion.insertMany(newQuestions);
    } catch (err) {
      console.log(err);
    }
  }

  async getWeeklyUnapprovedQuestions(orgId) {
    return await WeeklyQuestion.find({
      org: new ObjectId(orgId),
      isApproved: false,
    });
  }
}

export default QuestionRepository;
