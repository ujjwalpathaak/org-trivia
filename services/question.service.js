import OrgRepository from '../repositories/org.repository.js';
import OrgService from './org.service.js';
import { getNextFriday } from '../middleware/utils.js';
import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
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

  async saveWeeklyQuestions(newQuestions) {
    await this.questionRepository.saveWeeklyQuestions(newQuestions);
  }

  async formatWeeklyQuestions(data) {
    const JSONdata = data;

    let questions = JSONdata.quesitons;
    const orgId = JSONdata.orgId;
    const category = JSONdata.category;
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
        //  add orgIds
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
    const tempPnAQuestions = await this.selectTempPnAQuestions();
    const finalPnAQuestions = await this.makeFinalPnAQuestions(
      companyName,
      tempPnAQuestions,
      orgId,
    );
    console.log('startPnAWorkflow - finalPnAQuestions', finalPnAQuestions);

    // send questions for approval.
  }

  async startCAnITWorkflow() {
    const finalCAnITQuestions = await this.makeCAnITQuestions();

    console.log(finalCAnITQuestions);
    // send questions for approval.
  }

  async startHRDWorkflow() {
    // startHRDWorkflow
  }

  async selectTempPnAQuestions() {
    // logic for selectPnAQuestions
    // currently hardcode it.
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

    return tempPnAQuestions;
  }

  async makeFinalPnAQuestions(companyName, PnAQuestions, orgId) {
    const finalPnAQuestions = await fetchNewPnAQuestions(
      companyName,
      PnAQuestions,
      orgId,
    );

    return finalPnAQuestions;
  }

  async makeCAnITQuestions(companyName, companyIndustry) {
    const finalCAnITQuestions = await fetchNewCAnITQuestions(
      companyName,
      companyIndustry,
    );

    return finalCAnITQuestions;
  }

  async fetchHRDQuestions() {
    // logic for fetchHRDQuestions
  }

  async getWeeklyUnapprovedQuestions(orgId) {
    const weeklyUnapprovedQuestions =
      await this.questionRepository.getWeeklyUnapprovedQuestions(orgId);
    return { status: 200, data: weeklyUnapprovedQuestions };
  }
}

export default QuestionService;
