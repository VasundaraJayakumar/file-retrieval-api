const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Binary } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB (replace 'your-mongodb-connection-string' with your actual MongoDB URL)
mongoose.connect('mongodb+srv://ehuser:ehuser@ehospital.7enczr6.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a Mongoose model for your files
const Bloodtest_ReportSchema = new mongoose.Schema({
    originalname: String,
    data: Buffer,
    mimetype: String,
  });
  
  const MRI_SpineSchema = new mongoose.Schema({
    originalname: String,
    data: Buffer,
    mimetype: String,
  });
  
  const CTScan_BrainSchema = new mongoose.Schema({
    originalname: String,
    data: Buffer,
    mimetype: String,
  });
  
  const ECG_ReportSchema = new mongoose.Schema({
    originalname: String,
    data: Buffer,
    mimetype: String,
  });
  
  const EchocardiogramSchema = new mongoose.Schema({
    originalname: String,
    data: Buffer,
    mimetype: String,
  });
  
  const Ultrasound_AbdomenSchema = new mongoose.Schema({
    originalname: String,
    data: Buffer,
    mimetype: String,
  });
  
  const Medical_HistorySchema = new mongoose.Schema({
    originalname: String,
    data: Buffer,
    mimetype: String,
  });
  
  // Create models for each schema
  const Bloodtest_Report = mongoose.model('BloodtestReport', Bloodtest_ReportSchema);
  const MRI_Spine = mongoose.model('MRI_Spine', MRI_SpineSchema);
  const CTScan_Brain = mongoose.model('CTScan_Brain', CTScan_BrainSchema);
  const ECG_Report = mongoose.model('ECG_Report', ECG_ReportSchema);
  const Echocardiogram = mongoose.model('Echocardiogram', EchocardiogramSchema);
  const Ultrasound_Abdomen = mongoose.model('Ultrasound_Abdomen', Ultrasound_AbdomenSchema);
  const Medical_History = mongoose.model('Medical_History', Medical_HistorySchema);
  

// Define a route to retrieve files by filename
app.get('/files/:type/:filename', async (req, res) => {
  const { type, filename } = req.params;
  let fileModel;

  // Determine the appropriate model based on the type parameter
  switch (type) {
    case 'bloodtest':
      fileModel = Bloodtest_Report;
      break;
    case 'mrispine':
      fileModel = MRI_Spine;
      break;
    case 'ctscanbrain':
      fileModel = CTScan_Brain;
      break;
    case 'ecgreport':
      fileModel = ECG_Report;
      break;
    case 'echocardiogram':
      fileModel = Echocardiogram;
      break;
    case 'ultrasoundabdomen':
      fileModel = Ultrasound_Abdomen;
      break;
    case 'medicalhistory':
      fileModel = Medical_History;
      break;
    default:
      res.status(400).json({ error: 'Invalid file type' });
      return;
  }

  try {
    const file = await fileModel.findOne({ originalname: filename });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.setHeader('Content-Type', file.mimetype);
    res.send(file.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Define a route for the root URL ("/")
app.get('/', (req, res) => {
    res.send('Welcome to the root of your application!');
  });
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

