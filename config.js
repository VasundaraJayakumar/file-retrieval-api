// config.js
require('dotenv').config(); // Load environment variables from .env file

const dbConnectionString = process.env.DB_CONNECTION_STRING;

console.log('DB Connection String:', dbConnectionString);
