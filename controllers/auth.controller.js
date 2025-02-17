import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import Employee from "../models/employee.model.js";

const checkUserExists = async (email) => {
    try {
        const [admin, employee] = await Promise.all([
            Admin.findOne({ email }),
            Employee.findOne({ email })
        ]);

        if (admin) return { user: admin, isAdmin: true };
        if (employee) return { user: employee, isAdmin: false };

        return null;
    } catch (error) {
        throw error;
    }
};

  const getUserModel = (isAdmin) => (isAdmin ? [Admin, "Admin"] : [Employee, "Employee"]);

const generateToken = (user, isAdmin) => {
    return jwt.sign(
        { id: user._id, user: user, role: isAdmin ? "Admin" : "Employee" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const register = async (req, res) => {
    try {

        const { isAdmin, email, password, name, org } = req.body;

        const [UserModel, userType] = getUserModel(isAdmin);

        const data = await checkUserExists(email);

        const user = data?.user;

        if (user) {
            return res.status(400).json({ message: `This email already exists` });
        }   
        
        if(Object.keys(org).length === 0){
            return res.status(400).json({ message: `No such organisation exists` });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new UserModel({ email, password: hashedPassword, name, org });
        await newUser.save();

        res.status(201).json({ 
            message: `New ${userType} registered successfully`
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const data = await checkUserExists(email);

        const [UserModel, userType] = getUserModel(data.isAdmin);
        
        if (!data.user) return res.status(404).json({ message: "User not found!" });
        
        if (!(await bcrypt.compare(password, data.user.password))) {
            return res.status(401).json({ message: "Invalid password" });
        }
        
        const token = generateToken(data.user, data.isAdmin);
        
        res.status(200).json({ 
            message: `${userType} logged in successfully`,
            token
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
