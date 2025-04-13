const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { Readable } = require('stream');

const router = express.Router();
const upload = multer();

let bucket;
mongoose.connection.once('open', () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads',
  });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  const { originalname, buffer, mimetype } = req.file;
  const readableStream = Readable.from(buffer);
  const uploadStream = bucket.openUploadStream(originalname, {
    contentType: mimetype,
  });
  readableStream.pipe(uploadStream);
  uploadStream.on('finish', () => {
    res.redirect('/files');
  });
});

router.get('/', async (req, res) => {
  const files = await mongoose.connection.db
    .collection('uploads.files')
    .find()
    .toArray();
  res.render('files', { files });
});

router.get('/download/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const fileDoc = await mongoose.connection.db
      .collection('uploads.files')
      .findOne({ _id: fileId });

    if (!fileDoc) return res.status(404).send('File not found');

    res.setHeader('Content-Type', fileDoc.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileDoc.filename}"`);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).send('Error downloading file');
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    await bucket.delete(fileId);
    res.redirect('/files');
  } catch (err) {
    res.status(500).send('Failed to delete file');
  }
});

module.exports = router;
