import BadgeRepository from '../repositories/badge.repository.js';
import BadgeService from '../services/badge.service.js';

const badgeService = new BadgeService(new BadgeRepository());

class BadgeController {
    async getEmployeeBadges(req, res, next){
        try {
            const { employeeId } = req.params;
            if (!employeeId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const badges = await badgeService.getEmployeeBadges(employeeId);
            res.status(200).json(badges[0]);
        }
        catch (error) {
            next(error);
        }
    }

}

export default BadgeController;
