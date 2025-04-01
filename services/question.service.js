import { ObjectId } from 'mongodb';

import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
} from '../api/lambda.api.js';
import { MIN_NEW_HRP_QUESTIONS_PER_QUIZ } from '../constants.js';
import { getFridaysOfNextMonth } from '../middleware/utils.js';
import {
  addSubmittedQuestion,
} from '../repositories/employee.repository.js';
import {
  addQuestionToOrg,
  getTriviaEnabledOrgs,
  setNextQuestionGenre,
  HRPQuestionsCount,
  makeGenreUnavailable,
  makeGenreAvailable,
  pushQuestionsInOrg as pushQuestionsInOrgRepo,
} from '../repositories/org.repository.js';
import {
  saveQuestion as saveQuestionRepo,
  saveWeeklyQuizQuestions,
  addQuestions,
} from '../repositories/question.repository.js';
import {
  scheduleNewWeeklyQuiz,
} from '../repositories/quiz.repository.js';

export async function saveQuestion(newQuestionData, employeeId) {
  const orgId = newQuestionData.orgId;
  const newQuestion = await saveQuestionRepo(newQuestionData);
  const addedToList = await addQuestionToOrg(newQuestion, orgId);
  await addSubmittedQuestion(newQuestion._id, employeeId);
  return newQuestion && addedToList;
}

export async function scheduleQuizzesJob() {
  const triviaEnabledOrgs = await getTriviaEnabledOrgs();
  for (const org of triviaEnabledOrgs) {
    const plainElement = org.toObject();
    await scheduleQuizForOrgService(plainElement);
  }
}

export async function scheduleQuizForOrgService(org) {
  let currentGenre = org.settings.currentGenre;
  let allGenres = org.settings.selectedGenre;
  let fridaysOfMonth = getFridaysOfNextMonth();

  const scheduledQuizzes = [];

  for (const friday of fridaysOfMonth) {
    const genre = allGenres[currentGenre];

    const quiz = await scheduleNewWeeklyQuiz(
      org._id,
      friday,
      genre,
    );
    scheduledQuizzes.push(quiz);

    currentGenre = (currentGenre + 1) % allGenres.length;
  }

  await setNextQuestionGenre(org._id, currentGenre - 1);

  scheduledQuizzes.forEach((quiz) => {
    startQuestionGenerationWorkflow(quiz.genre, org, quiz._id);
  });
}

export async function canConductQuizHRP(orgId) {
  const unusedQuestions = await HRPQuestionsCount(orgId, false);
  return unusedQuestions >= MIN_NEW_HRP_QUESTIONS_PER_QUIZ;
}

export async function canConductQuizCAnIT(orgId) {
  // steps to check if can conduct quizzes
  // see duration set - eg past 2 weeks
  // check if there are unused questions from last 2 weeks - can be possible only when this quiz is being run in overlapped time frame.
  // if yes, then count how many questions are there
  // if count is less than 5, then return false
  // else return true
}

export async function startQuestionGenerationWorkflow(genre, org, quizId) {
  switch (genre) {
    case 'PnA':
      console.log('Starting PnA for', org.name);
      fetchNewPnAQuestions(org.name, org._id, quizId);
      break;
    case 'HRD':
      console.log('Starting HRD for', org.name);
      const conductQuizHRP = await canConductQuizHRP(org._id, quizId);
      if (!conductQuizHRP) {
        makeGenreUnavailable(org._id, genre);
      } else {
        makeGenreAvailable(org._id, genre); 
      }
      startHRDWorkflow(org._id, quizId);
      break;
    case 'CAnIT':
      console.log('Starting CAnIT for', org.name);
      const conductQuizCAnIT = await canConductQuizCAnIT(org._id, quizId);
      if (!conductQuizCAnIT) {
        makeGenreUnavailable(org._id, genre);
      } else {
        makeGenreAvailable(org._id, genre); 
      }
      fetchNewCAnITQuestions(
        org.name,
        org.orgIndustry,
        org.orgCountry,
        org._id,
        quizId,
        org.companyCurrentAffairsTimeline,
      );
      break;
    default:
      break;
  }
}

