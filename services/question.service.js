import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
} from '../api/lambda.api.js';

import {
  HRP_QUESTIONS_PER_QUIZ,
  PnA_QUESTIONS_PER_QUIZ,
} from '../constants.js';

import { getFridaysOfNextMonth } from '../middleware/utils.js';

import { addSubmittedQuestion } from '../repositories/employee.repository.js';

import {
  pushQuestionsInOrgRepo,
  fetchExtraAIQuestions,
  fetchExtraEmployeeQuestions,
  fetchHRPQuestions,
  fetchPnAQuestions,
  getOrgCAnITDropdownValue,
  getTriviaEnabledOrgs,
  HRPQuestionsCount,
  isGenreAvailable,
  makeGenreUnavailable,
  removeAllQuestionsPnAFromOrg,
  setNextQuestionGenre,
  getPnAQuestionsLeft
} from '../repositories/org.repository.js';

import {
  addQuestions,
  editQuizQuestions,
  getCAnITQuestionsInTimeline,
  getWeeklyQuizScheduledQuestions,
  removeQuestionsPnAFromDatabase,
  createNewQuestion,
  saveWeeklyQuiz,
} from '../repositories/question.repository.js';

import {
  findQuiz,
  getCAnITQuizzesScheduledTomm,
  lastQuizByGenre,
  scheduleNewWeeklyQuiz,
} from '../repositories/quiz.repository.js';

export const scheduleNextMonthQuizzesJob = async () => {
  const triviaEnabledOrgs = await getTriviaEnabledOrgs();

  triviaEnabledOrgs.forEach((org) => {
    const orgObject = org.toObject();
    scheduleQuizForOrgService(orgObject).catch((err) => {
      console.error(`Error scheduling for org ${orgObject._id}:`, err);
    });
  });

  return { message: 'Scheduling started in background' };
};

const scheduleQuizForOrgService = async (org) => {
  const { currentGenre, selectedGenre: allGenres } = org.settings;
  const fridaysOfMonth = getFridaysOfNextMonth();

  const scheduledQuizzes = [];

  let nextGenreIndex = currentGenre;

  for (const friday of fridaysOfMonth) {
    const genre = allGenres[nextGenreIndex];
    const quiz = await scheduleNewWeeklyQuiz(org._id, friday, genre);
    scheduledQuizzes.push(quiz);
    nextGenreIndex = (nextGenreIndex + 1) % allGenres.length;
  }

  await setNextQuestionGenre(org._id, nextGenreIndex);

  await checkIfMorePnAQuestionsNeeded(org, scheduledQuizzes);

  await Promise.all(
    scheduledQuizzes.map((quiz) =>
      startQuestionGenerationWorkflow(quiz.genre, org, quiz).catch((err) => {
        console.error(
          `Failed to start question generation for quiz ${quiz._id}:`,
          err,
        );
      }),
    ),
  );
};

const checkIfMorePnAQuestionsNeeded = async (org, scheduledQuizzes) => {
  const orgId = org._id;
  const orgName = org.name;

  const pnaQuizzes = scheduledQuizzes.filter((q) => q.genre === 'PnA');
  const requiredPnACount = pnaQuizzes.length * PnA_QUESTIONS_PER_QUIZ;

  if (requiredPnACount === 0) return;

  const [{ count: availablePnACount = 0 } = {}] =
    await getPnAQuestionsLeft(orgId);

  if (availablePnACount > requiredPnACount) return;

  const questionsToRemove = await removeAllQuestionsPnAFromOrg(orgId);
  await removeQuestionsPnAFromDatabase(questionsToRemove);

  const { questions: fetchedQuestions } = await fetchNewPnAQuestions(orgName);

  const insertedQuestions = await pushQuestionsToDatabase(
    fetchedQuestions,
    'PnA',
  );
  await addQuestionstoOrg(insertedQuestions, 'PnA', orgId);
};

const startQuestionGenerationWorkflow = async (genre, org, quiz) => {
  const { _id: quizId } = quiz;
  const { _id: orgId, name: orgName } = org;

  switch (genre) {
    case 'PnA':
      console.log(`[${orgName}] Starting PnA workflow`);
      await startPnAWorkflow(orgName, orgId, quizId);
      break;

    case 'HRP':
      console.log(`[${orgName}] Starting HRP workflow`);
      const isAvailable = await isGenreAvailable(orgId, 'HRP');

      if (isAvailable) {
        const canConduct = await canConductQuizHRP(orgId, quizId);
        if (!canConduct) {
          await makeGenreUnavailable(orgId, genre);
          console.warn(
            `[${orgName}] HRP quiz not allowed, genre marked unavailable`,
          );
          return;
        }

        await startHRPWorkflow(orgId, quizId);
      } else {
        console.warn(`[${orgName}] HRP genre is not available`);
      }
      break;

    default:
      console.warn(`[${orgName}] Unknown genre: ${genre}`);
      break;
  }
};

const addQuestionsToQuiz = async (questions, orgId, quizId, genre) => {
  const questionIds = questions.map((curr) => curr._id);
  const data = {
    questions: questionIds,
    quizId: quizId,
    orgId: orgId,
  };

  return await saveWeeklyQuiz(orgId, quizId, data, genre);
};

