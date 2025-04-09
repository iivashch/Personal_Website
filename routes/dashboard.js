// routes/dashboard.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

router.get('/', (req, res) => {
  const scriptPath = path.join(__dirname, '../py/dashboard_data_fetcher.py');

  exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Python script error: ${error.message}`);
      return res.status(500).send('Failed to fetch dashboard data.');
    }
    if (stderr) console.warn(`Python stderr: ${stderr}`);
    console.log(`Python stdout: ${stdout}`);

    res.render('dashboard', { user: req.user });
  });
});

router.get('/data', (req, res) => {
  const file = path.join(__dirname, '../data/dashboard.json');
  if (fs.existsSync(file)) {
    const json = fs.readFileSync(file);
    res.json(JSON.parse(json));
  } else {
    res.status(500).json({ error: 'Data not available' });
  }
});

module.exports = router;
