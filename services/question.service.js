import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
  generateNewHRPQuestions,
} from '../api/lambda.api.js';
import {
  FALLBACK_GENRE,
  HRP_QUESTIONS_PER_QUIZ,
  PnA_QUESTIONS_PER_QUIZ,
} from '../constants.js';
import { getFridaysOfNextMonth } from '../middleware/utils.js';
import {
  addSubmittedQuestion,
  approveEmployeeQuestion,
  getEmployeeQuestionsToApprove,
  rejectEmployeeQuestion,
} from '../repositories/employee.repository.js';
import {
  changeOrgQuestionsState,
  changeQuestionsState,
  fetchExtraAIQuestions,
  fetchExtraEmployeeQuestions,
  fetchHRPQuestions,
  fetchPnAQuestions,
  getOrgCAnITDropdownValue,
  getPnAQuestionsLeft,
  getTriviaEnabledOrgs,
  HRPQuestionsCount,
  isGenreAvailable,
  makeGenreUnavailable,
  pushNewQuestionInOrg,
  pushQuestionsInOrg,
  setNextQuestionGenre,
} from '../repositories/org.repository.js';
import {
  addQuestions,
  createNewQuestion,
  editQuizQuestions,
  getCAnITQuestionsInTimeline,
} from '../repositories/question.repository.js';
import {
  changeQuizGenre,
  findQuiz,
  getCAnITQuizzesScheduledNext,
  getQuizByQuizId,
  getScheduledQuizQuestions,
  lastQuizByGenre,
  replaceQuizQuestions,
  saveQuizQuestions,
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
    const quiz = await scheduleNewWeeklyQuiz(
      org._id,
      friday,
      genre,
      org.settings.companyCurrentAffairsTimeline,
    );
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
      await startPnAWorkflow(orgId, quizId);
      break;

    case 'CAnIT':
      console.log(`[${orgName}] Scheduled CAnIT Quiz`);
      break;

    case 'HRP': {
      console.log(`[${orgName}] Starting HRP workflow`);
      let isAvailable = await isGenreAvailable(orgId, 'HRP');

      if (isAvailable) {
        let canConduct = await canConductQuizHRP(orgId, quizId);
        if (!canConduct) {
          await makeGenreUnavailable(orgId, genre);
          await changeQuizGenre(FALLBACK_GENRE, quizId);
          await startQuestionGenerationWorkflow(FALLBACK_GENRE, org, quiz);
          console.warn(
            `[${orgName}] HRP quiz not allowed, genre marked unavailable. ${FALLBACK_GENRE} scheduled instead`,
          );
          return;
        }
        await startHRPWorkflow(orgId, quizId);
      } else {
        console.warn(`[${orgName}] HRP genre is not available`);
      }
      break;
    }

    default:
      console.warn(`[${orgName}] Unknown genre: ${genre}`);
      break;
  }
};

const addQuestionsToQuiz = async (questions, orgId, quizId, genre) => {
  const questionIds = questions.map((curr) => curr._id);
  return await saveQuizQuestions(orgId, quizId, questionIds, genre);
};

