// app.js - Threat Analyzer Backend server
require('dotenv').config();  // .env file se env variables load karne ke liye
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();


// Middleware
app.use(cors());  // frontend se cross-origin requests ke liye
app.use(bodyParser.json());  // JSON body parsing ke liye
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
    console.log("Connected DB:", mongoose.connection.name);

    // Optional: list collections
    mongoose.connection.db.listCollections().toArray((err, names) => {
      if (err) throw err;
      console.log("Collections:", names.map(c => c.name));
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));



// Routes placeholder (aage routes banayenge)
app.use('/api/scan', require('./routes/scanRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
// Sample route - health check
app.get('/', (req, res) => {
  res.send('Threat Analyzer backend is running');
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
