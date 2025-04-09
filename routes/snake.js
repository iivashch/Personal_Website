// routes/snake.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Snake game page
router.get('/', async (req, res) => {
  let leaderboard = [];
  let userWithScore = null;

  try {
    // Initialize snakeScore for all users if missing
    await User.updateMany(
      { snakeScore: { $exists: false } },
      { $set: { snakeScore: 0 } }
    );

    leaderboard = await User.find({ snakeScore: { $exists: true } })
      .sort({ snakeScore: -1 })
      .limit(10)
      .select('username snakeScore');

    if (req.user) {
      userWithScore = await User.findById(req.user._id).select('username snakeScore isAdmin');
    }
  } catch (err) {
    console.error('Failed to fetch leaderboard or user score:', err);
  }

  res.render('snake', {
    user: userWithScore,
    leaderboard
  });
});

// Save user's new best score
router.post('/score', async (req, res) => {
  if (!req.user) return res.redirect('/snake');

  const numericScore = parseInt(req.body.score, 10);
  if (isNaN(numericScore)) return res.redirect('/snake');

  try {
    const user = await User.findById(req.user._id);
    if (user && (!user.snakeScore || numericScore > user.snakeScore)) {
      user.snakeScore = numericScore;
      await user.save();
    }
    res.redirect('/snake');
  } catch (err) {
    console.error('Error saving snake score:', err);
    res.redirect('/snake');
  }
});

module.exports = router;
