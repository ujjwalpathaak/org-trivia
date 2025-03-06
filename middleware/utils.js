import fs from 'fs';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const logService = (request, response, next) => {
  const log = `${request.method} request on ${request.path} at ${Date.now()}\n`;

  fs.appendFile('logs.txt', log, (err) => {
    if (err) console.error(err);
    next();
  });
};

export const getNextFridayDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // Ensures Friday is always next week

  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  nextFriday.setHours(0, 0, 0, 0); // Normalize time to midnight

  return nextFriday; // ✅ Returns a Date object
};