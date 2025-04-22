// app.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

const app = express();

// 🔗 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// 🔧 View engine
app.set('view engine', 'ejs');

// 📂 Serve static assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// 🧼 Core middleware
app.use(methodOverride('_method'));
app.use(cookieParser());

// 🔐 Authentication middleware
const { authenticateUser } = require('./middleware/authenticate');
app.use(authenticateUser);

// 📦 Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌍 Route handlers
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/admin', require('./routes/admin'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/files', require('./routes/files')); // includes upload/download/preview/delete
app.use('/snake', require('./routes/snake'));
app.use('/guess', require('./routes/guess'));
app.use('/', require('./routes/health'));
app.use('/landing', require('./routes/landing'));
app.use('/picture-gallery', require('./routes/picture-gallery'));

// 👑 Admin bootstrap
const User = require('./models/User');
mongoose.connection.once('open', async () => {
  try {
    const adminExists = await User.findOne({ username: process.env.ADMIN_USERNAME });
    if (!adminExists) {
      const admin = new User({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        isAdmin: true,
        isApproved: true,
      });
      await admin.save();
      console.log('✔ Admin user created');
    } else {
      console.log('✔ Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  }
});

// ✅ Start server locally only if not in Lambda
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 App running at http://localhost:${PORT}`));
}

module.exports = app;
