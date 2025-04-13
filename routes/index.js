const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');



router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB not connected, skipping image fetch');
      return res.render('index', {
        featuredImages: [],
        user: req.user,
        query: req.query,
      });
    }

    const db = mongoose.connection.db;
    const featuredImages = await db
      .collection('uploads.files')
      .find({ 'metadata.featured': true })
      .toArray();

    res.render('index', {
      featuredImages,
      user: req.user,
      query: req.query,
    });
  } catch (err) {
    console.error('❌ Error fetching featured images:', err);
    res.render('index', {
      featuredImages: [],
      user: req.user,
      query: req.query,
    });
  }
});


module.exports = router;
