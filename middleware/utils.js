import fs from 'fs';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const logService = (request, response, next) => {
  const log = `${request.method} request on ${request.path} at ${Date.now()}\n`;

  fs.appendFile('logs.txt', log, (err) => {
    if (err) console.error(err);
    next();
  });
};

export const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
};

export const getNextFridayDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;

  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  nextFriday.setHours(0, 0, 0, 0);

  return nextFriday;
};

export const getMonthAndYear = () => {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  return [month, year];
};

export const getPreviousMonthAndYear = () => {
  const today = new Date();
  let pMonth = today.getMonth() - 1;
  let pYear = today.getFullYear();

  if (pMonth < 0) {
    pMonth = 11;
    pYear -= 1;
  }

  return [pMonth, pYear];
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
