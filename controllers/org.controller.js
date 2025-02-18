import Org from "../models/org.model.js";

export const getAllOrgs = async (req, res) => {
  try {
    const orgs = await Org.find({}).select("id name");
    res.status(200).json({ orgs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getOrgByName = async (req, res) => {
  try {
    const { orgName } = request.params;
    const org = await Org.find({ name: orgName });
    if(!org){
      res.status(404).json({message: "No such org found!"})
    }
    res.status(200).json({ org });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