const addQuestionstoOrg = async (questions, genre, orgId, file) => {
  const refactoredQuestions = questions.map((question) => ({
    questionId: question._id,
    ...(question.config.puzzleType && {
      puzzleType: question.config.puzzleType,
    }),
    ...(file && { file: file }),
  }));

  return await pushQuestionsInOrgRepo(refactoredQuestions, genre, orgId);
};

const pushQuestionsToDatabase = async (questions, category) => {
  const refactoredQuestions = questions.map((question) => ({
    question: question.question,
    answer: question.answer,
    options: question.options,
    category: category,
    source: 'AI',
    status: 'extra',
    config: {
      puzzleType: question.puzzleType,
    },
  }));

  return await addQuestions(refactoredQuestions);
};

const startPnAWorkflow = async (orgName, orgId, quizId) => {
  const questions = await fetchPnAQuestions(orgId);

  await addQuestionsToQuiz(questions, orgId, quizId, 'PnA');
};

const canConductQuizHRP = async (orgId) => {
  const unusedQuestions = await HRPQuestionsCount(orgId, false);
  return unusedQuestions >= HRP_QUESTIONS_PER_QUIZ;
};

const startHRPWorkflow = async (orgId, quizId) => {
  const questions = await fetchHRPQuestions(orgId);
  await addQuestionsToQuiz(questions, orgId, quizId, 'HRP');
};

export const addNewHRPQuestionsCallbackService = async (
  newQuestions,
  orgId,
  file,
) => {
  let questions = await pushQuestionsToDatabase(newQuestions, 'HRP');
  await addQuestionstoOrg(questions, 'HRP', orgId, file);
}

export const validateEmployeeQuestionSubmission = (question) => {
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

  return Object.keys(errors).length;
};

export const editQuizQuestionsService = async (
  questionsToEdit,
  questionsToDelete,
  orgId
) => {
  await editQuizQuestions(questionsToEdit);

  return { message: 'Questions Edited.' };
};

export const getWeeklyQuizQuestions = async (orgId, quizId) => {
  const quiz = await findQuiz(quizId);
  const quizGenre = quiz.genre;

  const weeklyQuizQuestion = await getWeeklyQuizScheduledQuestions(
    orgId,
    quizId,
  );

  const extraEmployeeQuestions = await fetchExtraEmployeeQuestions(
    orgId,
    quizGenre,
  );

  const extraAIQuestions = await fetchExtraAIQuestions(orgId, quizGenre);

  return {
    weeklyQuizQuestions: weeklyQuizQuestion || [],
    extraEmployeeQuestions: extraEmployeeQuestions || [],
    extraAIQuestions: extraAIQuestions || [],
    quizId: quizId || null,
  };
}

export async function createNewQuestionService(newQuestionData, employeeId) {
  const { orgId } = newQuestionData;
  const newQuestion = await createNewQuestion(newQuestionData);
  if (!newQuestion) throw new Error('Failed to create question');

  const added = await pushQuestionsInOrgRepo(newQuestion, orgId);
  if (!added) throw new Error('Failed to add question to org');

  await addSubmittedQuestion(newQuestion._id, employeeId);

  return true;
}

export const generateCAnITQuestionsService = async () => {
  const quizzes = await getCAnITQuizzesScheduledTomm();
  const orgIds = quizzes.map((quiz) => quiz.orgId);
  const dropdowns = await getOrgCAnITDropdownValue(orgIds);
  const lastQuizzes = await lastQuizByGenre();

  const combinedData = quizzes.map((quiz) => {
    const orgIdStr = quiz.orgId.toString();
    const dropdown = dropdowns.find((d) => d._id.toString() === orgIdStr);
    const lastQuiz = lastQuizzes.find((lq) => lq.orgId.toString() === orgIdStr);

    return {
      quiz,
      dropdown: dropdown?.settings?.companyCurrentAffairsTimeline,
      lastQuiz: lastQuiz?.scheduledDate,
    };
  });

  const today = new Date();

  for (const { quiz, dropdown, lastQuiz } of combinedData) {
    const timelineWeeks = dropdown || 1;
    const newsTimelineStart = new Date(today);
    newsTimelineStart.setDate(today.getDate() - timelineWeeks * 7);

    const CAnITQuestionsInTimeline = await getCAnITQuestionsInTimeline(
      quiz.orgId,
      newsTimelineStart,
      today,
    );

    const diffInMs = new Date(today) - new Date(newsTimelineStart);
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const newQuestions = await fetchNewCAnITQuestions(
      CAnITQuestionsInTimeline.orgName,
      CAnITQuestionsInTimeline.orgIndustry,
      CAnITQuestionsInTimeline.orgCountry,
      quiz.quizId,
      days,
    );
    const questions = await pushQuestionsToDatabase(newQuestions, 'CAnIT');
    await addQuestionstoOrg(questions, 'CAnIT', quiz.orgId);
    await addQuestionsToQuiz(questions, quiz.orgId, quiz.quizId, 'CAnIT');
  }
  return { message: 'CAnIT questions generated successfully' };
};
