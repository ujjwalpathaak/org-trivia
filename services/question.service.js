import {
  fetchNewCAnITQuestions,
  refactorPnAQuestionsToOrgContext,
} from '../api/lambda.api.js';
import QuizService from './quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';

import { ObjectId } from 'mongodb';

const quizService = new QuizService(new QuizRepository());

class QuestionService {
  constructor(questionRepository, orgRepository) {
    this.questionRepository = questionRepository;
    this.orgRepository = orgRepository;
  }

  async saveQuestion(newQuestionData) {
    const orgId = newQuestionData.orgId;
    const newQuestion =
      await this.questionRepository.saveQuestion(newQuestionData);
    const addedToList = await this.orgRepository.addQuestionToOrg(
      newQuestion,
      orgId,
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
        this.startPnAWorkflow(element.name, element._id, quizId);
        break;

      case 'HRD':
        console.log('starting HRD');
        this.startHRDWorkflow(element._id, quizId);
        break;

      case 'CAnIT':
        console.log('starting CAnIT');
        fetchNewCAnITQuestions(
          element.name,
          'Information Technology',
          element._id,
          quizId,
        );
        break;

      default:
        break;
    }
  }

  async formatQuestionsWeeklyFormat(questions, orgId, quizId) {
    return questions.map((curr) => ({
      isApproved: false,
      quizId: quizId,
      question: curr,
      orgId: orgId,
    }));
  }

  async formatQuestionsForOrgs(questions) {
    return questions.map((question) => {
      return {
        questionId: new ObjectId(question._id),
        isUsed: false,
      };
    });
  }

  async formatQuestionsForDatabase(questions, category) {
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
    const refactoredQuestions = await this.formatQuestionsWeeklyFormat(
      questions,
      orgId,
      quizId,
    );
    return await this.questionRepository.saveWeeklyQuizQuestions(
      refactoredQuestions,
    );
  }

  async pushQuestionsInOrg(questions, orgId, genre) {
    const refactoredQuestions = await this.formatQuestionsForOrgs(questions);

    return await this.questionRepository.pushQuestionsInOrg(
      refactoredQuestions,
      orgId,
      genre,
    );
  }

  async pushQuestionsToDatabase(questions, category) {
    const refactoredQuestions = await this.formatQuestionsForDatabase(
      questions,
      category,
    );

    return await this.questionRepository.addQuestions(refactoredQuestions);
  }

  async startPnAWorkflow(companyName, orgId, quizId) {
    const pnAQuestions = await this.questionRepository.fetchPnAQuestions(orgId);

    const refactoredPnAQuestions = await refactorPnAQuestionsToOrgContext(
      companyName,
      pnAQuestions,
      orgId,
    );

    await this.pushQuestionsForApprovals(refactoredPnAQuestions, orgId, quizId);
  }

  async addLambdaCallbackCAnITQuestions(newQuestions, category, orgId, quizId) {
    const questions = await this.pushQuestionsToDatabase(
      newQuestions,
      category,
    );

    await this.pushQuestionsForApprovals(questions, orgId, quizId);
    await this.pushQuestionsInOrg(questions, orgId, 'CAnIT');
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

  async getExtraAIQuestions(orgId, quizId, quizGenre) {
    return (
      (await this.questionRepository.getExtraAIQuestions(quizId, quizGenre)) ||
      []
    );
  }

  async getExtraEmployeeQuestions(orgId, quizId, quizGenre) {
    return (
      (await this.questionRepository.getExtraEmployeeQuestions(
        quizId,
        quizGenre,
      )) || []
    );
  }

  async getUpcomingWeeklyQuizByOrgId(orgId) {
    return this.questionRepository.getUpcomingWeeklyQuiz(orgId);
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

  async startHRDWorkflow(orgId, quizId) {
    const questions = await this.questionRepository.fetchHRDQuestions(orgId);

    await this.pushQuestionsForApprovals(questions, orgId, quizId);
  }

  // async savePnAQuestion(orgId, quizId, question) { return }

  async saveHRdocQuestions(orgId, questions) {
    const refactoredQuestions = await this.pushQuestionsToDatabase(
      questions,
      'HRD',
    );

    await this.pushQuestionsInOrg(refactoredQuestions, orgId, 'HRD');

    return { status: 200, message: 'HRD Questions saved successfully' };
  }
}

export default QuestionService;
