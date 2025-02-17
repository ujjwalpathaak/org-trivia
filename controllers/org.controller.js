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
