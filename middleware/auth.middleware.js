dotenv.config();

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const checkRole = (...allowedRoles) => {
  return (request, response, next) => {
    if (allowedRoles.includes(request.data.role)) next();
    else {
      console.log('Access Denied: Insufficient permissions');
      return response
        .status(403)
        .json({ message: 'Access Denied: Insufficient permissions' });
    }
  };
};

export const protectRoute = async (request, response, next) => {
  try {
    const bearerToken = request.header('Authorization');

    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
      return response
        .status(401)
        .json({ message: 'Access Denied. No token provided!' });
    }

    const token = bearerToken.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.orgId || !decoded.employeeId) {
      return response.status(401).json({ message: 'Invalid Token Data' });
    }

    request.data = decoded;
    next();
  } catch (error) {
    response.status(401).json({ message: 'Invalid or Expired Token', error });
  }
};
