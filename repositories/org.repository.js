import Org from "../models/org.model.js";

class OrgRepository {
    async getAllOrgs() {
        return await Org.find({});
    }

    async getOrgById(orgId) {
        return await Org.find({ _id: orgId });
    }
}

export default OrgRepository;