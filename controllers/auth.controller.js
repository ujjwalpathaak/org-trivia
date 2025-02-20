import Admin from "../models/admin.model.js";
import Employee from "../models/employee.model.js";

import AuthService from "../services/auth.service.js";
import AuthRepository from "../repositories/auth.repository.js";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

export const register = async (req, res) => {
    try {
        const { isAdmin, email, password, name, org } = req.body;

        const [UserModel, userType] = isAdmin ? [Admin, "Admin"] : [Employee, "Employee"];
        
        const user = await authService.getUserByEmail(email);

        if (user) {
            return res.status(400).json({ message: `This email already exists` });
        }

        if (!org || Object.keys(org).length === 0) {
            return res.status(400).json({ message: `No such organisation exists` });
        }

        await authService.createUser(UserModel, email, password, name, org);

        res.status(201).json({ 
            message: `New ${userType} registered successfully`
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await authService.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isAdmin = user.isAdmin;
        const userType = isAdmin ? "Admin" : "Employee";

        const isMatch = await authService.passwordsMatch(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = authService.generateToken(user, isAdmin);

        res.status(200).json({ 
            message: `${userType} logged in successfully`,
            token
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
