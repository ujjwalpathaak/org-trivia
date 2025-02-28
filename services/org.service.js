class OrgService {
  constructor(orgRepository) {
    this.orgRepository = orgRepository;
  }

  async getAllOrgNames() {
    const orgNames = await this.orgRepository.getAllOrgNames();

    return { status: 200, data: orgNames };
  }

  async getOrgById(orgId) {
    const org = await this.orgRepository.getOrgById(orgId);

    return { status: 200, data: org };
  }

  async getTriviaEnabledOrgs() {
    const orgs = await this.orgRepository.getTriviaEnabledOrgs();

    return { status: 200, data: orgs };
  }

  async toggleTrivia(orgId) {
    await this.orgRepository.toggleTrivia(orgId);

    return { status: 200, data: `Trivia toggled` };
  }
  async getSettings(orgId) {
    const org = await this.orgRepository.getSettings(orgId);

    return { status: 200, data: org.settings };
  }
}

export default OrgService;
