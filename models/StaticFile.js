const mongoose = require('mongoose');

const StaticFileSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  originalName: String,
  contentType: String,
  size: Number,
  data: Buffer,
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StaticFile', StaticFileSchema);
