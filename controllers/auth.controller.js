import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import Employee from "../models/employee.model.js";

const getUserModel = (isAdmin) => (isAdmin ? [Admin, "Admin"] : [Employee, "Employee"]);

const generateToken = (user, isAdmin) => {
    return jwt.sign(
        { id: user._id, role: isAdmin ? "Admin" : "Employee" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const register = async (req, res) => {
    try {
        const { isAdmin, email, password, ...otherFields } = req.body;
        
        const [UserModel, userType] = getUserModel(isAdmin);
        
        const user = await UserModel.findOne({ email });
        
        if (user) {
            return res.status(400).json({ message: `${userType} already exists` });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new UserModel({ email, password: hashedPassword, ...otherFields });
        await newUser.save();

        res.status(201).json({ 
            message: `New ${userType} registered successfully`
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        console.log(process.env.JWT_SECRET)
        const { isAdmin, email, password } = req.body;
        
        const [UserModel, userType] = getUserModel(isAdmin);
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });
        
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = generateToken(user, isAdmin);

        res.status(200).json({ 
            message: `${userType} logged in successfully`,
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
