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

  async fetchPnAQuestions(orgId) {
    const simplePnAQuestions = await Org.aggregate([
      {
        $match: {
          _id: orgId, // Match by the given orgId
        },
      },
      {
        $unwind: '$questionsPnA', // Flatten the questionsPnA array
      },
      {
        $group: {
          _id: '$questionsPnA.puzzleType', // Group by puzzleType
          question: { $first: '$questionsPnA' }, // Pick the first question per puzzleType
        },
      },
      {
        $lookup: {
          from: 'questions', // Collection to join with
          localField: 'question.questionId', // Use questionId from questionsPnA
          foreignField: '_id', // Matching ID in questions collection
          as: 'questionDetails', // Returns an array of matched documents
        },
      },
      {
        $unwind: '$questionDetails', // Flatten questionDetails to get individual question objects
      },
      {
        $replaceRoot: {
          newRoot: '$questionDetails', // Replace the root document with questionDetails
        },
      },
    ]);

    return simplePnAQuestions;
  }

  async pushQuestionsForApproval(refactoredPnAQuestions, orgId, quizId) {
    console.log(orgId);
    const formatedQuestionsWeeklyFormat =
      await quizService.formatQuestionsWeeklyFormat(
        refactoredPnAQuestions,
        orgId,
        quizId,
      );

    await this.saveWeeklyQuizQuestions(formatedQuestionsWeeklyFormat);
  }

  async saveWeeklyQuizQuestions(newQuestions) {
    return await WeeklyQuestion.insertMany(newQuestions);
  }

  // ----------------------------------------------------------------

  // get quizID & then get questions for that qioz odf
  async getWeeklyUnapprovedQuestions(orgId) {
    const quiz = await Quiz.findOne({
      orgId: new ObjectId(orgId),
      status: 'unapproved',
    });
    if (!quiz) return false;

    const quizId = quiz._id;

    const weeklyQuizQuestions = await WeeklyQuestion.find({ quizId: quizId });
    console.log(weeklyQuizQuestions);
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
    console.log(formatedWeeklyQuizCorrectAnswers);

    return formatedWeeklyQuizCorrectAnswers;
  }

  async saveHRdocQuestions(orgId, questions) {
    return Question.insertMany(questions);
  }
}

export default QuestionRepository;
