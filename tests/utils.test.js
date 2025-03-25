import fs from 'fs';

import {
  getMonth,
  getMonthAndYear,
  getNextFridayDate,
  getPreviousMonthAndYear,
  getTodayDate,
  isProduction,
  logService,
  mergeUserAnswersAndCorrectAnswers,
} from '../middleware/utils.js'; // Adjust the path

jest.mock('fs');

describe('Utility Functions', () => {
  describe('isProduction', () => {
    it('should return true if NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return false if NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';
      expect(isProduction()).toBe(false);
    });
  });

  describe('logService', () => {
    it('should append logs to logs.txt and call next()', () => {
      const mockRequest = { method: 'GET', path: '/test' };
      const mockResponse = {};
      const nextFunction = jest.fn();

      fs.appendFile.mockImplementation((file, data, callback) =>
        callback(null),
      );

      logService(mockRequest, mockResponse, nextFunction);

      expect(fs.appendFile).toHaveBeenCalledWith(
        'logs.txt',
        expect.stringContaining('GET request on /test'),
        expect.any(Function),
      );
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('getTodayDate', () => {
    it('should return today’s date with time set to 00:00:00', () => {
      const today = getTodayDate();
      const expected = new Date();
      expected.setHours(0, 0, 0, 0);
      expect(today).toEqual(expected);
    });
  });

  describe('getNextFridayDate', () => {
    it('should return the correct next Friday date', () => {
      const nextFriday = getNextFridayDate();
      expect(nextFriday.getDay()).toBe(5); // Friday
    });
  });

  describe('getMonthAndYear', () => {
    it('should return the current month and year', () => {
      const [month, year] = getMonthAndYear();
      const today = new Date();
      expect(month).toBe(today.getMonth());
      expect(year).toBe(today.getFullYear());
    });
  });

  describe('getPreviousMonthAndYear', () => {
    it('should return the correct previous month and year', () => {
      const [prevMonth, prevYear] = getPreviousMonthAndYear();
      const today = new Date();
      let expectedMonth = today.getMonth() - 1;
      let expectedYear = today.getFullYear();

      if (expectedMonth < 0) {
        expectedMonth = 11;
        expectedYear -= 1;
      }

      expect(prevMonth).toBe(expectedMonth);
      expect(prevYear).toBe(expectedYear);
    });
  });

  describe('mergeUserAnswersAndCorrectAnswers', () => {
    it('should merge user answers with correct answers', () => {
      const correctAnswers = [
        { _id: '1', answer: 'A' },
        { _id: '2', answer: 'B' },
      ];
      const myAnswers = [{ questionId: '1', answer: 'A' }];

      const result = mergeUserAnswersAndCorrectAnswers(
        correctAnswers,
        myAnswers,
      );
      expect(result).toEqual([
        { questionId: '1', correctAnswer: 'A', employeeAnswer: 'A' },
        { questionId: '2', correctAnswer: 'B', employeeAnswer: null },
      ]);
    });
  });

  describe('getMonth', () => {
    it('should return correct month abbreviation', () => {
      expect(getMonth(0)).toBe('Jan');
      expect(getMonth(11)).toBe('Dec');
    });
  });
});
