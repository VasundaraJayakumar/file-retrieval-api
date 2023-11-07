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
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const client = await connectToMongoDB();
    const db = client.db("htdata");
    const collectionName = typeToCollectionMap[collection];

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

app.get('/', (req, res) => {
  console.log('Received a request to the root URL.');
  res.send('Welcome to the root of your application!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
