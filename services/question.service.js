import OrgRepository from '../repositories/org.repository.js';
import OrgService from './org.service.js';
import { getNextFriday } from '../middleware/utils.js';

const API_GATEWAY_URL =
  'https://w6d724kzj1.execute-api.eu-north-1.amazonaws.com';

const orgRepository = new OrgRepository();
const orgService = new OrgService(orgRepository);

class QuestionService {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async saveQuestion(newQuestion) {
    return this.questionRepository.saveQuestion(newQuestion);
  }

  async saveWeeklyQuestions(newQuestions) {
    return this.questionRepository.saveWeeklyQuestions(newQuestions);
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

    return { weeklyQuestions, orgId };
  }

  async scheduleQuestionsForNextWeek() {
    const triviaEnabledOrgs = await orgService.getTriviaEnabledOrgs();
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
    console.log('startPnAWorkflow - startPnAWorkflow', companyName, orgId);
    const tempPnAQuestions = await this.selectTempPnAQuestions();
    console.log('startPnAWorkflow - tempPnAQuestions', tempPnAQuestions);
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
    console.log(
      'makeFinalPnAQuestions - makeFinalPnAQuestions',
      companyName,
      PnAQuestions,
      orgId,
    );
    try {
      const response = await fetch(API_GATEWAY_URL + '/generatePnA_Questions', {
        method: 'POST',
        headers: {
          'x-api-key': 'your-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyName,
          PnAQuestions: PnAQuestions,
          orgId: orgId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const finalPnAQuestions = await response.json();
      return finalPnAQuestions;
    } catch (error) {
      throw new Error('Error fetching PnA Questions:', error);
    }
  }

  async makeCAnITQuestions(companyName, PnAQuestions) {
    try {
      const response = await fetch(
        API_GATEWAY_URL + '/generateCAnIT_Questions',
        {
          method: 'POST',
          headers: {
            'x-api-key': 'your-api-key',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: companyName,
            companyIndustry: companyIndustry,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const finalCAnITQuestions = await response.json();
      return finalCAnITQuestions;
    } catch (error) {
      throw new Error('Error fetching PnA Questions:', error);
    }
  }

  async fetchHRDQuestions() {
    // logic for fetchHRDQuestions
  }

  async getWeeklyUnapprovedQuestions(orgId) {
    return this.questionRepository.getWeeklyUnapprovedQuestions(orgId);
  }
}

export default QuestionService;
