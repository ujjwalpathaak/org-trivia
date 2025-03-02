import Org from '../models/org.model.js';

class OrgRepository {
  async getAllOrgNames() {
    const orgs = await Org.find({}).select('id name');

    return orgs;
  }

  async getOrgById(orgId) {
    const org = await Org.findById(orgId);

    return org;
  }

  async getTriviaEnabledOrgs() {
    const triviaEnabledOrgs = await Org.find({
      'settings.isTriviaEnabled': true,
    }).select('_id settings.currentGenreIndex settings.selectedGenre');

    return triviaEnabledOrgs;
  }

  async addQuestionToOrg(orgId, questionId) {
    const result = await Org.updateOne(
      { _id: new ObjectId(orgId) },
      { $push: { questions: questionId } },
    );

    if (result.matchedCount === 0) {
      throw new Error('Organization not found');
    }

    return result;
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

  async getSettings(orgId) {
    return Org.findById(orgId).select('settings');
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

    return nextIndex;
  }
}

export default OrgRepository;
