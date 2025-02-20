import OrgService from "../services/org.service.js";
import OrgRepository from "../repositories/org.repository.js";

const orgService = new OrgService(new OrgRepository());

export const getAllOrgs = async (req, res) => {
  try {
    const orgs = await orgService.getAllOrgs.select("id name");

    res.status(200).json({ orgs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getOrgById = async (req, res) => {
  try {
    const { orgId } = request.params;

    const org = await orgService.getOrgById(orgId);
  
    if(!org){
      res.status(404).json({message: "No such org found!"})
    }

    res.status(200).json({ org });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getOrgQuestionsByGenre = async (req, res) => {

};

export const getOrgQuestions = async (req, res) => {

};
