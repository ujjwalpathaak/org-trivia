import { ObjectId } from 'mongodb';

import Result from '../../models/result.model.js';
import resultRepository from '../../repositories/result.repository.js';

jest.mock('../../models/result.model.js');

describe('Result Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitWeeklyQuizAnswers', () => {
    it('should create a new result entry', async () => {
      const mockData = {
        employeeId: '64fef8b5d1234a56789ef123',
        orgId: '64fef8b5d1234a56789ef124',
        quizId: 'quiz123',
        multiplier: 2,
        score: 80,
        points: 160,
        genre: 'math',
        answers: [{ question: '1+1', answer: '2' }],
      };

      Result.create.mockResolvedValue(mockData);

      const result = await resultRepository.submitWeeklyQuizAnswers(
        mockData.employeeId,
        mockData.orgId,
        mockData.quizId,
        mockData.multiplier,
        mockData.score,
        mockData.points,
        mockData.genre,
        mockData.answers,
      );

      expect(Result.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
    });
  });

  describe('getParticipationByGenre', () => {
    it('should return participation count by genre', async () => {
      const mockOrgId = '64fef8b5d1234a56789ef124';
      const mockResult = [
        { _id: 'math', count: 5 },
        { _id: 'science', count: 3 },
      ];

      Result.aggregate.mockResolvedValue(mockResult);

      const result = await resultRepository.getParticipationByGenre(mockOrgId);

      expect(Result.aggregate).toHaveBeenCalledWith([
        { $match: { orgId: new ObjectId(mockOrgId) } },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
      ]);
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if aggregation fails', async () => {
      Result.aggregate.mockRejectedValue(new Error('Aggregation Error'));

      await expect(
        resultRepository.getParticipationByGenre('orgId'),
      ).rejects.toThrow();
    });
  });

  describe('getEmployeePastResults', () => {
    it('should return paginated past results', async () => {
      const mockEmployeeId = '64fef8b5d1234a56789ef125';
      const mockPage = 1;
      const mockSize = 5;
      const mockResults = [
        {
          data: [
            { quizId: 'quiz1', score: 85 },
            { quizId: 'quiz2', score: 90 },
          ],
          totalCount: [{ total: 2 }],
        },
      ];

      Result.aggregate.mockResolvedValue(mockResults);

      const result = await resultRepository.getEmployeePastResults(
        mockEmployeeId,
        mockPage,
        mockSize,
      );

      expect(Result.aggregate).toHaveBeenCalledWith([
        { $match: { employeeId: new ObjectId(mockEmployeeId) } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            data: [{ $skip: 5 }, { $limit: 5 }],
            totalCount: [{ $count: 'total' }],
          },
        },
      ]);

      expect(result).toEqual({
        data: [
          { quizId: 'quiz1', score: 85 },
          { quizId: 'quiz2', score: 90 },
        ],
        total: 2,
        page: 1,
        size: 5,
      });
    });

    it('should return empty data when no records found', async () => {
      const mockEmployeeId = '64fef8b5d1234a56789ef125';

      Result.aggregate.mockResolvedValue([{ data: [], totalCount: [] }]);

      const result =
        await resultRepository.getEmployeePastResults(mockEmployeeId);

      expect(result).toEqual({ data: [], total: 0, page: 0, size: 10 });
    });

    it('should handle errors during past results retrieval', async () => {
      Result.aggregate.mockRejectedValue(new Error('Aggregation Error'));

      await expect(
        resultRepository.getEmployeePastResults('employeeId'),
      ).rejects.toThrow();
    });
  });
});
