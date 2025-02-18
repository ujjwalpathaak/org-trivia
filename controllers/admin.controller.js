import Admin from "../models/admin.model.js";

export const getAllAdmins = async (request, response) => {
    try {
        const admins = await Admin.find({});

        response.status(200).json({ admins });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getAdminByEmail = async (request, response) => {
    try {
        const { email } = request.params;
    
        const admin = await Admin.findOne({ email });
        if(!admin){
            return response.status(404).json({ message: "No Admin found" });
        }
    
        response.status(200).json({ admin });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getAllAdminsByOrg = async (request, response) => {
    try {
        const { orgId } = request.params;
    
        const admins = await Admin.find({ org: orgId });
        if(!admins){
            return response.status(404).json({ message: "No Admins found" });
        }
    
        response.status(200).json({ admins });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}