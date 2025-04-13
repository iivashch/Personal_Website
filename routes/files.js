const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { Readable } = require('stream');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();
const upload = multer();

let bucket;
function getBucket() {
  if (!bucket && mongoose.connection.readyState === 1) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });
  }
  return bucket;
}

// Upload with unique filename enforcement
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    const { filename } = req.body;
    const saveAs = filename?.trim() || originalname;

    // Delete old file with same name (optional: use versioning instead)
    const existing = await mongoose.connection.db
      .collection('uploads.files')
      .findOne({ filename: saveAs });

    if (existing) {
      await getBucket().delete(existing._id);
      console.log(`♻️ Replaced existing file: ${saveAs}`);
    }

    const readableStream = Readable.from(buffer);

    const isFeatured = req.body.featured === 'on';

    const uploadStream = getBucket().openUploadStream(saveAs, {
      contentType: mimetype,
      metadata: { isFeatured }
    });

    readableStream.pipe(uploadStream);
    uploadStream.on('finish', () => {
      console.log(`📤 Uploaded: ${saveAs} (${mimetype}, ${buffer.length} bytes)`);
      res.redirect('/files');
    });
  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).send('Upload error');
  }
});

// File listing
router.get('/', async (req, res) => {
  const files = await mongoose.connection.db
    .collection('uploads.files')
    .find()
    .toArray();
  res.render('files', { files, user: req.user, isAdmin: req.user?.isAdmin });
});

// Download
router.get('/download/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const fileDoc = await mongoose.connection.db
      .collection('uploads.files')
      .findOne({ _id: fileId });

    if (!fileDoc) return res.status(404).send('File not found');

    res.setHeader('Content-Type', fileDoc.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileDoc.filename}"`);

    console.log(`📥 Downloading: ${fileDoc.filename}`);
    getBucket().openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error('❌ Download error:', err);
    res.status(500).send('Error downloading file');
  }
});

// Preview
router.get('/preview/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const fileDoc = await mongoose.connection.db
      .collection('uploads.files')
      .findOne({ _id: fileId });

    if (!fileDoc) return res.status(404).send('File not found');

    res.setHeader('Content-Type', fileDoc.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileDoc.filename}"`);

    console.log(`👁 Previewing: ${fileDoc.filename}`);
    getBucket().openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error('❌ Preview error:', err);
    res.status(500).send('Error previewing file');
  }
});

// Delete
router.post('/delete/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    await getBucket().delete(fileId);
    console.log(`🗑 Deleted file with ID: ${fileId}`);
    res.redirect('/files');
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).send('Failed to delete file');
  }
});

// isFeatured toggle
router.post('/feature/:id', async (req, res) => {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const db = mongoose.connection.db;
    const file = await db.collection('uploads.files').findOne({ _id: fileId });
  
    const isFeatured = file?.metadata?.featured === true;
  
    await db.collection('uploads.files').updateOne(
      { _id: fileId },
      { $set: { 'metadata.featured': !isFeatured } }
    );
  
    console.log(`🔁 Updated featured flag for ${file.filename} to ${!isFeatured}`);
    res.redirect('/files');
  });

module.exports = router;
