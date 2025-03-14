import Leaderboard from '../models/leaderboard.model.js';
import Org from '../models/org.model.js';

import { ObjectId } from 'mongodb';
import Result from '../models/result.model.js';

class OrgRepository {
  async updateQuestionsStatusInOrgToUsed(
    orgId,
    category,
    idsOfQuestionsToApprove,
  ) {
    const categoryMap = {
      PnA: 'questionsPnA',
      CAnIT: 'questionsCAnIT',
      HRD: 'questionsHRD',
    };

    const questionField = categoryMap[category];
    if (!questionField) {
      throw new Error('Invalid category');
    }

    return await Org.updateMany(
      { _id: new ObjectId(orgId) },
      {
        $set: { [`${questionField}.$[elem].isUsed`]: true },
      },
      {
        arrayFilters: [
          {
            'elem.questionId': {
              $in: idsOfQuestionsToApprove,
            },
          },
        ],
      },
    );
  }

  async addQuestionToOrg(question, orgId) {
    const questionId = question._id;
    const questionCategory = question.category;
    let query = '';

    switch (questionCategory) {
      case 'PnA':
        query = 'questionsPnA';
        break;
      case 'HRD':
        query = 'questionsHRD';
        break;
      case 'CAnIT':
        query = 'questionsCAnIT';
        break;
      default:
        throw new Error('Invalid question category');
    }

    const result = await Org.updateOne(
      { _id: new ObjectId(orgId) },
      {
        $push: {
          [query]: {
            questionId,
            isUsed: false,
            category: questionCategory,
            source: question.source,
          },
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error('Organization not found');
    }

    return true;
  }

  async getTriviaEnabledOrgs() {
    return Org.find({
      'settings.isTriviaEnabled': true,
    });
  }

  async setNextQuestionGenre(orgId, currentGenreIndex) {
    const org = await Org.findById(orgId).select('settings.selectedGenre');
    if (!org) throw new Error('Organization not found');

    const totalGenres = org.settings.selectedGenre.length;
    if (totalGenres === 0) throw new Error('No genres available');

    const nextIndex = (currentGenreIndex + 1) % totalGenres;
    await Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.currentGenre': nextIndex } },
    );

    return true;
  }

  async changeGenreSettings(genre, orgId) {
    return Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.selectedGenre': genre, 'settings.currentGenre': 0 } },
    );
  }

  async getSettings(orgId) {
    return Org.findById(orgId).select('settings');
  }

  async getAllOrgNames() {
    return Org.find({}).select('id name');
  }

  async getAllOrgIds() {
    return Org.find({}).select('id');
  }

  async getOrgById(orgId) {
    return Org.findById(orgId);
  }

  async isTriviaEnabled(orgId) {
    return Org.findById(orgId).select('settings.isTriviaEnabled');
  }

  async updateTriviaSettings(orgId, newStatus) {
    return Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.isTriviaEnabled': newStatus } },
    );
  }

  async getAnalytics(orgId) {
    const participationByGenre = await Result.aggregate([
      { $match: { orgId: new ObjectId(orgId) } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
        },
      },
    ]);

    const last3Leaderboards = await Leaderboard.aggregate([
      { $match: { orgId: new ObjectId(orgId) } },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          leaderboard: { $push: '$$ROOT' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 3 },
      { $skip: 1 },
      { $unwind: '$leaderboard' },
      {
        $lookup: {
          from: 'employees',
          localField: 'leaderboard.employeeId',
          foreignField: '_id',
          as: 'employeeDetails',
        },
      },
      { $unwind: '$employeeDetails' },
      { $sort: { 'leaderboard.totalScore': -1 } },
      {
        $group: {
          _id: { month: '$_id.month', year: '$_id.year' },
          employees: {
            $push: {
              employeeId: '$leaderboard.employeeId',
              name: '$employeeDetails.name',
              totalScore: '$leaderboard.totalScore',
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          employees: { $slice: ['$employees', 3] },
        },
      },
    ]);

    return {
      participationByGenre,
      last3Leaderboards,
    };
  }
}

export default OrgRepository;
