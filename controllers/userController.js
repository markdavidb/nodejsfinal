/**
 * @file controllers/userController.js
 * @description Controller for fetching user details by ID.
 */

const User = require('../models/user');
const Cost = require('../models/cost');

class UserController {
    /**
     * Get user details by ID.
     * Endpoint: GET /api/users/:userId
     * Fetches user details and calculates the total cost of all expenses for that user.
     * @param {Object} req - The HTTP request object
     * @param {Object} res - The HTTP response object
     */
    async getUserDetails(req, res) {
        try {
            // Extract the userId parameter from the request
            const userId = Number(req.params.userId);

            // Validate that userId is a number
            if (isNaN(userId)) {
                console.log("Invalid user ID:", req.params.userId);
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            // Search for the user in the database
            const user = await User.findOne({ id: userId });
            if (!user) {
                console.log("User not found with ID:", userId);
                return res.status(404).json({ error: 'User not found' });
            }

            // Fetch all costs associated with the user
            const userCosts = await Cost.find({ userid: userId });

            // Calculate the total costs for the user
            const total = userCosts.reduce((sum, cost) => sum + cost.sum, 0);

            // Build the result object
            const result = {
                first_name: user.first_name,
                last_name: user.last_name,
                id: user.id,
                total: total    // Total costs (calculated dynamically)
            };

            // Send the result as a JSON response
            return res.json(result);
        } catch (error) {
            // Log and handle server errors
            console.error("Error in getUserDetails:", error);
            return res.status(500).json({ error: 'Server error', message: error.message });
        }
    }
}

module.exports = new UserController(); // Exporting an instance of the class