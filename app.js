/**
 * @file app.js
 * @description Entry point of the application – sets up Express, connects to the database, defines routes, and starts the server.
 * This code is written in a clear and beginner-friendly style.
 */

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Importing the routes
const costRoutes = require('./routes/costRoute');   // Routes for handling costs: /api/add, /api/report
const userRoutes = require('./routes/userRoute');   // Routes for handling users: /api/users/:userId
const aboutRoutes = require('./routes/aboutRoute'); // Route for the "About" page: /api/about

// Create the Express app
const app = express();

// Use bodyParser to parse JSON from incoming requests
app.use(bodyParser.json());

// -----------------------------------------------------------------
// Connect to MongoDB Atlas
// Note: Replace the connection string with your own credentials!
// -----------------------------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI || "your_local_mongodb_uri";

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected successfully to MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB Atlas:', err);
    });

// -----------------------------------------------------------------
// Define routes with the prefix "/api"
app.use('/api', costRoutes);         // Cost routes
app.use('/api/users', userRoutes);   // User routes
app.use('/api/about', aboutRoutes);  // About page

// -----------------------------------------------------------------
// Start the server (listen on the configured port or 3000 by default)
const PORT = process.env.PORT || 3001;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

module.exports = app; // Export the app for unit testing
