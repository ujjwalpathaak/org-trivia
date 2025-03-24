import orgRepository from '../../repositories/org.repository.js';
import orgService from '../../services/org.service.js';

jest.mock('../../repositories/org.repository.js');

describe('Organization Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changeGenreSettings', () => {
    it('should call changeGenreSettings with correct arguments', async () => {
      orgRepository.changeGenreSettings.mockResolvedValue('Success');

      const result = await orgService.changeGenreSettings('Rock', 'org123');

      expect(result).toBe('Success');
      expect(orgRepository.changeGenreSettings).toHaveBeenCalledWith(
        'Rock',
        'org123',
      );
    });
  });

  describe('getSettings', () => {
    it('should return organization settings', async () => {
      const mockSettings = { theme: 'dark' };
      orgRepository.getSettings.mockResolvedValue({ settings: mockSettings });

      const result = await orgService.getSettings('org123');

      expect(result).toEqual(mockSettings);
      expect(orgRepository.getSettings).toHaveBeenCalledWith('org123');
    });

    it('should return undefined if no organization is found', async () => {
      orgRepository.getSettings.mockResolvedValue(null);

      const result = await orgService.getSettings('org123');

      expect(result).toBeUndefined();
    });
  });

  describe('getAllOrgNames', () => {
    it('should return all organization names', async () => {
      const mockOrgNames = ['Org1', 'Org2'];
      orgRepository.getAllOrgNames.mockResolvedValue(mockOrgNames);

      const result = await orgService.getAllOrgNames();

      expect(result).toEqual(mockOrgNames);
      expect(orgRepository.getAllOrgNames).toHaveBeenCalled();
    });
  });

  describe('getOrgById', () => {
    it('should return organization by ID', async () => {
      const mockOrg = { id: 'org123', name: 'Test Org' };
      orgRepository.getOrgById.mockResolvedValue(mockOrg);

      const result = await orgService.getOrgById('org123');

      expect(result).toEqual(mockOrg);
      expect(orgRepository.getOrgById).toHaveBeenCalledWith('org123');
    });
  });

  describe('toggleTrivia', () => {
    it('should enable trivia if it is currently disabled', async () => {
      orgRepository.isTriviaEnabled.mockResolvedValue({
        settings: { isTriviaEnabled: false },
      });
      orgRepository.updateTriviaSettings.mockResolvedValue(true);

      const result = await orgService.toggleTrivia('org123');

      expect(result).toBe(true);
      expect(orgRepository.updateTriviaSettings).toHaveBeenCalledWith(
        'org123',
        true,
      );
    });

    it('should disable trivia if it is currently enabled', async () => {
      orgRepository.isTriviaEnabled.mockResolvedValue({
        settings: { isTriviaEnabled: true },
      });
      orgRepository.updateTriviaSettings.mockResolvedValue(false);

      const result = await orgService.toggleTrivia('org123');

      expect(result).toBe(false);
      expect(orgRepository.updateTriviaSettings).toHaveBeenCalledWith(
        'org123',
        false,
      );
    });

    it('should return false if the organization is not found', async () => {
      orgRepository.isTriviaEnabled.mockResolvedValue(null);

      const result = await orgService.toggleTrivia('org123');

      expect(result).toBe(false);
      expect(orgRepository.updateTriviaSettings).not.toHaveBeenCalled();
    });
  });

  describe('getAnalytics', () => {
    it('should return organization analytics', async () => {
      const mockAnalytics = { users: 100, active: 80 };
      orgRepository.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await orgService.getAnalytics('org123');

      expect(result).toEqual(mockAnalytics);
      expect(orgRepository.getAnalytics).toHaveBeenCalledWith('org123');
    });
  });
});
