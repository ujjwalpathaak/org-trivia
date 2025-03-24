import OrgService from '../../services/org.service.js';
import orgController from '../../controllers/org.controller.js';

jest.mock('../../services/org.service.js');

describe('Org Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { data: { orgId: 'org123' }, body: { genre: 'comedy' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('changeGenreSettings', () => {
    it('should update genre settings successfully', async () => {
      OrgService.changeGenreSettings.mockResolvedValue();

      await orgController.changeGenreSettings(req, res, next);

      expect(OrgService.changeGenreSettings).toHaveBeenCalledWith(req.body, req.data.orgId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Genre settings updated successfully' });
    });

    it('should return 400 if genre is missing', async () => {
      req.body = {};
      await orgController.changeGenreSettings(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Service error');
      OrgService.changeGenreSettings.mockRejectedValue(error);

      await orgController.changeGenreSettings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getSettings', () => {
    it('should return org settings', async () => {
      const mockSettings = { theme: 'dark' };
      OrgService.getSettings.mockResolvedValue(mockSettings);

      await orgController.getSettings(req, res, next);

      expect(OrgService.getSettings).toHaveBeenCalledWith(req.data.orgId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSettings);
    });

    it('should return 400 if orgId is missing', async () => {
      req.data = {};

      await orgController.getSettings(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Database error');
      OrgService.getSettings.mockRejectedValue(error);

      await orgController.getSettings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleTrivia', () => {
    it('should toggle trivia successfully', async () => {
      const response = { triviaEnabled: true };
      OrgService.toggleTrivia.mockResolvedValue(response);

      await orgController.toggleTrivia(req, res, next);

      expect(OrgService.toggleTrivia).toHaveBeenCalledWith(req.data.orgId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it('should return 400 if orgId is missing', async () => {
      req.data = {};

      await orgController.toggleTrivia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error toggling trivia');
      OrgService.toggleTrivia.mockRejectedValue(error);

      await orgController.toggleTrivia(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllOrgNames', () => {
    it('should return all organization names', async () => {
      const orgNames = [{ id: '1', name: 'Org1' }, { id: '2', name: 'Org2' }];
      OrgService.getAllOrgNames.mockResolvedValue(orgNames);

      await orgController.getAllOrgNames(req, res, next);

      expect(OrgService.getAllOrgNames).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(orgNames);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Service failure');
      OrgService.getAllOrgNames.mockRejectedValue(error);

      await orgController.getAllOrgNames(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      const analytics = { users: 100, revenue: 5000 };
      OrgService.getAnalytics.mockResolvedValue(analytics);

      await orgController.getAnalytics(req, res, next);

      expect(OrgService.getAnalytics).toHaveBeenCalledWith(req.data.orgId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(analytics);
    });

    it('should return 400 if orgId is missing', async () => {
      req.data = {};

      await orgController.getAnalytics(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Analytics error');
      OrgService.getAnalytics.mockRejectedValue(error);

      await orgController.getAnalytics(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
