/**
 * @file models/cost.js
 * @description Defines the Cost schema and exports the Mongoose model.
 */

const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    userid: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true,
        enum: ['food', 'health', 'housing', 'sport', 'education']
    },
    sum: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cost', costSchema);
