dotenv.config();

import dotenv from "dotenv"
import jwt, { decode } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        console.log(allowedRoles)
        if (allowedRoles.includes(req.user.role)) next();
        return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
    };
};

export const protectRoute = async (req, res, next) => {
    try {
        const bearerToken = req.header("Authorization");

        if (!bearerToken) {
            return res.status(401).json({ message: "Access Denied. No token provided!" });
        }

        const token = bearerToken.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or Expired Token" });
    }
};