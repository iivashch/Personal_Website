const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const User = require('./models/User');

// Load environment variables
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);




mongoose.connection.once('open', async () => {
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
});


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Authentication middleware
const { authenticateUser } = require('./middleware/authenticate');
app.use(authenticateUser);


// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/admin', require('./routes/admin'));


// 👇 Required for serverless
const serverless = require('serverless-http');
module.exports.handler = serverless(app);

/*
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
*/