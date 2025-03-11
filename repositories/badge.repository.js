import { ObjectId } from 'mongodb';
import Employee from '../models/employee.model.js';

class BadgeRepository {
    async getEmployeeBadges(employeeId) {
       
        return Employee.aggregate([
            {
                $match: { _id: new ObjectId(employeeId) }
            },
            {
                $unwind: "$badges"
            },
            {
                $lookup: {
                    from: "badges",
                    localField: "badges.badgeId",
                    foreignField: "_id",
                    as: "badgeDetails"
                }
            },
            {
                $unwind: "$badgeDetails"
            },
            {
                $group: {
                    _id: "$_id",
                    badges: { 
                        $push: {  
                            badgeDetails: "$badgeDetails",
                            description: "$badges.description"
                        }
                    }
                }
            }
        ])
}}

export default BadgeRepository;
