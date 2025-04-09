const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, default: "no_email_provided@noemail.com" , unique: true },
  isAdmin: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }, // for registration approval
  createdAt: { type: Date, default: Date.now },
  snakeScore: { type: Number, default: 0 }
});

// Auto-hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
