import OrgRepository from '../repositories/org.repository.js';
import OrgService from './org.service.js';
import { getNextFriday } from '../middleware/utils.js';
import {
  fetchNewCAnITQuestions,
  refactorPnAQuestions,
} from '../api/lambda.api.js';

const orgRepository = new OrgRepository();
const orgService = new OrgService(orgRepository);

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

  async scheduleQuestionsForNextWeek() {
    const response = await orgService.getTriviaEnabledOrgs();
    const triviaEnabledOrgs = response.data;

    triviaEnabledOrgs.forEach((element) => {
      const genre =
        element.settings.selectedGenre[element.settings.currentGenre];
      switch (genre) {
        case 'PnA':
          this.startPnAWorkflow(element.name);
          break;

        case 'HRD':
          this.startHRDWorkflow();
          break;

        case 'CAnIT':
          this.startCAnITWorkflow(element.name);
          break;

        default:
          break;
      }
    });
  }

  async startPnAWorkflow(companyName, orgId) {
    const tempPnAQuestions = [
      {
        question:
          'Golu starts from his house and walks 8 km north. Then, he turns left and walks 6 km. What is the shortest distance from his house?',
        img: null,
        options: ['10 km', '16 km', '14 km', '2 km'],
        answer: 0,
        refactor: false,
      },
      {
        question:
          'P starts walking 25 m west from his house, then turns right and walks 10 m. He turns right again and walks 15 m. After this, he turns right at an angle of 135° and walks 30 m. In which direction is he now heading?',
        img: null,
        options: ['West', 'South', 'South-West', 'South-East'],
        answer: 2,
        refactor: true,
      },
      {
        question:
          'X starts walking straight south for 5 m, then turns left and walks 3 m. After that, he turns right and walks another 5 m. In which direction is X facing now?',
        img: null,
        options: ['North-East', 'South', 'North', 'South-West'],
        answer: 1,
        refactor: true,
      },
      {
        question:
          'Hemant leaves his house, which is in the east, and reaches a crossing. The road to his left leads to a theatre, while the road straight ahead leads to a hospital. In which direction is the university?',
        img: null,
        options: ['North', 'South', 'East', 'West'],
        answer: 0,
        refactor: false,
      },
    ];
    const finalPnAQuestions = await refactorPnAQuestions(
      companyName,
      tempPnAQuestions,
      orgId,
    );

    return finalPnAQuestions;
  }

  async startCAnITWorkflow(orgName, orgIndustry, orgId) {
    const finalCAnITQuestions = await fetchNewCAnITQuestions(
      orgName,
      orgIndustry,
      orgId,
    );

    return finalCAnITQuestions;
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
      console.log('weeklyUnapprovedQuestions', weeklyUnapprovedQuestions)
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