export function formatQuestionsWeeklyFormat(questions, orgId, quizId) {
  const extra = getExtraQuestionLimit(questions);
  return questions.map((curr, index) => ({
    isApproved: false,
    quizId: quizId,
    question: curr,
    orgId: orgId,
    type: index >= extra ? 'extra' : 'main',
  }));
}

export function getExtraQuestionLimit(questions) {
  if (questions.length > 0 && questions[0].category) {
    const categoryLimits = { CAnIT: 7, PnA: 4, HRD: 10 };
    return categoryLimits[questions[0].category] ?? 7;
  }
  return 7;
}

export function formatQuestionsForOrgs(questions, file) {
  return questions.map((question) => ({
    questionId: new ObjectId(question._id),
    isUsed: false,
    ...(file && { file: file }),
  }));
}

export function formatQuestionsForDatabase(questions, category) {
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

export async function pushQuestionsForApprovals(questions, orgId, quizId) {
  const refactoredQuestions = formatQuestionsWeeklyFormat(
    questions,
    orgId,
    quizId,
  );
  return await saveWeeklyQuizQuestions(
    quizId,
    refactoredQuestions,
  );
}

export async function pushQuestionsInOrg(questions, genre, orgId, file) {
  const refactoredQuestions = formatQuestionsForOrgs(questions, file);
  return await pushQuestionsInOrgRepo(
    refactoredQuestions,
    genre,
    orgId,
  );
}

export async function pushQuestionsToDatabase(questions, category) {
  const refactoredQuestions = formatQuestionsForDatabase(questions, category);
  return await addQuestions(refactoredQuestions);
}

export async function addLambdaCallbackQuestions(
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

export async function validateEmployeeQuestionSubmission(question) {
  const errors = getValidationErrors(question);
  return Object.keys(errors).length;
}

export function getValidationErrors(question) {
  const errors = {};
  if (!question.question.trim()) {
    errors.question = 'Question is required.';
  }
  if (!question.category) {
    errors.category = 'Category is required.';
  }
  if (question.category === 'PnA' && !question.config.puzzleType) {
    errors.puzzleType = 'Puzzle type is required for PnA questions.';
  }
  if (!question.answer) {
    errors.answer = 'Answer is required.';
  }
  if (!question.options || question.options.length < 4) {
    errors.options = 'At least 4 options are required.';
  }
  return errors;
}

export async function getExtraEmployeeQuestions(orgId, quizId, quizGenre) {
  const employeeQuestions = await questionRepository.getExtraEmployeeQuestions(
    orgId,
    quizId,
    quizGenre,
  );
  return formatQuestionsWeeklyFormat(employeeQuestions, orgId, quizId);
}

export async function approveWeeklyQuizQuestions(
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

export async function getWeeklyQuestionsService(orgId, quizId) {
  return (await questionRepository.getWeeklyQuestions(quizId)) || [];
}

export async function getWeeklyQuizCorrectAnswersService(orgId) {
  const correctWeeklyQuizAnswers =
    await questionRepository.getCorrectWeeklyQuizAnswers(orgId);
  return correctWeeklyQuizAnswers.map((curr) => curr.question);
}

export async function fetchHRDQuestions(orgId) {
  return await orgRepository.fetchHRDQuestions(orgId);
}

export async function getWeeklyQuizQuestions(orgId) {
  const approvedWeeklyQuizQuestion =
    await questionRepository.getApprovedWeeklyQuizQuestion(orgId);
  const quizQuestions = approvedWeeklyQuizQuestion.map((ques) => ques.question);
  return {
    weeklyQuizQuestions: quizQuestions || [],
    quizId: approvedWeeklyQuizQuestion[0]?.quizId || null,
  };
}

export async function startHRDWorkflow(orgId, quizId) {
  const questions = await orgRepository.fetchHRDQuestions(orgId);
  // const quesReqParaphrase = HRP_QUESTIONS_PER_QUIZ - questions.length;
  // rephraseQuestions(questions_to_rephrase, orgId, quizId)

  await pushQuestionsForApprovals(questions, orgId, quizId);
}
