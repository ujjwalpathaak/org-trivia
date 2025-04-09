import fs from 'fs';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const logService = (request, response, next) => {
  const log = `${request.method} request on ${request.path} at ${Date.now()}\n`;

  fs.appendFile('logs.txt', log, (err) => {
    if (err) console.error(err);
    next();
  });
};

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
