import Org from '../models/org.model.js';

import { ObjectId } from 'mongodb';

class OrgRepository {
  async updateQuestionsStatus (orgId, category, idsOfQuestionsToApprove) {
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
      }
    );
  };

  // ----------------------------------------------------------------
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
    const triviaEnabledOrgs = await Org.find({
      'settings.isTriviaEnabled': true,
    });
    return triviaEnabledOrgs;
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
    await Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.selectedGenre': genre } },
    );

    return true;
  }

  async getSettings(orgId) {
    return Org.findById(orgId).select('settings');
  }

  // ----------------------------------------------------------------
  async getAllOrgNames() {
    const orgs = await Org.find({}).select('id name');

    return orgs;
  }

  async getOrgById(orgId) {
    const org = await Org.findById(orgId);

    return org;
  }

  async toggleTrivia(orgId) {
    const org = await Org.findById(orgId).select('settings.isTriviaEnabled');
    if (!org) throw new Error('Organization not found');

    const newStatus = !org.settings.isTriviaEnabled;
    await Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.isTriviaEnabled': newStatus } },
    );

    return newStatus;
  }
}

export default OrgRepository;
