import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
        }
        next();
    };
};

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or Expired Token" });
    }
};