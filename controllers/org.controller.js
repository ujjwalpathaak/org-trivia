import OrgService from '../services/org.service.js';
import OrgRepository from '../repositories/org.repository.js';

const orgService = new OrgService(new OrgRepository());

export const getAllOrgs = async (req, res) => {
  try {
    const orgs = await orgService.getAllOrgs.select('id name');

    res.status(200).json({ orgs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
