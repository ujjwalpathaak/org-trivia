import OrgService from '../services/org.service.js';
import OrgRepository from '../repositories/org.repository.js';

const orgService = new OrgService(new OrgRepository());

export const getAllOrgs = async (request, response) => {
  try {
    const orgs = await orgService.getAllOrgs.select('id name');

    response.status(200).json({ orgs });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: 'Server Error', error: error.message });
  }
};
