import { fetchNewCAnITQuestions, fetchNewPnAQuestions } from '../api/lambda.api.js';

global.fetch = jest.fn(() => Promise.resolve());

describe('Question Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchNewCAnITQuestions', () => {
    it('should call fetch when invoked', () => {
      fetchNewCAnITQuestions('TestOrg', 'Tech', 'USA', 'org123', 'quiz456');

      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('fetchNewPnAQuestions', () => {
    it('should call fetch when invoked', () => {
      fetchNewPnAQuestions('TestOrg', 'org123', 'quiz456');

      expect(fetch).toHaveBeenCalled();
    });
  });
});
