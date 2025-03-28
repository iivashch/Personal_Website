const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { marked } = require('marked')
//const marked = require('marked');
const methodOverride = require('method-override');
const ejs = require('ejs');
const cookieParser = require('cookie-parser'); // Import cookie-parser


const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(cookieParser()); // Use cookie-parser middleware
app.set('view engine', 'ejs');

// Database connection
mongoose.connect('mongodb://mongo:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });

// Models
const User = require('./models/User');
const Post = require('./models/Post');


// Apply authenticate middleware to all routes
app.use(async (req, res, next) => {
    console.log('All Routes Authentication Middleware'); // Debug log
    const token = req.cookies.token;
    console.log('All Routes Authentication Token:', token); // Debug log
    if (!token) {
        console.log('No token found'); // Debug log
      req.user = null; // No user is logged in
      return next();
    }
  
    try {
      const decoded = jwt.verify(token, 'secretkey');
      const user = await User.findById(decoded.userId);
      if (!user) {
          console.log('User not found:'); // Debug log
          req.user = null; // Invalid token or user not found
          return next();
        }
        console.log('All Routes Authentication User:', user); // Debug log
      req.user = user; // Attach the user to the request
      next();
      
    } catch (err) {
        console.log('Token verification failed:', err); // Debug log
      req.user = null; // Token verification failed
      next();
    }
  });


console.log("Starting application...");

// Routes
app.get('/', async (req, res) => {
    console.log('Receiving request at /'); // Debug log
    console.log('Authenticated User:', req.user); // Debug log
    try {
        const posts = await Post.find().populate('author');
        console.log('Fetched posts:', posts); // Debug log
        res.render('index', { posts, user: req.user });
      } catch (err) {
        console.error('Error fetching posts:', err); // Debug log
        res.status(500).send('Error fetching posts');
      }
});

app.get('/register', (req, res) => {
    console.log('Get Registered User:', req.user); // Debug log
  res.render('register', { user: req.user });
});

app.post('/register', async (req, res) => {
    console.log('Register Attempt:', req.body);
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    console.log('POST User registered:', user); // Debug log

    res.redirect('/login');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get('/login', (req, res) => {
    console.log('Login Page Accessed'); // Debug log
  res.render('login', { user: req.user });
});

app.post('/login', async (req, res) => {
    console.log('Login Attempt:', req.body);
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id }, 'secretkey');
  res.cookie('token', token, { httpOnly: true });

    console.log('Authenticated User:', user.username);
    console.log('Redirecting to Home Page');
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.get('/posts/create-post', (req, res) => {
    if (!req.user) return res.redirect('/login'); // Redirect if user is not logged in
    res.render('create-post', { user: req.user });
});

app.post('/posts', async (req, res) => {
  if (!req.user) return res.redirect('/login'); // Protect route
  const { title, content } = req.body;
  console.log('Creating post:', req.body); // Debug log
  const post = new Post({ title, content, author: req.user._id });
  console.log('Post created:', post); // Debug log
  post.save()
    .then(() => {
      console.log('Post saved:', post); // Debug log
      res.redirect('/');
    })
    .catch(err => {
      console.error('Error saving post:', err); // Debug log
      res.status(400).send(err.message);
    });
});

app.get('/posts/:id', validateObjectId, async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author');
    console.log('Viewing post:', post); // Debug log
  if (!post) return res.status(404).send('Post not found');
  res.render('view-post', { post, user: req.user, marked });
});

app.get('/posts/:id/edit', validateObjectId, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit-post', { post, user: req.user });
});

app.put('/posts/:id', validateObjectId, async (req, res) => {
  const { title, content } = req.body;
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user },
    { title, content },
    { new: true }
  );
  res.redirect(`/posts/${post._id}`);
});

app.delete('/posts/:id', async (req, res) => {
  await Post.findOneAndDelete({ _id: req.params.id, author: req.user});
  res.redirect('/');
});

// Validation Functions
function validateObjectId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).send('Invalid ID');
    }
    next();
  }


/*
// Middleware to verify JWT
function authenticate(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        console.log('No token found'); // Debug log
        return res.redirect('/login');
      }
  
    try {
      const decoded = jwt.verify(token, 'secretkey');
      console.log('Decoded token:', decoded); // Debug log

      User.findById(decoded.userId, (err, user) => {
        if (err || !user) {
            console.log('User not found:', err); // Debug log
            return res.redirect('/login');
          }
        req.user = user; // Attach the user to the request
        console.log('Middleware Authenticated User:', req.user); // Debug log

        next();
      });
    } catch (err) {
      console.log('Token verification failed:', err); // Debug log

      res.redirect('/login');
    }
  }
*/

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});