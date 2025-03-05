import OrgRepository from '../repositories/org.repository.js';
import OrgService from './org.service.js';
import { getNextFridayDate } from '../middleware/utils.js';
import {
  fetchNewCAnITQuestions,
  refactorPnAQuestionsToOrgContext,
} from '../api/lambda.api.js';
import QuizService from './quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';

const orgService = new OrgService(new OrgRepository());
const quizService = new QuizService(new QuizRepository());

class QuestionService {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async saveQuestion(newQuestionData) {
    const newQuestion =
      await this.questionRepository.saveQuestion(newQuestionData);
    if (!newQuestion) return false;

    return true;
  }

  async startQuestionGenerationWorkflow(genre, element, quizId) {
    // console.log(genre, element, quizId);
    switch ('PnA') {
      case 'PnA':
        console.log('starting PnA');
        this.startPnAWorkflow(element.name, element._id, quizId);
        break;

      case 'HRD':
        console.log('starting HRD');
        // this.startHRDWorkflow();
        break;

      case 'CAnIT':
        console.log('starting CAnIT');
        // fetchNewCAnITQuestions('Microsoft', 'IT Services', orgId, quizId);
        break;

      default:
        break;
    }
  }

  async scheduleNextWeekQuestionsApproval() {
    const triviaEnabledOrgs = await orgService.getTriviaEnabledOrgs();

    triviaEnabledOrgs.forEach(async (element) => {
      const genre =
        element.settings.selectedGenre[element.settings.currentGenre];

      const newWeeklyQuiz = await quizService.scheduleNewQuiz(
        element._id,
        genre,
      );

      if (newWeeklyQuiz) {
        const quizId = newWeeklyQuiz._id;
        await orgService.setNextQuestionGenre(
          element._id,
          element.settings.currentGenre,
        );

        this.startQuestionGenerationWorkflow(genre, element, quizId);
      } else {
        console.error(`Error scheduling quiz for org ${element._id}:`);
      }
    });
  }

  async startPnAWorkflow(companyName, orgId, quizId) {
    const simplePnAQuestions =
      await this.questionRepository.fetchPnAQuestions(orgId);

    const refactoredPnAQuestions = await refactorPnAQuestionsToOrgContext(
      companyName,
      simplePnAQuestions,
      orgId,
    );

    await this.questionRepository.pushQuestionsForApproval(
      refactoredPnAQuestions,
      orgId,
      quizId,
    );
  }

  async getWeeklyUnapprovedQuestions(orgId) {
    const weeklyUnapprovedQuestions =
      await this.questionRepository.getWeeklyUnapprovedQuestions(orgId);

    return weeklyUnapprovedQuestions;
  }

  // ----------------------------------------------------------------
  async saveWeeklyQuizQuestions(newQuestions) {
    await this.questionRepository.saveWeeklyQuizQuestions(newQuestions);
  }

  async formatQuestionsWeeklyFormat(data) {
    let { questions, orgId, category } = data;
    const nextFriday = getNextFridayDate();

    const weeklyQuestions = questions.map((curr) => ({
      scheduledDate: nextFriday,
      question: {
        ...curr,
        source: 'AI',
        category: category,
        status: 'live',
        org: orgId,
      },
      org: orgId,
    }));

    return weeklyQuestions;
  }

  async startHRDWorkflow() {
    // startHRDWorkflow
  }

  async fetchHRDQuestions() {
    // logic for fetchHRDQuestions
  }

  async getWeeklyQuizCorrectAnswers(orgId) {
    const weeklyQuizCorrectAnswers =
      await this.questionRepository.getWeeklyQuizCorrectAnswers(orgId);

    return weeklyQuizCorrectAnswers;
  }

  formatHRDQuestions(orgId, questions) {
    return questions.map((curr) => ({
      ...curr,
      source: 'AI',
      category: 'HRD',
      status: 'extra',
      org: orgId,
    }));
  }

  async saveHRdocQuestions(orgId, questions) {
    const formatedQuestions = await this.formatHRDQuestions(orgId, questions);
    await this.questionRepository.saveHRdocQuestions(orgId, formatedQuestions);

    return { status: 200, message: 'Content saved successfully' };
  }
}

export default QuestionService;
