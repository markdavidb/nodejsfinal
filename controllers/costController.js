/**
 * @file controllers/costController.js
 * @description Controller for handling cost operations – adding a cost and generating a monthly report.
 */

const Cost = require('../models/cost');
const User = require('../models/user');

class CostController {
    /**
     * Add a new cost.
     * Endpoint: POST /api/add
     * Expects the following fields in the request body:
     * - userid: User ID
     * - description: Description of the cost
     * - category: One of the predefined categories (food, health, housing, sport, education)
     * - sum: Amount of the cost
     * - createdAt (optional): Creation date of the cost
     * @param {Object} req - The HTTP request object
     * @param {Object} res - The HTTP response object
     */
    async addCost(req, res) {
        console.log('Received POST /api/add with body:', req.body);
        try {
            // Destructure the required fields from the request body
            const { userid, description, category, sum, createdAt } = req.body;

            // Validate that all required fields are provided
            if (!userid || !description || !category || !sum) {
                console.log('Missing required fields');
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Validate the category against predefined valid categories
            const validCategories = ['food', 'health', 'housing', 'sport', 'education'];
            if (!validCategories.includes(category)) {
                console.log('Invalid category:', category);
                return res.status(400).json({ error: 'Invalid category', validCategories });
            }

            // Check if the user exists in the database
            const user = await User.findOne({ id: Number(userid) });
            if (!user) {
                console.log('User not found with id:', userid);
                return res.status(404).json({ error: 'User not found' });
            }

            // Create a new cost document with the provided data
            const newCost = new Cost({
                userid,
                description,
                category,
                sum,
                createdAt: createdAt ? new Date(createdAt) : undefined // Use current date if not provided
            });

            // Save the new cost to the database
            const savedCost = await newCost.save();
            console.log('Added cost:', savedCost);

            // Return the newly added cost as a JSON response
            return res.json(savedCost);
        } catch (error) {
            console.error('Error in addCost:', error);
            return res.status(500).json({ error: 'Server error', message: error.message });
        }
    }

    /**
     * Generate a monthly report of the user's costs.
     * Endpoint: GET /api/report?id=...&year=...&month=...
     * Expects the following query parameters:
     * - id: User ID
     * - year: Year
     * - month: Month
     * Returns a grouped JSON report of all costs for the specified user in the given month.
     * @param {Object} req - The HTTP request object
     * @param {Object} res - The HTTP response object
     */
    async getMonthlyReport(req, res) {
        console.log('Received GET /api/report with query:', req.query);
        try {
            // Extract query parameters
            const { id, year, month } = req.query;

            // Validate that all required query parameters are provided
            if (!id || !year || !month) {
                console.log('Missing required query parameters: id, year, month');
                return res.status(400).json({ error: 'Missing required query parameters: id, year, month' });
            }

            // Convert query parameters to numbers
            const userId = Number(id);
            const reportYear = Number(year);
            const reportMonth = Number(month);

            // Validate that query parameters are valid numbers
            if (isNaN(userId) || isNaN(reportYear) || isNaN(reportMonth)) {
                console.log('Invalid query parameter types');
                return res.status(400).json({ error: 'Query parameters id, year, and month must be numbers' });
            }

            const user = await User.findOne({ id: userId });
            if (!user) {
                console.log('User not found with id:', userId);
                return res.status(404).json({ error: 'User not found' });
            }

            // Define date range for the specified month
            const startDate = new Date(reportYear, reportMonth - 1, 1); // Start of the month
            const endDate = new Date(reportYear, reportMonth, 1); // Start of the next month

            // Fetch all costs for the user within the date range
            const costs = await Cost.find({
                userid: userId,
                createdAt: { $gte: startDate, $lt: endDate }
            });

            // Define allowed categories
            const categories = ['food', 'health', 'housing', 'sport', 'education'];
            const costsGrouped = {};

            // Group costs by category
            categories.forEach(category => {
                costsGrouped[category] = costs
                    .filter(cost => cost.category === category)
                    .map(cost => ({
                        sum: cost.sum,
                        description: cost.description,
                        day: new Date(cost.createdAt).getDate()
                    }));
            });

            // Build the report object
            const report = {
                userid: userId,
                year: reportYear,
                month: reportMonth,
                costs: costsGrouped
            };

            // Return the report as a JSON response
            return res.json(report);
        } catch (error) {
            console.error('Error in getMonthlyReport:', error);
            return res.status(500).json({ error: 'Server error', message: error.message });
        }
    }
}

module.exports = new CostController(); // Exporting an instance of the class