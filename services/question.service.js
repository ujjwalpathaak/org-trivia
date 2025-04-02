import { ObjectId } from 'mongodb';

import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
} from '../api/lambda.api.js';
import { MIN_EXTRA_PnA_QUESTIONS, MIN_NEW_HRP_QUESTIONS_PER_QUIZ, PnA_QUESTIONS_PER_QUIZ } from '../constants.js';
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
  getExtraQuestionsCount,
  fetchExtraEmployeeQuestions,
  fetchExtraAIQuestions,
} from '../repositories/org.repository.js';
import {
  saveQuestion as saveQuestionRepo,
  saveWeeklyQuizQuestions,
  addQuestions,
  getUnusedQuestionsFromTimeline,
  getWeeklyQuizScheduledQuestions,
} from '../repositories/question.repository.js';
import {
  findQuiz,
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
  await setNextQuestionGenre(org._id, currentGenre);

  scheduledQuizzes.forEach((quiz) => {
    startQuestionGenerationWorkflow(quiz.genre, org, quiz);
  });
}

export async function canConductQuizHRP(orgId) {
  const unusedQuestions = await HRPQuestionsCount(orgId, false);
  return unusedQuestions >= MIN_NEW_HRP_QUESTIONS_PER_QUIZ;
}

export async function startQuestionGenerationWorkflow(genre, org, quiz) {
  const quizId = quiz._id;
  const orgName = org.name;
  const orgId = org._id;

  // also need to write the logic to make quiz available if there are enough questions in future

  switch (genre) {
    case 'PnA':
      console.log('Starting PnA for', orgName);
      fetchNewPnAQuestions(orgName, orgId, quizId);
      break;

    case 'HRP':
      console.log('Starting HRP for', orgName);
      const conductQuizHRP = await canConductQuizHRP(orgId, quizId);
      if (!conductQuizHRP) {
        makeGenreUnavailable(orgId, genre);
      } else {
        makeGenreAvailable(orgId, genre); 
      }
      startHRPWorkflow(orgId, quizId);
      break;

    case 'CAnIT':
      console.log('Starting CAnIT for', orgName);
      startCAnITWorkflow(orgId, quizId);
      break;

    default:
      break;
  }
}

