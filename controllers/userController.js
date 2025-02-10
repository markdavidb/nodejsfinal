/**
 * @file controllers/userController.js
 * @description Controller for fetching user details by ID.
 */

const User = require('../models/user');
const Cost = require('../models/cost');

/**
 * Get user details by ID.
 * Endpoint: GET /api/users/:userId
 * Returns: first_name, last_name, id, total (total costs)
 */
exports.getUserDetails = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (isNaN(userId)) {
            console.log("Invalid user ID:", req.params.userId);
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await User.findOne({ id: userId });
        if (!user) {
            console.log("User not found with ID:", userId);
            return res.status(404).json({ error: 'User not found' });
        }

        const userCosts = await Cost.find({ userid: userId });
        const total = userCosts.reduce((sum, cost) => sum + cost.sum, 0);

        const result = {
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total: total
        };

        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Server error', message: error.message });
    }
};
