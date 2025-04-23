const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const mongoose = require('mongoose');
const { marked } = require('marked');

// Fetch posts for landing page
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author').sort({ createdAt: -1 }).limit(3); // Limit to latest 3 posts
    const renderedPosts = posts.map(post => {
      post.content = marked(post.content); // Convert Markdown to HTML
      return post;
    });
    res.render('landing', { posts: renderedPosts, user: req.user, query: req.query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
