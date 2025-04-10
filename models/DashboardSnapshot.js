// models/DashboardSnapshot.js
const mongoose = require('mongoose');

const DashboardSnapshotSchema = new mongoose.Schema({
  updated_at: {
    type: String,
    required: true
  },
  stocks: {
    sp500: Number,
    N100: Number,
    SSE: Number
  },
  // Allow dynamic metrics like CPI, PPI, etc.
}, { strict: false, timestamps: true }); // strict: false allows flexible keys

module.exports = mongoose.model('DashboardSnapshot', DashboardSnapshotSchema);
