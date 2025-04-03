import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
} from '../api/lambda.api.js';
import { MIN_NEW_HRP_QUESTIONS_PER_QUIZ, PnA_QUESTIONS_PER_QUIZ } from '../constants.js';
import { getFridaysOfNextMonth } from '../middleware/utils.js';
import {
  addSubmittedQuestion,
} from '../repositories/employee.repository.js';
import {
  addQuestionToOrg,
  getTriviaEnabledOrgs,
  setNextQuestionGenre,
  HRPQuestionsCount,
  pushQuestionsInOrg as pushQuestionsInOrgRepo,
  fetchExtraEmployeeQuestions,
  fetchExtraAIQuestions,
  fetchPnAQuestions,
  removeAllQuestionsPnAFromOrg,
} from '../repositories/org.repository.js';
import {
  saveQuestion as saveQuestionRepo,
  saveWeeklyQuiz,
  addQuestions,
  getWeeklyQuizScheduledQuestions,
  removeQuestionsPnAFromDatabase,
  editQuestions,
} from '../repositories/question.repository.js';
import {
  findQuiz,
  scheduleNewWeeklyQuiz,
} from '../repositories/quiz.repository.js';
import { getPnAQuestionsLeft } from '../repositories/org.repository.js'

export async function saveQuestion(newQuestionData, employeeId) {
  const orgId = newQuestionData.orgId;
  const newQuestion = await saveQuestionRepo(newQuestionData);
  const addedToList = await addQuestionToOrg(newQuestion, orgId);
  await addSubmittedQuestion(newQuestion._id, employeeId);
  return newQuestion && addedToList;
}

export async function scheduleQuizzesJob(req, res) {
  const triviaEnabledOrgs = await getTriviaEnabledOrgs();
  for (const org of triviaEnabledOrgs) {
    const orgObject = org.toObject();
    scheduleQuizForOrgService(orgObject);
  }
  
  return res.status(200).json({ message: "Scheduling started" });
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

  console.log('Starting to debug')

  const PnAQuizzesToConduct = scheduledQuizzes.filter((q) => q.genre === "PnA")
  const PnAQuestionsRequired = PnAQuizzesToConduct.length * PnA_QUESTIONS_PER_QUIZ;
  const PnAQuestionsLeft = await getPnAQuestionsLeft(org._id);
  const PnAQuestionsLeftCount = PnAQuestionsLeft[0]?.count || 0;
  
  if(PnAQuestionsLeft.length === 0 || (PnAQuestionsLeftCount <= PnAQuestionsRequired)){
    const questionsToRemove = await removeAllQuestionsPnAFromOrg(org._id);
    const response = await removeQuestionsPnAFromDatabase(questionsToRemove);
    const newQuestions = await fetchNewPnAQuestions(org.name);

    let questions = await pushQuestionsToDatabase(newQuestions.questions, 'PnA');
    await pushQuestionsInOrg(questions, 'PnA', org._id);
  }

  for (const quiz of scheduledQuizzes) {
    await startQuestionGenerationWorkflow(quiz.genre, org, quiz);
    // const shouldBreak = 
    // if (shouldBreak) break;
  }
}

export async function canConductQuizHRP(orgId) {
  const unusedQuestions = await HRPQuestionsCount(orgId, false);
  return unusedQuestions >= MIN_NEW_HRP_QUESTIONS_PER_QUIZ;
}

export async function startPnAWorkflow(orgName, orgId, quizId) {
  const PnAQuestions = await fetchPnAQuestions(orgId);
  await pushQuestionsInQuiz(PnAQuestions, orgId, quizId, 'PnA')
  // const PnAQuestionsLeft = await getPnAQuestionsLeft(orgId);
  // if(PnAQuestionsLeft.length === 0 || (PnAQuestionsLeft[0].count < MIN_PNA_QUESTIONS_TO_CONDUCT_QUIZ)){
  //   fetchNewPnAQuestions(orgName, orgId, quizId);
  //   return true;
  // }else{
    // return false;
  // }
}


