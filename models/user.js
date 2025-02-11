/**
 * @file models/user.js
 * @description Defines the User schema and exports the Mongoose model.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
    },
    /**
     * User's marital status.
     * Allowed values: single, married, divorced, widowed.
     */
    marital_status: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed'],
    }
});

module.exports = mongoose.model('User', userSchema);
