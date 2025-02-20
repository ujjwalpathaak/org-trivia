class OrgService {
    constructor(orgService) {
        this.orgService = orgService;
    }

    async getAllOrgs(){
        return await this.orgService.getAllOrgs();
    }

    async getOrgById(orgId){
        return await this.orgService.getOrgById(orgId);
    }

}

export default OrgService;