export async function startQuestionGenerationWorkflow(genre, org, quiz) {
  const quizId = quiz._id;
  const orgName = org.name;
  const orgId = org._id;

  // also need to write the logic to make quiz available if there are enough questions in future

  switch (genre) {
    case 'PnA':
      console.log('Starting PnA for', orgName);
      await startPnAWorkflow(orgName, orgId, quizId);
      break;

    // case 'HRP':
    //   console.log('Starting HRP for', orgName);
    //   const conductQuizHRP = await canConductQuizHRP(orgId, quizId);
    //   if (!conductQuizHRP) {
    //     makeGenreUnavailable(orgId, genre);
    //   } else {
    //     makeGenreAvailable(orgId, genre); 
    //   }
    //   startHRPWorkflow(orgId, quizId);
    //   break;

    // case 'CAnIT':
    //   console.log('Starting CAnIT for', orgName);
    //   startCAnITWorkflow(orgId, quizId);
    //   break;

    default:
      break;
  }
}

export function formatWeeklyQuizDocument(questions, orgId, quizId) {
  const questionIds = questions.map((curr) => curr._id);
  return {
    questions: questionIds,
    quizId: quizId,
    orgId: orgId,
  }
}

export function formatQuestionsForOrgs(questions, file) {
  return questions.map((question) => ({
    questionId: question._id,
    ...(question.config.puzzleType && { puzzleType: question.config.puzzleType }),
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
    config: {
      puzzleType: question.puzzleType
    },
  }));
}

export async function pushQuestionsInQuiz(questions, orgId, quizId, genre) {
  const weeklyQuiz = formatWeeklyQuizDocument(
    questions,
    orgId,
    quizId,
  );
  console.log('weeklyQuiz',weeklyQuiz)
  return await saveWeeklyQuiz(
    orgId,
    quizId,
    weeklyQuiz,
    genre
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
  // if(category === 'CAnIT') {
  //   const unusedQuestionsFromTimeline = await getUnusedQuestionsFromTimeline(orgId, newsTimeline);
  //   const questionsCount = newQuestions.length + unusedQuestionsFromTimeline.length;

  //   if(questionsCount < CAnIT_QUESTIONS_PER_QUIZ) {
  //     makeGenreUnavailable(orgId, category);
  //     return;
  //   }else{
  //     makeGenreAvailable(orgId, category);
  //   }

  //   // logic to use unusedQuestionsFromTimeline

  //   return;
  // }

  // if (quizId) await pushQuestionsInQuiz(questions, orgId, quizId);
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
  return formatWeeklyQuizDocument(aiQuestions, orgId, quizId);
}

export async function getExtraEmployeeQuestionsService(orgId, quizId, quizGenre) {
  const employeeQuestions = await fetchExtraEmployeeQuestions(
    orgId,
    quizGenre,
  );
  console.log(employeeQuestions);
  return formatWeeklyQuizDocument(employeeQuestions, orgId, quizId);
}

export async function editWeeklyQuizQuestionsService(
  questionsToEdit,
  questionsToDelete,
  orgId,
) {
  await editQuestions(questionsToEdit);

  // const idsOfQuestionsToChange = questions.map(
  //   (q) => new ObjectId(q.question._id),
  // );
  // const idsOfQuestionsToDelete = questionsToDelete.map(
  //   (q) => new ObjectId(q.question._id),
  // );
  // const employeeQuestionsToAdd = questions.filter(
  //   (q) => q.question.source === 'Employee',
  // );
  // const quizId = questions[0].quizId || null;
  // const category = questions[0].question.category || null;

  // await orgRepository.updateQuestionsStatusInOrgToUsed(
  //   orgId,
  //   category,
  //   idsOfQuestionsToChange,
  //   idsOfQuestionsToDelete,
  // );
  // await quizRepository.updateQuizStatusToApproved(quizId);
  // await updateWeeklyQuestionsStatusToApproved(
  //   idsOfQuestionsToApprove,
  //   employeeQuestionsToAdd,
  //   idsOfQuestionsToDelete,
  // );

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

  const weeklyQuizQuestion =
    await getWeeklyQuizScheduledQuestions(orgId, quizId);

  // const extraEmployeeQuestions = await getExtraEmployeeQuestionsService(
  //   orgId,
  //   quizId,
  //   quiz.genre
  // );
  // const extraAIQuestions = await getExtraAIQuestionsService(
  //   orgId,
  //   quizId,
  //   quiz.genre
  // );

  return {
    weeklyQuizQuestions: weeklyQuizQuestion || [],
    extraEmployeeQuestions: [],
    extraAIQuestions: [],
    quizId: quizId || null,
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

  await pushQuestionsInQuiz(questions, orgId, quizId);
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
