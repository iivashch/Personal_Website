// routes/dashboard.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  res.render('dashboard', { user: req.user });
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
