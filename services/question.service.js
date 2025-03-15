import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
} from '../api/lambda.api.js';
import QuizService from './quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';

import { ObjectId } from 'mongodb';

const quizService = new QuizService(new QuizRepository());

class QuestionService {
  constructor(
    questionRepository,
    orgRepository,
    employeeRepository,
    quizRepository,
  ) {
    this.questionRepository = questionRepository;
    this.orgRepository = orgRepository;
    this.employeeRepository = employeeRepository;
    this.quizRepository = quizRepository;
  }

  async saveQuestion(newQuestionData, employeeId) {
    const orgId = newQuestionData.orgId;
    const newQuestion =
      await this.questionRepository.saveQuestion(newQuestionData);
    const addedToList = await this.orgRepository.addQuestionToOrg(
      newQuestion,
      orgId,
    );
    await this.employeeRepository.addSubmittedQuestion(
      newQuestion._id,
      employeeId,
    );
    if (!newQuestion || !addedToList) return false;

    return true;
  }

  async scheduleNextWeekQuestionsApproval() {
    const triviaEnabledOrgs = await this.orgRepository.getTriviaEnabledOrgs();

    triviaEnabledOrgs.forEach(async (element) => {
      const genre =
        element.settings.selectedGenre[element.settings.currentGenre];

      const newWeeklyQuiz = await quizService.scheduleNewWeeklyQuiz(
        element._id,
        genre,
      );

      if (newWeeklyQuiz) {
        const quizId = newWeeklyQuiz._id;

        await this.orgRepository.setNextQuestionGenre(
          element._id,
          element.settings.currentGenre,
        );

        this.startQuestionGenerationWorkflow(genre, element, quizId);
      } else {
        console.error(`Error scheduling quiz for org ${element._id}:`);
      }
    });
  }

  async startQuestionGenerationWorkflow(genre, element, quizId) {
    switch (genre) {
      case 'PnA':
        console.log('starting PnA');
        fetchNewPnAQuestions(element.name, element._id, quizId);
        break;

      case 'HRD':
        console.log('starting HRD');
        this.startHRDWorkflow(element._id, quizId);
        break;

      case 'CAnIT':
        console.log('starting CAnIT');
        fetchNewCAnITQuestions(
          element.name,
          element.orgIndustry,
          element.orgCountry,
          element._id,
          quizId,
        );
        break;

      default:
        break;
    }
  }

  formatQuestionsWeeklyFormat(questions, orgId, quizId) {
    return questions.map((curr) => ({
      isApproved: false,
      quizId: quizId,
      question: curr,
      orgId: orgId,
    }));
  }

  formatQuestionsForOrgs(questions, file) {
    return questions.map((question) => {
      return {
        questionId: new ObjectId(question._id),
        isUsed: false,
        ...(file && { file: file }),
      };
    });
  }

  formatQuestionsForDatabase(questions, category) {
    return questions.map((question) => {
      return {
        question: question.question,
        answer: question.answer,
        options: question.options,
        category: category,
        source: 'AI',
        status: 'extra',
        image: null,
        config: {},
      };
    });
  }

  async pushQuestionsForApprovals(questions, orgId, quizId) {
    const refactoredQuestions = this.formatQuestionsWeeklyFormat(
      questions,
      orgId,
      quizId,
    );
    return await this.questionRepository.saveWeeklyQuizQuestions(
      quizId,
      refactoredQuestions,
    );
  }

  async pushQuestionsInOrg(questions, genre, orgId, file) {
    const refactoredQuestions = this.formatQuestionsForOrgs(questions, file);

    return await this.orgRepository.pushQuestionsInOrg(
      refactoredQuestions,
      genre,
      orgId,
    );
  }

  async pushQuestionsToDatabase(questions, category) {
    const refactoredQuestions = this.formatQuestionsForDatabase(
      questions,
      category,
    );

    return await this.questionRepository.addQuestions(refactoredQuestions);
  }

  async addLambdaCallbackQuestions(
    newQuestions,
    category,
    orgId,
    quizId,
    file,
  ) {
    const questions = await this.pushQuestionsToDatabase(
      newQuestions,
      category,
    );

    await this.pushQuestionsInOrg(questions, category, orgId, file);
    if (quizId) await this.pushQuestionsForApprovals(questions, orgId, quizId);
  }

  async validateEmployeeQuestionSubmission(question) {
    let errors = {};

    if (!question.question.trim()) {
      errors.question = 'Question is required.';
    }

    if (!question.category) {
      errors.category = 'Category is required.';
    }

    if (question.category === 'PnA' && !question.config.puzzleType) {
      errors.puzzleType = 'Puzzle type is required for PnA.';
    }

    const nonEmptyOptions = question.options.filter((opt) => opt.trim() !== '');
    if (nonEmptyOptions.length !== 4) {
      errors.options = 'Four options are required.';
    }

    if (question.answer === '') {
      errors.answer = 'Correct answer must be selected.';
    }

    if (question.image) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(question.image.type)) {
        errors.image = 'Only JPG, PNG, and GIF images are allowed.';
      }
      if (question.image.size > 5 * 1024 * 1024) {
        errors.image = 'Image size must be less than 5MB.';
      }
    }

    return Object.keys(errors).length;
  }

  async getExtraEmployeeQuestions(orgId, quizId, quizGenre) {
    return (
      (await this.questionRepository.getExtraEmployeeQuestions(
        orgId,
        quizId,
        quizGenre,
      )) || []
    );
  }

  async approveWeeklyQuizQuestions(unapprovedQuestions, orgId) {
    const idsOfQuestionsToApprove = unapprovedQuestions.map(
      (q) => new ObjectId(q.question._id),
    );

    const quizId = unapprovedQuestions[0].quizId || null;
    const category = unapprovedQuestions[0].question.category || null;

    await this.orgRepository.updateQuestionsStatusInOrgToUsed(
      orgId,
      category,
      idsOfQuestionsToApprove,
    );
    await this.quizRepository.updateQuizStatusToApproved(quizId);
    await this.quizRepository.updateWeeklyQuestionsStatusToApproved(
      idsOfQuestionsToApprove,
    );

    return {
      message: 'Questions approved.',
    };
  }

  async getUpcomingWeeklyQuizByOrgId(orgId) {
    return this.quizRepository.getUpcomingWeeklyQuiz(orgId);
  }

  async getWeeklyUnapprovedQuestions(orgId, quizId) {
    return (
      (await this.questionRepository.getWeeklyUnapprovedQuestions(quizId)) || []
    );
  }

  async getWeeklyQuizCorrectAnswers(orgId) {
    const correctWeeklyQuizAnswers =
      await this.questionRepository.getCorrectWeeklyQuizAnswers(orgId);

    return correctWeeklyQuizAnswers.map((curr) => curr.question);
  }

  async getWeeklyQuizQuestions(orgId) {
    const approvedWeeklyQuizQuestion =
      await this.questionRepository.getApprovedWeeklyQuizQuestion(orgId);

    const quizQuestions = approvedWeeklyQuizQuestion.map((ques) => {
      return ques.question;
    });

    return {
      weeklyQuizQuestions: quizQuestions || [],
      quizId: approvedWeeklyQuizQuestion[0]?.quizId || null,
    };
  }

  async startHRDWorkflow(orgId, quizId) {
    const questions = await this.questionRepository.fetchHRDQuestions(orgId);

    await this.pushQuestionsForApprovals(questions, orgId, quizId);
  }
}

export default QuestionService;
