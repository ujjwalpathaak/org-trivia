import Org from '../models/org.model.js';

class OrgRepository {
  async getAllOrgNames() {
    return await Org.find({}).select('id name');
  }

  async getOrgById(orgId) {
    return await Org.findOne({ _id: orgId });
  }

  async getTriviaEnabledOrgs() {
    return await Org.find({ 'settings.isTriviaEnabled': true }).select(
      '_id settings.currentGenre settings.selectedGenre',
    );
  }

  async addQuestionToOrg(orgId, questionId){
    return await Org.updateOne(
      { _id: orgId },
      { $push: { questions: questionId } },
    );
  }

  async toggleTrivia(orgId) {
    const org = await Org.findById(orgId).select('settings.isTriviaEnabled');
    if (!org) throw new Error('Organization not found');
  
    return await Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.isTriviaEnabled': !org.settings.isTriviaEnabled } }
    );
  }
  
  async getSettings(orgId) {
    return await Org.findById(orgId).select('settings');
  }
  
}

export default OrgRepository;
