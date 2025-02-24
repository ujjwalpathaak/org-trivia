class OrgService {
    constructor(orgRepository) {
        this.orgRepository = orgRepository;
    }

    async getAllOrgs(){
        return await this.orgRepository.getAllOrgs();
    }

    async getOrgById(orgId){
        return await this.orgRepository.getOrgById(orgId);
    }

    async getTriviaEnabledOrgs(){
        return await this.orgRepository.getTriviaEnabledOrgs();
    }

}

export default OrgService;