const addQuestionstoOrg = async (questions, genre, orgId, file) => {
  const refactoredQuestions = questions.map((question) => ({
    questionId: question._id,
    ...(question.config.puzzleType && {
      puzzleType: question.config.puzzleType,
    }),
    ...(file && { file: file }),
  }));

  return await pushQuestionsInOrg(refactoredQuestions, genre, orgId);
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

const startPnAWorkflow = async (orgId, quizId) => {
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
  if (questions.length >= HRP_QUESTIONS_PER_QUIZ) {
    await makeGenreUnavailable(orgId, 'HRP');
  }

  await addQuestionstoOrg(questions, 'HRP', orgId, file);
};

export const generateNewHRPQuestionsCallbackService = async (
  fileName,
  orgId,
) => {
  await generateNewHRPQuestions(fileName, orgId);
  return { message: 'HRP questions generated successfully' };
};

export const editQuizQuestionsService = async (
  questionsToEdit,
  replaceQuestions,
  quizId,
) => {
  if (questionsToEdit.length > 0) await editQuizQuestions(questionsToEdit);
  if (replaceQuestions.length > 0) {
    const idsToAdd = replaceQuestions.map((pair) => pair[1]);
    const idsToRemove = replaceQuestions.map((pair) => pair[0]);

    const { orgId, genre } = await replaceQuizQuestions(
      idsToAdd,
      idsToRemove,
      quizId,
    );

    await changeQuestionsState(idsToAdd, idsToRemove, orgId, genre);
  }

  return { message: 'Questions Edited.' };
};

export const changeQuizGenreWorkflow = async (
  changedGenres,
  orgId,
  orgName,
) => {
  if (changedGenres.length === 0) return;

  const quizzes = await Promise.all(
    changedGenres.map((genre) => getQuizByQuizId(genre.quizId)),
  );

  const errors = [];

  for (let i = 0; i < changedGenres.length; i++) {
    const genre = changedGenres[i];
    const quiz = quizzes[i];

    switch (genre.newGenre) {
      case 'HRP': {
        const isAvailable = await isGenreAvailable(orgId, 'HRP');

        if (!isAvailable) {
          errors.push({
            quizId: genre.quizId,
            message: `HRP genre is not available for ${new Date(quiz.scheduledDate).toDateString()}`,
          });
          break;
        }

        const canConduct = await canConductQuizHRP(orgId, genre.quizId);
        if (!canConduct) {
          await makeGenreUnavailable(orgId, genre);
          errors.push({
            quizId: genre.quizId,
            message: `Cannot conduct HRP genre for ${new Date(quiz.scheduledDate).toDateString()}, it is unavailable now`,
          });
        }
        break;
      }

      case 'CAnIT': {
        const quizDate = new Date(quiz.scheduledDate);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        quizDate.setUTCHours(0, 0, 0, 0);

        const diffInMs = quizDate.getTime() - today.getTime();
        const daysGap = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (daysGap < 2) {
          errors.push({
            quizId: genre.quizId,
            message: `CAnIT on ${new Date(quiz.scheduledDate).toDateString()} can only be scheduled with at least one day gap`,
          });
        }
        break;
      }

      default:
        break;
    }
  }

  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    return {
      status: 400,
      message: 'Validation errors occurred',
      errors,
    };
  }

  await Promise.all(
    changedGenres.map(async (genre, idx) => {
      const quiz = quizzes[idx];
      await Promise.all([
        changeOrgQuestionsState(quiz.genre, orgId, 0),
        changeQuizGenre(genre.newGenre, genre.quizId),
      ]);
    }),
  );

  for (let i = 0; i < changedGenres.length; i++) {
    const genre = changedGenres[i];
    const quiz = quizzes[i];

    switch (genre.newGenre) {
      case 'PnA': {
        const requiredPnACount = PnA_QUESTIONS_PER_QUIZ;
        const [{ count: availablePnACount = 0 } = {}] =
          await getPnAQuestionsLeft(orgId);
        if (availablePnACount > requiredPnACount) {
          await startPnAWorkflow(orgId, genre.quizId);
        } else {
          const { questions: fetchedQuestions } =
            await fetchNewPnAQuestions(orgName);
          const insertedQuestions = await pushQuestionsToDatabase(
            fetchedQuestions,
            'PnA',
          );
          await addQuestionstoOrg(insertedQuestions, 'PnA', orgId);
        }
        break;
      }

      case 'HRP':
        await startHRPWorkflow(orgId, genre.quizId);
        break;

      case 'CAnIT':
        const quizDate = new Date(quiz.questionGenerationDate);
        const today = new Date();
      
        quizDate.setUTCHours(0, 0, 0, 0);
        today.setUTCHours(0, 0, 0, 0);
      
        if (quizDate.getTime() === today.getTime()) {
          await generateCAnITQuestionsService();
        }
        break;

      default:
        break;
    }
  }

  return {
    status: 200,
    message: 'Genre change workflow completed successfully',
  };
};

export const getWeeklyQuizQuestions = async (orgId, quizId) => {
  const quiz = await findQuiz(quizId);
  const quizGenre = quiz.genre;

  const weeklyQuizQuestion = await getScheduledQuizQuestions(orgId, quizId);

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
};

export const getEmployeesQuestionsToApproveService = async (orgId) => {
  return await getEmployeeQuestionsToApprove(orgId);
};

