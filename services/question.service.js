import { ObjectId } from 'mongodb';

import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
} from '../api/lambda.api.js';
import employeeRepository from '../repositories/employee.repository.js';
import orgRepository from '../repositories/org.repository.js';
import questionRepository from '../repositories/question.repository.js';
import quizRepository from '../repositories/quiz.repository.js';

async function saveQuestion(newQuestionData, employeeId) {
  const orgId = newQuestionData.orgId;
  const newQuestion = await questionRepository.saveQuestion(newQuestionData);
  const addedToList = await orgRepository.addQuestionToOrg(newQuestion, orgId);
  await employeeRepository.addSubmittedQuestion(newQuestion._id, employeeId);
  return newQuestion && addedToList;
}

async function scheduleNextWeekQuestionsApproval() {
  const triviaEnabledOrgs = await orgRepository.getTriviaEnabledOrgs();
  for (const element of triviaEnabledOrgs) {
    const plainElement = element.toObject();
    await scheduleQuizForOrgService(plainElement);
  }
}

async function scheduleQuizForOrgService(element) {
  const genre = element.settings.selectedGenre[element.settings.currentGenre];
  const newWeeklyQuiz = await quizRepository.scheduleNewWeeklyQuiz(
    element._id,
    genre,
  );
  if (newWeeklyQuiz) {
    const quizId = newWeeklyQuiz._id;
    await orgRepository.setNextQuestionGenre(
      element._id,
      element.settings.currentGenre,
    );
    startQuestionGenerationWorkflow(genre, element, quizId);
  } else {
    console.error(`Error scheduling quiz for org ${element._id}:`);
  }
}

