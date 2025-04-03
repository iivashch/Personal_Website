const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.get('/register', (req, res) => {
  res.render('register', { user: req.user });
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.redirect('/?registered=pending');
});

router.get('/login', (req, res) => {
  res.render('login', { user: req.user, error: req.query.error });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    // ✅ Store error and redirect to login page
    return res.redirect('/auth/login?error=invalid');
  }

  if (!user.isApproved && !user.isAdmin) {
    return res.redirect('/auth/login?error=approval');
  }

  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });

  // ✅ Redirect admin to admin panel
  if (user.isAdmin) {
    return res.redirect('/admin/users');
  }

  // ✅ Regular user goes to homepage
  res.redirect('/');
});


router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
