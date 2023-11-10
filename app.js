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

const typeToCollectionMap = {
  bloodtest: 'Bloodtest_Report',
  mrispine: 'MRI_Spine',
  ctscanbrain: 'CTScan_Brain',
  ecgreport: 'ECG_Report',
  echocardiogram: 'Echocardiogram',
  ultrasoundabdomen: 'Ultrasound_Abdomen',
  medicalhistory: 'Medical_History',
};

app.get("/files/:fileType", async (req, res) => {
  const fileType = req.params.fileType;
  let client;

  try {
    const client = await connectToMongoDB();
    const db = client.db("htdata");
    const collectionName = typeToCollectionMap[fileType];

    if (!collectionName) {
      return res.status(400).send("Invalid file type");
    }

    const collection = db.collection(collectionName);
    const result = await collection.findOne({});

    if (result) {
      res.setHeader('Content-Type', result.file.mimetype);
      res.send(result.file.data);
    } else {
      res.status(404).send("File not found");
    }
  } catch (err) {
    console.error(err); 
    res.status(500).send("Error retrieving data or opening file");
  } finally {
    if(client){
    client.close(); 
  }
} 
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/skinCancerData/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("Skin_Images");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
});