export function formatQuestionsWeeklyFormat(questions, orgId, quizId) {
  return questions.map((curr) => ({
    quizId: quizId,
    question: curr,
    orgId: orgId,
  }));
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
  newsTimeline
) {
  if(category === 'CAnIT') {
    const unusedQuestionsFromTimeline = await getUnusedQuestionsFromTimeline(orgId, newsTimeline);
    const questionsCount = newQuestions.length + unusedQuestionsFromTimeline.length;

    if(questionsCount < CAnIT_QUESTIONS_PER_QUIZ) {
      makeGenreUnavailable(orgId, category);
      return;
    }else{
      makeGenreAvailable(orgId, category);
    }

    // logic to use unusedQuestionsFromTimeline

    return;
  }
  if(category === 'PnA') {
    const extraPnAQuestions = await getExtraQuestionsCount(orgId, category);
    if(extraPnAQuestions < MIN_EXTRA_PnA_QUESTIONS){
      const extraQuestionsNeeded = MIN_EXTRA_PnA_QUESTIONS - extraPnAQuestions;
      newQuestions = newQuestions.slice(0, PnA_QUESTIONS_PER_QUIZ + extraQuestionsNeeded);
    }
  }

  let questions = await pushQuestionsToDatabase(newQuestions, category);
  await pushQuestionsInOrg(questions, category, orgId, file);
  if(category === 'PnA') questions = questions.slice(0, PnA_QUESTIONS_PER_QUIZ);
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

export async function getExtraAIQuestionsService(orgId, quizId, quizGenre) {
  const aiQuestions = await fetchExtraAIQuestions(orgId, quizGenre);
  console.log('aiQuestions', aiQuestions);
  return formatQuestionsWeeklyFormat(aiQuestions, orgId, quizId);
}

export async function getExtraEmployeeQuestionsService(orgId, quizId, quizGenre) {
  const employeeQuestions = await fetchExtraEmployeeQuestions(
    orgId,
    quizGenre,
  );
  console.log(employeeQuestions);
  return formatQuestionsWeeklyFormat(employeeQuestions, orgId, quizId);
}

export async function approveWeeklyQuizQuestionsService(
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
  await updateWeeklyQuestionsStatusToApproved(
    idsOfQuestionsToApprove,
    employeeQuestionsToAdd,
    idsOfQuestionsToDelete,
  );

  return { message: 'Questions approved.' };
}

export async function getWeeklyQuestionsService(orgId, quizId) {
  return (await getWeeklyQuestions(quizId)) || [];
}

export async function getWeeklyQuizCorrectAnswersService(orgId) {
  const correctWeeklyQuizAnswers =
    await getCorrectWeeklyQuizAnswers(orgId);
  return correctWeeklyQuizAnswers.map((curr) => curr.question);
}

export async function fetchHRPQuestions(orgId) {
  return await orgRepository.fetchHRPQuestions(orgId);
}

export async function getWeeklyQuizQuestions(orgId, quizId) {
  const quiz = await findQuiz(quizId);
  console.log('quiz', quiz);
  const weeklyQuizQuestion =
    await getWeeklyQuizScheduledQuestions(orgId);
  const extraEmployeeQuestions = await getExtraEmployeeQuestionsService(
    orgId,
    weeklyQuizQuestion[0]?.quizId,
    quiz.genre
  );
  const extraAIQuestions = await getExtraAIQuestionsService(
    orgId,
    weeklyQuizQuestion[0]?.quizId,
    quiz.genre
  );
  console.log('extraAIQuestions', extraAIQuestions);
  const quizQuestions = weeklyQuizQuestion.map((ques) => ques.question);
  return {
    weeklyQuizQuestions: quizQuestions || [],
    extraEmployeeQuestions: extraEmployeeQuestions || [],
    extraAIQuestions: extraAIQuestions || [],
    quizId: weeklyQuizQuestion[0]?.quizId || null,
  };
}

export async function getWeeklyQuizLiveQuestions(orgId, quizGenre) {
  // const quiz = findQuiz(orgId);
  // const weeklyQuizQuestion =
  //   await getWeeklyQuizScheduledQuestions(orgId);
  // const extraEmployeeQuestions = await getExtraEmployeeQuestionsService(
  //   orgId,
  //   weeklyQuizQuestion[0]?.quizId,
  //   quizGenre
  // );
  // const extraAIQuestions = await getExtraAIQuestionsService(
  //   orgId,
  //   weeklyQuizQuestion[0]?.quizId,
  //   quizGenre
  // );
  // console.log('extraAIQuestions', extraAIQuestions);
  // const quizQuestions = weeklyQuizQuestion.map((ques) => ques.question);
  // return {
  //   weeklyQuizQuestions: quizQuestions || [],
  //   extraEmployeeQuestions: extraEmployeeQuestions || [],
  //   extraAIQuestions: extraAIQuestions || [],
  //   quizId: weeklyQuizQuestion[0]?.quizId || null,
  // };
}

export async function startHRPWorkflow(orgId, quizId) {
  const questions = await orgRepository.fetchHRPQuestions(orgId);
  // const quesReqParaphrase = HRP_QUESTIONS_PER_QUIZ - questions.length;
  // rephraseQuestions(questions_to_rephrase, orgId, quizId)

  await pushQuestionsForApprovals(questions, orgId, quizId);
}

export async function startCAnITWorkflow(org, quizId) {
  fetchNewCAnITQuestions(
    org.name,
    org.orgIndustry,
    org.orgCountry,
    org._id,
    quizId,
    org.companyCurrentAffairsTimeline,
  );
}
