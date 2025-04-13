const express = require('express');
const router = express.Router();
const axios = require('axios');
const DashboardSnapshot = require('../models/DashboardSnapshot');
const User = require('../models/User');

const GITHUB_API_URL = 'https://iivashch.github.io/daily-json-api/data.json';

// Helper to check if snapshot is older than 24 hours
const isStale = (date) => {
  if (!date) return true;
  const oneDay = 24 * 60 * 60 * 1000;
  return Date.now() - new Date(date).getTime() > oneDay;
};

// 🔸 Render dashboard page
router.get('/dashboard', (req, res) => {
  res.render('dashboard', { user: req.user });
});

// 🔸 Fetch dashboard data (uses DB if fresh, otherwise updates from GitHub Pages)
router.get('/dashboard/data', async (req, res) => {
  try {
    let snapshot = await DashboardSnapshot.findOne().sort({ updated_at: -1 });

    if (!snapshot || isStale(snapshot.updated_at)) {
      console.log('🌐 Fetching fresh data from GitHub Pages...');
      const response = await axios.get(GITHUB_API_URL);
      const freshData = response.data;

      // Update database with fresh data
      snapshot = new DashboardSnapshot(freshData);
      await snapshot.save();
    }

    const data = snapshot.toObject();
    delete data._id;
    delete data.__v;

    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching dashboard data:', err.message);
    res.status(500).json({ error: 'Dashboard data fetch error' });
  }
});

// 🔄 Manually refresh from GitHub Pages
router.post('/dashboard/refresh', async (req, res) => {
  try {
    console.log('🔁 Manual refresh requested...');

    const response = await axios.get(GITHUB_API_URL);
    const freshData = response.data;

    await DashboardSnapshot.findOneAndUpdate({}, freshData, { upsert: true, new: true });

    res.json({ success: true, updated_at: freshData.updated_at });
  } catch (err) {
    console.error('❌ Refresh error:', err.message);
    res.status(500).json({ error: 'Manual refresh failed', details: err.message });
  }
});

module.exports = router;