export const approveEmployeeQuestionsService = async (selectedQuestions) => {
  const questions = selectedQuestions?.map((question) => ({
    questionId: question._id,
    employeeId: question.employeeId,
  }));
  const mp = {};
  questions.forEach((q) => {
    mp[q.employeeId] = [...(mp[q.employeeId] || []), q.questionId];
  });

  return await approveEmployeeQuestion(mp);
};

export const rejectEmployeeQuestionsService = async (selectedQuestions) => {
  const questions = selectedQuestions?.map((question) => ({
    questionId: question._id,
    employeeId: question.employeeId,
  }));
  const mp = {};
  questions.forEach((q) => {
    mp[q.employeeId] = [...(mp[q.employeeId] || []), q.questionId];
  });

  return await rejectEmployeeQuestion(mp);
};

export const allowQuizQuestionGenerationWorkflow = async (quiz, orgId) => {
  const genre = quiz.genre;
  const errors = [];

  console.log('abc', quiz, orgId, genre)

  switch (genre) {
    case 'HRP': {
      const isAvailable = await isGenreAvailable(orgId, 'HRP');

      if (!isAvailable) {
        errors.push({
          quizId: genre.quizId,
          message: `HRP genre is not available for ${new Date(quiz.scheduledDate).toDateString()}`,
        });
        break;
      }

      const canConduct = await canConductQuizHRP(orgId, genre.quizId);
      if (!canConduct) {
        await makeGenreUnavailable(orgId, genre);
        errors.push({
          quizId: genre.quizId,
          message: `Cannot conduct HRP genre for ${new Date(quiz.scheduledDate).toDateString()}, it is unavailable now`,
        });
      }
      break;
    }

    case 'CAnIT': {
      const quizDate = new Date(quiz.scheduledDate);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      quizDate.setUTCHours(0, 0, 0, 0);

      const diffInMs = quizDate.getTime() - today.getTime();
      const daysGap = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (daysGap < 2) {
        errors.push({
          quizId: genre.quizId,
          message: `CAnIT on ${new Date(quiz.scheduledDate).toDateString()} can only be scheduled with at least one day gap`,
        });
      }
      break;
    }

    default:
      break;
  }

  console.log(errors);

  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    return {
      status: 400,
      message: 'Validation errors occurred',
      errors,
    };
  }

  switch (genre) {
    case 'PnA': {
      const requiredPnACount = PnA_QUESTIONS_PER_QUIZ;
      const [{ count: availablePnACount = 0 } = {}] =
        await getPnAQuestionsLeft(orgId);
      if (availablePnACount > requiredPnACount) {
        await startPnAWorkflow(orgId, genre.quizId);
      } else {
        const { questions: fetchedQuestions } =
          await fetchNewPnAQuestions(orgName);
        const insertedQuestions = await pushQuestionsToDatabase(
          fetchedQuestions,
          'PnA',
        );
        await addQuestionstoOrg(insertedQuestions, 'PnA', orgId);
      }
      break;
    }

    case 'HRP':
      await startHRPWorkflow(orgId, genre.quizId);
      break;

    case 'CAnIT':
      const quizDate = new Date(quiz.questionGenerationDate);
      const today = new Date();
    
      quizDate.setUTCHours(0, 0, 0, 0);
      today.setUTCHours(0, 0, 0, 0);
      if (quizDate.getTime() === today.getTime()) {
        await generateCAnITQuestionsService();
      }
      break;

    default:
      break;
  }
};

export async function createNewQuestionService(newQuestionData, employeeId) {
  const { orgId } = newQuestionData;
  const newQuestion = await createNewQuestion(newQuestionData);
  if (!newQuestion) throw new Error('Failed to create question');

  const added = await pushNewQuestionInOrg(newQuestion, orgId);
  if (!added) throw new Error('Failed to add question to org');

  await addSubmittedQuestion(newQuestion._id, employeeId);

  return true;
}

export const generateCAnITQuestionsService = async () => {
  // development
  const quizzes = await getCAnITQuizzesScheduledNext();

  // production
  // const quizzes = await getCAnITQuizzesScheduledTomm();

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

  for (const { quiz, dropdown } of combinedData) {
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
