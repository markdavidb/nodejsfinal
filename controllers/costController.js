const Cost = require('../models/cost');
const User = require('../models/user');

/**
 * Add a new cost.
 * Endpoint: POST /api/add
 * Expects the following fields in the request body:n
 *   - userid: User ID
 *   - description: Description of the cost
 *   - category: Category (food, health, housing, sport, education)
 *   - sum: Amount of the cost
 *   - createdAt (optional): Creation date of the cost
 *
 * @param {Object} req - Request object containing the cost data
 * @param {Object} res - Response object
 */
exports.addCost = async (req, res) => {
    console.log("Received POST /api/add with body:", req.body);
    try {
        const { userid, description, category, sum, createdAt } = req.body;

        // Check that all required fields are provided
        if (!userid || !description || !category || !sum) {
            console.log("Missing required fields");
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const validCategories = ['food', 'health', 'housing', 'sport', 'education'];
        if (!validCategories.includes(category)) {
            console.log("Invalid category:", category);
            return res.status(400).json({
                error: 'Invalid category',
                validCategories
            });
        }

        // Check if the user exists in the database
        const user = await User.findOne({ id: Number(userid) });
        if (!user) {
            console.log("User not found with id:", userid);
            return res.status(404).json({ error: 'User not found' });
        }

        // Create a new Cost document; if createdAt is not provided, the schema default will be used
        const newCost = new Cost({
            userid,
            description,
            category,
            sum,
            createdAt: createdAt ? new Date(createdAt) : undefined
        });

        const savedCost = await newCost.save();

        console.log("Added cost:", savedCost);
        return res.json(savedCost);
    } catch (error) {
        console.error("Error in addCost:", error);
        return res.status(500).json({ error: 'Server error', message: error.message });
    }
};

/**
 * Get a monthly report of the user's costs.
 * Endpoint: GET /api/report?id=...&year=...&month=...
 * Expects the following query parameters:
 *   - id: User ID
 *   - year: Year
 *   - month: Month
 *
 * @param {Object} req - Request object containing query parameters
 * @param {Object} res - Response object
 */
exports.getMonthlyReport = async (req, res) => {
    console.log("Received GET /api/report with query:", req.query);
    try {
        const { id, year, month } = req.query;

        if (!id || !year || !month) {
            console.log("Missing required query parameters: id, year, month");
            return res.status(400).json({ error: 'Missing required query parameters: id, year, month' });
        }

        const userId = Number(id);
        const reportYear = Number(year);
        const reportMonth = Number(month);

        if (isNaN(userId) || isNaN(reportYear) || isNaN(reportMonth)) {
            console.log("Invalid query parameter types");
            return res.status(400).json({ error: 'Query parameters id, year, and month must be numbers' });
        }

        const startDate = new Date(reportYear, reportMonth - 1, 1); // ינואר=0 פברואר=1...
        const endDate = new Date(reportYear, reportMonth, 1); // תחילת החודש הבא

        const costs = await Cost.find({
            userid: userId,
            createdAt: { $gte: startDate, $lt: endDate }
        });

        const categories = ['food', 'health', 'housing', 'sport', 'education'];
        const costsGrouped = {};

        categories.forEach(category => {
            costsGrouped[category] = costs
                .filter(cost => cost.category === category)
                .map(cost => ({
                    sum: cost.sum,
                    description: cost.description,
                    day: new Date(cost.createdAt).getDate()
                }));
        });

        const report = {
            userid: userId,
            year: reportYear,
            month: reportMonth,
            costs: costsGrouped
        };

        return res.json(report);
    } catch (error) {
        console.error("Error in getMonthlyReport:", error);
        return res.status(500).json({ error: 'Server error', message: error.message });
    }
};
