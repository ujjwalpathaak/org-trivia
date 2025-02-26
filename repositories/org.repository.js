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
}

export default OrgRepository;
