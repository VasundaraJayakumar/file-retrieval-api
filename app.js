const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Get MongoDB URI from the environment variables
const mongoURI = process.env.MONGODB_URI;

let dbClient;

async function connectToMongoDB() {
  if (!dbClient) {
    dbClient = new MongoClient(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  try {
    if (!dbClient.isConnected()) {
      await dbClient.connect();
      console.log('Connected to MongoDB');
    }
    return dbClient;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}

// Define a route to retrieve files by collection name and filename
app.get('/files/:collection/:filename', async (req, res) => {
  const { collection, filename } = req.params;
  const decodedFilename = decodeURIComponent(filename);

  // Define a map to validate and map the 'collection' parameter to collection names
  const typeToCollectionMap = {
    bloodtest: 'Bloodtest_Report',
    mrispine: 'MRI_Spine',
    ctscanbrain: 'CTScan_Brain',
    ecgreport: 'ECG_Report',
    echocardiogram: 'Echocardiogram',
    ultrasoundabdomen: 'Ultrasound_Abdomen',
    medicalhistory: 'Medical_History',
  };

  const collectionName = typeToCollectionMap[collection];

  if (!collectionName) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  try {
    const client = await connectToMongoDB();
    const db = client.db("htdata");

    const file = await db.collection(collectionName).findOne({ originalname: decodedFilename });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Type', file.mimetype);
    res.send(file.data);
  } catch (error) {
    console.error('Error handling file request:', error);
    res.status(500).json({ error: 'Internal server error' });
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
