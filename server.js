require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;
const DATA_FOLDER = './editable';

// ✅ Status check route — BEFORE auth middleware
app.get('/status', (req, res) => {
  console.log("🔐 Received API key:", req.query.api_key);
  console.log("🔑 Expected API key:", API_KEY);

  if (req.query.api_key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ status: "Agent backend is running." });
});

// ✅ Auth middleware for all routes after /status
app.use((req, res, next) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// List editable files
app.get('/files', (req, res) => {
  fs.readdir(DATA_FOLDER, (err, files) => {
    if (err) return res.status(500).json({ error: 'Could not list files' });
    res.json(files);
  });
});

// Read file
app.get('/files/:filename', (req, res) => {
  const file = `${DATA_FOLDER}/${req.params.filename}`;
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(file, { root: '.' });
});

// Update file
app.post('/files/:filename', (req, res) => {
  const file = `${DATA_FOLDER}/${req.params.filename}`;
  fs.writeFile(file, req.body.content, 'utf8', err => {
    if (err) return res.status(500).json({ error: 'Failed to write file' });
    res.json({ message: 'File updated' });
  });
});

app.listen(PORT, () => {
  console.log(`Agent backend server running at http://localhost:${PORT}`);
});
