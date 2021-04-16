const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, getUserByEmail, getUrlsForUser, verifyLongUrl } = require('./helpers');

const app = express();
const PORT = 8080;

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true, }));
app.use(cookieSession({
  name: 'session',
  keys: ['sylvan', 'mesa'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hour expiry (1000ms * 60s * 60m * 24h)
}));

// Databases
const urlDatabase = {};
const users = {};

// Templates
app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  if (!req.session.userId) {
    return res.status(403).send('You are not logged in.\n');
  }

  const templateVars = {
    user: users[req.session.userId],
    urls: getUrlsForUser(req.session.userId, urlDatabase),
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const templateVars = {
    user: users[req.session.userId],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Sorry, the short URL you entered does not exist.');
  }

  const templateVars = {
    user: users[req.session.userId],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urls: getUrlsForUser(req.session.userId, urlDatabase),
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render('login', templateVars);
});

// Redirect short URL
app.get('/u/:shortURL', (req, res) => {
  if (!(req.params.shortURL in urlDatabase)) {
    return res.status(404).send('Sorry, the short URL you entered does not exist.');
  }
  
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// Create new URL
app.post('/urls', (req, res) => {
  const isValidURL = verifyLongUrl(req.body.longURL);
  const shortURL = generateRandomString();

  if (!req.session.userId) {
    return res.status(403).send('You must be logged in to create a new URL.\n');
  }
  
  if (!isValidURL) {
    return res.status(400).send('Please enter a valid URL starting with http:// or https://');
  }

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: users[req.session.userId].id,
  };
  res.redirect(`/urls/${shortURL}`);
});

// Edit URL
app.post('/urls/:shortURL', (req, res) => {
  const validURL = verifyLongUrl(req.body.updatedURL);
  const userUrls = getUrlsForUser(req.session.userId, urlDatabase);
  
  if (!validURL) {
    return res.status(400).send('Please enter a valid URL starting with http:// or https://\n');
  }

  if (!(req.params.shortURL in userUrls)) {
    return res.status(403).send('Sorry, you are not authorized to edit this URL.\n');
  }

  urlDatabase[req.params.shortURL] = {
    longURL: req.body.updatedURL,
    userId: req.session.userId,
  };
  res.redirect('/urls/');
});

// Delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const userUrls = getUrlsForUser(req.session.userId, urlDatabase);

  if (!(req.params.shortURL in userUrls)) {
    return res.status(403).send('Sorry, you are not authorized to delete this URL.\n');
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Register new user
app.post('/register', (req, res) => {
  const hashPassword = bcrypt.hashSync(req.body.password, 10);
  const user = getUserByEmail(req.body.email, users);
  const userId = generateRandomString();
  
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Please ensure all fields are filled in.\n');
  }
  
  if (user) {
    return res.status(400).send('There is already an account associated with this email address. Please login or use a different email.\n');
  }
  
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hashPassword,
  };
  req.session.userId = userId;
  res.redirect('/urls');
});

// Login
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send('Your email and/or password do not match our records. Please try again.\n');
  }

  req.session.userId = user.id;
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});