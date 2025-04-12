import fs from 'fs';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const logService = (request, response, next) => {
  const log = `${request.method} request on ${request.path} at ${Date.now()}\n`;

  fs.appendFile('logs.txt', log, (err) => {
    if (err) console.error(err);
    next();
  });
};

export const validateEmployeeQuestionSubmission = (question) => {
  const errors = {};
  console.log(question.answer)

  if (!question.question.trim()) {
    errors.question = 'Question is required.';
  }
  if (question.question.trim().length <= 50) {
    errors.question = 'Question must be more than 50 characters.';
  }
  if (!question.category) {
    errors.category = 'Category is required.';
  }
  if (question.category === 'PnA' && !question.config.puzzleType) {
    errors.puzzleType = 'Puzzle type is required for PnA questions.';
  }
  if (!question.options || question.options.length < 4) {
    errors.options = 'At least 4 options are required.';
  }


  return Object.keys(errors).length;
};

// ---------------------------------------------------------------

export const getFridaysOfNextMonth = (
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
) => {
  month = (month + 1) % 12;
  if (month === 0) year++;

  const fridays = [];
  let date = new Date(year, month, 1);

  while (date.getDay() !== 5) {
    date.setDate(date.getDate() + 1);
  }

  while (date.getMonth() === month) {
    fridays.push(new Date(Date.UTC(year, month, date.getDate())));
    date.setDate(date.getDate() + 7);
  }

  return fridays;
};

export const mergeUserAnswersAndCorrectAnswers = (
  correctAnswers,
  myAnswers,
) => {
  return correctAnswers.map(({ _id, answer }) => {
    const myAnswerObj = myAnswers.find(
      ({ questionId }) => questionId === _id.toString(),
    );
    return {
      questionId: _id,
      correctAnswer: answer,
      employeeAnswer: myAnswerObj ? myAnswerObj.answer : null,
    };
  });
};

export const getMonth = (month) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return months[month];
};

export const getMonthAndYear = () => {
  const today = new Date();
  const month = today.getUTCMonth();
  const year = today.getUTCFullYear();
  return [month, year];
};
