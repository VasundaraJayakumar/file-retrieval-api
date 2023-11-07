const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Get MongoDB URI from the environment variables
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB using the MongoDB client
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a route to retrieve files by collection name and filename
app.get('/files/:collection/:filename', async (req, res) => {
  await client.connect(); // Connect to MongoDB
  const db = client.db("htdata");
  const { collection, filename } = req.params;

  // Use decodeURIComponent to correctly handle special characters in the filename
  const decodedFilename = decodeURIComponent(filename);

  // Define a map to validate and map the 'type' parameter to collection names
  const typeToCollectionMap = {
    bloodtest: 'Bloodtest_Report',
    mrispine: 'MRI_Spine',
    ctscanbrain: 'CTScan_Brain',
    ecgreport: 'ECG_Report',
    echocardiogram: 'Echocardiogram',
    ultrasoundabdomen: 'Ultrasound_Abdomen',
    medicalhistory: 'Medical_History',
  };

  // Check if the 'type' parameter is valid
  if (!typeToCollectionMap.hasOwnProperty(collection)) {
    res.status(400).json({ error: 'Invalid file type' });
    return;
  }

  // Use the collection name directly for file retrieval
  const fileModel = mongoose.model(typeToCollectionMap[collection], new mongoose.Schema({
    originalname: String,
    data: Buffer,
    mimetype: String,
  }));

  try {
    const file = await fileModel.findOne({ originalname: decodedFilename });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.setHeader('Content-Type', file.mimetype);
    res.send(file.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close(); // Close the MongoDB connection
  }
});

// Define a route for the root URL ("/")
app.get('/', (req, res) => {
  console.log('Received a request to the root URL.');
  res.send('Welcome to the root of your application!');
});

// Get the port from the environment variables or use 3000 as a default
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
