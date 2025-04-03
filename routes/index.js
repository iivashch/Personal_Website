const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
  const posts = await Post.find().populate('author');
  res.render('index', { 
    posts,
    user: req.user,
    query: req.query
  });
});

module.exports = router;
