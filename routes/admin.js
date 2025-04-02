const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const isAdmin = require('../middleware/isAdmin');

// View all users
router.get('/users', isAdmin, async (req, res) => {
  const users = await User.find();
  res.render('admin/users', { users, user: req.user });
});

// Approve or toggle user
router.post('/users/:id/approve', isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isApproved = !user.isApproved;
  await user.save();
  res.redirect('/admin/users');
});

// Edit user (GET form)
router.get('/users/:id/edit', isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('admin/edit-user', { user, currentUser: req.user });
});

// Edit user (POST update)
router.post('/users/:id/edit', isAdmin, async (req, res) => {
  const { username, isAdmin, isApproved } = req.body;
  await User.findByIdAndUpdate(req.params.id, {
    username,
    isAdmin: isAdmin === 'on',
    isApproved: isApproved === 'on'
  });
  res.redirect('/admin/users');
});

// Delete user
router.post('/users/:id/delete', isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/users');
});

// View all posts (admin control)
router.get('/posts', isAdmin, async (req, res) => {
  const posts = await Post.find().populate('author');
  res.render('admin/posts', { posts, user: req.user });
});

// Edit any post
router.get('/posts/:id/edit', isAdmin, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('admin/edit-post', { post, user: req.user });
});

router.post('/posts/:id/edit', isAdmin, async (req, res) => {
  const { title, content } = req.body;
  await Post.findByIdAndUpdate(req.params.id, { title, content });
  res.redirect('/admin/posts');
});

// Delete any post
router.post('/posts/:id/delete', isAdmin, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/admin/posts');
});

module.exports = router;
