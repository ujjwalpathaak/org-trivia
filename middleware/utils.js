import fs from 'fs';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const logService = (request, response, next) => {
  const log = `${request.method} request on ${request.path} at ${Date.now()}\n`;

  fs.appendFile('logs.txt', log, (err) => {
    if (err) console.error(err);
    next();
  });
};

export const getNextFriday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // Calculate days until next Friday
  const nextFriday = new Date();
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  return nextFriday;
};
