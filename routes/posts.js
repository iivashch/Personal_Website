const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const mongoose = require('mongoose');
const { marked } = require('marked');

function validateObjectId(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send('Invalid ID');
  }
  next();
}

router.get('/create-post', (req, res) => {
  if (!req.user) return res.redirect('/auth/login');
  res.render('create-post', { user: req.user });
});

router.post('/', async (req, res) => {
  if (!req.user) return res.redirect('/auth/login');
  const { title, content } = req.body;
  const post = new Post({ title, content, author: req.user._id });
  await post.save();
  res.redirect('/posts/view-posts');
});

router.get('/view-posts', async (req, res) => {
  const posts = await Post.find().populate('author').sort({ createdAt: -1 });
  res.render('view-posts', { posts, user: req.user });
});

router.get('/', (req, res) => {
  res.redirect('/posts/view-posts');
});


router.get('/:id', validateObjectId, async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author');
  if (!post) return res.status(404).send('Post not found');
  res.render('view-post', { post, user: req.user, marked });
});

router.get('/:id/edit', validateObjectId, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit-post', { post, user: req.user });
});

router.put('/:id', validateObjectId, async (req, res) => {
  const { title, content } = req.body;
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user },
    { title, content },
    { new: true }
  );
  res.redirect(`/posts/${post._id}`);
});

router.delete('/:id', async (req, res) => {
  await Post.findOneAndDelete({ _id: req.params.id, author: req.user });
  res.redirect('/posts/view-posts');
});

module.exports = router;
