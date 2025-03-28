import Org from '../../models/org.model.js';
import Question from '../../models/question.model.js';
import orgRepository from '../../repositories/org.repository.js';
import resultRepository from '../../repositories/result.repository.js';

jest.mock('../../models/org.model.js');
jest.mock('../../models/question.model.js');
jest.mock('../../repositories/leaderboard.respository.js');
jest.mock('../../repositories/result.repository.js');

describe('Org Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('updateQuestionsStatusInOrgToUsed should update the organization correctly', async () => {
    Org.updateMany.mockResolvedValue({ modifiedCount: 1 });
    Question.deleteMany.mockResolvedValue({ deletedCount: 1 });

    const result = await orgRepository.updateQuestionsStatusInOrgToUsed(
      '60d5ec49fbd9b01234567890',
      'PnA',
      ['60d5ec49fbd9b01234567891'],
      ['60d5ec49fbd9b01234567892'],
    );

    expect(Question.deleteMany).toHaveBeenCalledWith({
      _id: { $in: ['60d5ec49fbd9b01234567892'] },
    });
    expect(Org.updateMany).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ modifiedCount: 1 });
  });

  test('addQuestionToOrg should add a question successfully', async () => {
    Org.updateOne.mockResolvedValue({ matchedCount: 1 });

    const question = {
      _id: '60d5ec49fbd9b01234567893',
      category: 'PnA',
      source: 'AI',
    };

    const result = await orgRepository.addQuestionToOrg(
      question,
      '60d5ec49fbd9b01234567894',
    );

    expect(Org.updateOne).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('getTriviaEnabledOrgs should return enabled organizations', async () => {
    const mockOrgs = [{ _id: '1', settings: { isTriviaEnabled: true } }];
    Org.find.mockResolvedValue(mockOrgs);

    const result = await orgRepository.getTriviaEnabledOrgs();

    expect(Org.find).toHaveBeenCalledWith(
      { 'settings.isTriviaEnabled': true },
      { questionsCAnIT: 0, questionsHRD: 0, questionsPnA: 0 },
    );
    expect(result).toEqual(mockOrgs);
  });

  test('getAnalytics should return correct data', async () => {
    resultRepository.getParticipationByGenre.mockResolvedValue({
      genre: 'PnA',
      count: 10,
    });
    const result = await orgRepository.getAnalytics('60d5ec49fbd9b01234567895');
    expect(resultRepository.getParticipationByGenre).toHaveBeenCalled();
    expect(result).toEqual({
      participationByGenre: { genre: 'PnA', count: 10 },
      last3Leaderboards: [{ leaderboard: 'test' }],
    });
  });
});
