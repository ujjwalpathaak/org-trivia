import { startJobs } from '../jobs/index.js'; // Update the path as per your project structure
import {
  cleanWeeklyQuizJob,
  leaderboardResetJob,
  makeQuizLiveTestJob,
  scheduleNextWeekQuestionsApprovalJob,
} from '../jobs/scheduleNextWeekQuestionsApproval.job.js';

jest.mock('../jobs/scheduleNextWeekQuestionsApproval.job.js', () => ({
  scheduleNextWeekQuestionsApprovalJob: { start: jest.fn() },
  makeQuizLiveTestJob: { start: jest.fn() },
  cleanWeeklyQuizJob: { start: jest.fn() },
  leaderboardResetJob: { start: jest.fn() },
}));

describe('startJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start all cron jobs', () => {
    startJobs();

    expect(scheduleNextWeekQuestionsApprovalJob.start).toHaveBeenCalled();
    expect(makeQuizLiveTestJob.start).toHaveBeenCalled();
    expect(cleanWeeklyQuizJob.start).toHaveBeenCalled();
    expect(leaderboardResetJob.start).toHaveBeenCalled();
  });
});