async function startQuestionGenerationWorkflow(genre, element, quizId) {
  switch (genre) {
    case 'PnA':
      // console.log('starting PnA');
      fetchNewPnAQuestions(element.name, element._id, quizId);
      break;
    case 'HRD':
      // console.log('starting HRD');
      await startHRDWorkflow(element._id, quizId);
      break;
    case 'CAnIT':
      // console.log('starting CAnIT');
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

function formatQuestionsWeeklyFormat(questions, orgId, quizId) {
  const extra = getExtraQuestionLimit(questions);
  return questions.map((curr, index) => ({
    isApproved: false,
    quizId: quizId,
    question: curr,
    orgId: orgId,
    type: index >= extra ? 'extra' : 'main',
  }));
}

function getExtraQuestionLimit(questions) {
  if (questions.length > 0 && questions[0].category) {
    const categoryLimits = { CAnIT: 7, PnA: 4, HRD: 10 };
    return categoryLimits[questions[0].category] ?? 7;
  }
  return 7;
}

function formatQuestionsForOrgs(questions, file) {
  return questions.map((question) => ({
    questionId: new ObjectId(question._id),
    isUsed: false,
    ...(file && { file: file }),
  }));
}

function formatQuestionsForDatabase(questions, category) {
  return questions.map((question) => ({
    question: question.question,
    answer: question.answer,
    options: question.options,
    category: category,
    source: 'AI',
    status: 'extra',
    image: null,
    config: {},
  }));
}

async function pushQuestionsForApprovals(questions, orgId, quizId) {
  const refactoredQuestions = formatQuestionsWeeklyFormat(
    questions,
    orgId,
    quizId,
  );
  return await questionRepository.saveWeeklyQuizQuestions(
    quizId,
    refactoredQuestions,
  );
}

async function pushQuestionsInOrg(questions, genre, orgId, file) {
  const refactoredQuestions = formatQuestionsForOrgs(questions, file);
  return await orgRepository.pushQuestionsInOrg(
    refactoredQuestions,
    genre,
    orgId,
  );
}

async function pushQuestionsToDatabase(questions, category) {
  const refactoredQuestions = formatQuestionsForDatabase(questions, category);
  return await questionRepository.addQuestions(refactoredQuestions);
}

async function addLambdaCallbackQuestions(
  newQuestions,
  category,
  orgId,
  quizId,
  file,
) {
  const questions = await pushQuestionsToDatabase(newQuestions, category);
  await pushQuestionsInOrg(questions, category, orgId, file);
  if (quizId) await pushQuestionsForApprovals(questions, orgId, quizId);
}

async function validateEmployeeQuestionSubmission(question) {
  const errors = getValidationErrors(question);
  return Object.keys(errors).length;
}

function getValidationErrors(question) {
  const errors = {};
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
  return errors;
}

async function getExtraEmployeeQuestions(orgId, quizId, quizGenre) {
  const employeeQuestions = await questionRepository.getExtraEmployeeQuestions(
    orgId,
    quizId,
    quizGenre,
  );
  return formatQuestionsWeeklyFormat(employeeQuestions, orgId, quizId);
}

async function approveWeeklyQuizQuestions(
  unapprovedQuestions,
  questionsToDelete,
  orgId,
) {
  const idsOfQuestionsToApprove = unapprovedQuestions.map(
    (q) => new ObjectId(q.question._id),
  );
  const idsOfQuestionsToDelete = questionsToDelete.map(
    (q) => new ObjectId(q.question._id),
  );
  const quizId = unapprovedQuestions[0].quizId || null;
  const category = unapprovedQuestions[0].question.category || null;

  await orgRepository.updateQuestionsStatusInOrgToUsed(
    orgId,
    category,
    idsOfQuestionsToApprove,
    idsOfQuestionsToDelete,
  );
  const employeeQuestionsToAdd = unapprovedQuestions.filter(
    (q) => q.question.source === 'Employee',
  );
  await quizRepository.updateQuizStatusToApproved(quizId);
  await questionRepository.updateWeeklyQuestionsStatusToApproved(
    idsOfQuestionsToApprove,
    employeeQuestionsToAdd,
    idsOfQuestionsToDelete,
  );

  return { message: 'Questions approved.' };
}

async function getUpcomingWeeklyQuizByOrgId(orgId) {
  return quizRepository.getUpcomingWeeklyQuiz(orgId);
}

async function getWeeklyUnapprovedQuestions(orgId, quizId) {
  return (await questionRepository.getWeeklyUnapprovedQuestions(quizId)) || [];
}

async function getWeeklyQuizCorrectAnswers(orgId) {
  const correctWeeklyQuizAnswers =
    await questionRepository.getCorrectWeeklyQuizAnswers(orgId);
  return correctWeeklyQuizAnswers.map((curr) => curr.question);
}

async function fetchHRDQuestions(orgId) {
  return await orgRepository.fetchHRDQuestions(orgId);
}

async function getWeeklyQuizQuestions(orgId) {
  const approvedWeeklyQuizQuestion =
    await questionRepository.getApprovedWeeklyQuizQuestion(orgId);
  const quizQuestions = approvedWeeklyQuizQuestion.map((ques) => ques.question);
  return {
    weeklyQuizQuestions: quizQuestions || [],
    quizId: approvedWeeklyQuizQuestion[0]?.quizId || null,
  };
}

async function startHRDWorkflow(orgId, quizId) {
  const questions = await questionRepository.fetchHRDQuestions(orgId);
  await pushQuestionsForApprovals(questions, orgId, quizId);
}

export default {
  saveQuestion,
  scheduleNextWeekQuestionsApproval,
  startQuestionGenerationWorkflow,
  formatQuestionsWeeklyFormat,
  formatQuestionsForOrgs,
  formatQuestionsForDatabase,
  fetchHRDQuestions,
  pushQuestionsForApprovals,
  pushQuestionsInOrg,
  pushQuestionsToDatabase,
  addLambdaCallbackQuestions,
  validateEmployeeQuestionSubmission,
  getExtraEmployeeQuestions,
  scheduleQuizForOrgService,
  approveWeeklyQuizQuestions,
  getUpcomingWeeklyQuizByOrgId,
  getWeeklyUnapprovedQuestions,
  getWeeklyQuizCorrectAnswers,
  getWeeklyQuizQuestions,
  startHRDWorkflow,
};
