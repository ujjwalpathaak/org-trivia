import Org from "../models/org.model.js";

class OrgRepository {
    async getAllOrgs() {
        return await Org.find({});
    }

    async getOrgById(orgId) {
        return await Org.find({ _id: orgId });
    }

    async getTriviaEnabledOrgs() {
        return await Org.find({ "settings.isTriviaEnabled": true }).select("_id settings.currentGenre settings.selectedGenre");          
    }
}

export default OrgRepository;