import OrgRepository from '../repositories/org.repository.js';
import OrgService from './org.service.js';
import { getNextFriday } from '../middleware/utils.js';
import {
  fetchNewCAnITQuestions,
  refactorPnAQuestions,
} from '../api/lambda.api.js';
import QuizService from './quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';

const orgRepository = new OrgRepository();
const orgService = new OrgService(orgRepository);

const quizService = new QuizService(new QuizRepository());

class QuestionService {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async saveQuestion(newQuestionData) {
    const newQue = await this.questionRepository.saveQuestion(newQuestionData);

    return { status: 201, data: newQue };
  }

  async saveWeeklyQuizQuestions(newQuestions) {
    await this.questionRepository.saveWeeklyQuizQuestions(newQuestions);
  }

  async formatWeeklyQuestions(data) {
    let { questions, orgId, category } = data;
    const nextFriday = getNextFriday();

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

  async scheduleNextWeekQuestionsApproval() {
    const response = await orgService.getTriviaEnabledOrgs();
    const triviaEnabledOrgs = response.data;

    triviaEnabledOrgs.forEach(async (element) => {
      const genre =
        element.settings.selectedGenre[element.settings.currentGenre];
      
      const response = await quizService.scheduleNewQuiz(element._id, genre);

      if (response.status === 201) {
        await orgRepository.setNextQuestionGenre(
          element._id,
          element.settings.currentGenre,
        );

        switch (genre) {
          case 'PnA':
            // console.log('starting PnA');
            this.startPnAWorkflow(element.name, element._id);
            break;

          case 'HRD':
            console.log('starting HRD');
            // this.startHRDWorkflow();
            break;

          case 'CAnIT':
            console.log('starting CAnIT');
            // this.startCAnITWorkflow(element.name);
            break;

          default:
            break;
        }
      }
    });
  }

  async fetchPnAQuestions() {
    return await this.questionRepository.fetchPnAQuestions();
  }

  async startPnAWorkflow(companyName, orgId) {
    const tempPnAQuestions = await this.fetchPnAQuestions();
    const finalPnAQuestions = await refactorPnAQuestions(
      companyName,
      tempPnAQuestions,
      orgId,
    );

    const response = await this.pushQuestionsForApproval(finalPnAQuestions, "PnA", orgId)

    return response;
  }

  async pushQuestionsForApproval(questions, category, orgId){
    const response = await this.questionRepository.pushQuestionsForApproval(questions, category, orgId);

    if(response?.status === 500) return { status: 500, message: "Couldn't push questions for approval" };

    return { status: 200, message: 'Questions pushed for approval' };
  }

  async startCAnITWorkflow(orgName, orgIndustry, orgId) {
    const finalCAnITQuestions = await fetchNewCAnITQuestions(
      orgName,
      orgIndustry,
      orgId,
    );
  }

  async startHRDWorkflow() {
    // startHRDWorkflow
  }

  async fetchHRDQuestions() {
    // logic for fetchHRDQuestions
  }

  async getWeeklyUnapprovedQuestions(orgId) {
    const weeklyUnapprovedQuestions =
      await this.questionRepository.getWeeklyUnapprovedQuestions(orgId);

    return { status: 200, data: weeklyUnapprovedQuestions };
  }

  async getWeeklyQuizAnswers(orgId) {
    const weeklyQuizAnswers =
      await this.questionRepository.weeklyQuizAnswers(orgId);
    return weeklyQuizAnswers;
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
