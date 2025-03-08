import Org from '../models/org.model.js';

import { ObjectId } from 'mongodb';

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
          [query]: { questionId, isUsed: false, category: questionCategory },
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
      { $set: { 'settings.selectedGenre': genre } },
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
}

export default OrgRepository;
