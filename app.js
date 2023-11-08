const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI;

async function connectToMongoDB() {
  const client = new MongoClient(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}

app.get('/files/:collection/:filename', async (req, res) => {
  try {
    const { collection, filename } = req.params;
    const decodedFilename = decodeURIComponent(filename);
    console.log(`Requested Collection: ${collection}`);
    console.log(`Requested Filename: ${decodedFilename}`);
 
    const typeToCollectionMap = {
      bloodtest: 'Bloodtest_Report',
      mrispine: 'MRI_Spine',
      ctscanbrain: 'CTScan_Brain',
      ecgreport: 'ECG_Report',
      echocardiogram: 'Echocardiogram',
      ultrasoundabdomen: 'Ultrasound_Abdomen',
      medicalhistory: 'Medical_History',
    };
 
    if (!typeToCollectionMap.hasOwnProperty(collection)) {
      console.log(`Invalid file type requested: ${collection}`);
      return res.status(400).json({ error: 'Invalid file type' });
    }
 
    const client = await connectToMongoDB();
    console.log('Connected to MongoDB successfully.');
 
    const db = client.db("htdata");
    const collectionName = typeToCollectionMap[collection];
    console.log(`Using Collection Name: ${collectionName}`);
 
    const file = await db.collection(collectionName).findOne({ originalname: decodedFilename });
    if (!file) {
      console.log(`File not found: ${decodedFilename}`);
      return res.status(404).json({ error: 'File not found' });
    }
 
    console.log(`File found: ${file.originalname}`);
    res.setHeader('Content-Type', file.mimetype);
    res.send(file.data);
  } catch (error) {
    console.error('Error handling file request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
