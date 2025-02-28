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

  async setNextQuestionGenre(orgId, currentGenre) {
    const org = await Org.findOne({ _id: orgId }).select('settings');
    const totalSelectedGenre = org.settings.selectedGenre.length;
    
    const nextIndex = (currentGenre + 1) % totalSelectedGenre;
    await Org.updateOne(
      { _id: orgId },
      { $set: { 'settings.currentGenre': nextIndex } }
    );
  
    return nextIndex;
  }
  
  
}

export default OrgRepository;
