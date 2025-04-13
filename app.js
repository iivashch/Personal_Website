const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

// 🗂️ Routes
const filesRoute = require('./routes/files');


const app = express();



// 🌱 Load environment variables
dotenv.config();

// 🔗 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// 🧩 Models
const User = require('./models/User');

// 🔧 View engine
app.set('view engine', 'ejs');

// 📂 Serve static assets from public folder
app.use(express.static('public'));

// 🧼 Core middleware
app.use(methodOverride('_method'));
app.use(cookieParser());

// 🔐 Auth middleware
const { authenticateUser } = require('./middleware/authenticate');
app.use(authenticateUser);



// 📦 Body parsers (AFTER upload routes!)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌍 Core application routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/dashboard'));
app.use('/files', requere(filesRoute));

// 🎮 Mini-apps and games
app.use('/snake', require('./routes/snake'));
app.use('/guess', require('./routes/guess'));

// 👑 Create admin if missing
mongoose.connection.once('open', async () => {
  try {
    const adminExists = await User.findOne({ username: process.env.ADMIN_USERNAME });
    if (!adminExists) {
      const admin = new User({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        isAdmin: true,
        isApproved: true
      });
      await admin.save();
      console.log('✔ Admin user created');
    } else {
      console.log('✔ Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Error checking/creating admin user:', err);
  }
});

module.exports = app;
