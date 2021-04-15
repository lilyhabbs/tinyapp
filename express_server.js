const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const { generateRandomString, getUserByEmail, getUrlsForUser } = require('./helpers');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ // Express body parser
  extended: true,
}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hour expiry (1000ms * 60s * 60m * 24h)
}));

// Databases
const urlDatabase = {};
const users = {};

// Templates
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    const templateVars = {
      urls: getUrlsForUser(urlDatabase, req.session.user_id),
      user: users[req.session.user_id],
    };

    res.render('urls_index', templateVars);
  }
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };

    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
    urls: getUrlsForUser(req.session.user_id, urlDatabase),
  };
  
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  res.render('urls_login', templateVars);
});

// Redirect short URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

// Create new URL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.newURL,
    userID: users[req.session.user_id].id,
  };

  res.redirect(`/urls/${shortURL}`);
});

// Edit URL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrls = getUrlsForUser(req.session.user_id, urlDatabase);

  if (shortURL in userUrls) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.updatedURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/`);
  } else {
    res.send('You are not authorized to edit this URL.\n');
  }
});

// Delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrls = getUrlsForUser(req.session.user_id, urlDatabase);

  if (shortURL in userUrls) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('You are not authorized to delete this URL.\n');
  }
});

// Register new user
app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  const hashPassword = bcrypt.hashSync(req.body.password, 10);
  
  const user = getUserByEmail(newEmail, users);
  
  if (newEmail === '' || hashPassword === '') {
    res.status(400);
    res.send('Please ensure all fields are filled in.\n');
  } else if (user) {
    res.status(400);
    res.send('There is already an account associated with this email address. Please try again.\n');
  } else {
    const newUserID = generateRandomString();
    
    users[newUserID] = {
      id: newUserID,
      email: newEmail,
      password: hashPassword,
    };
  
    req.session.user_id = newUserID;
    res.redirect('/urls');
  }
});

// Login
app.post('/login', (req, res) => {
  const testEmail = req.body.email;
  const testPassword = req.body.password;

  const user = getUserByEmail(testEmail, users);  
  
  if (!user || !bcrypt.compareSync(testPassword, user.password)) {
    res.status(403);
    res.send('Your email and/or password do not match our records. Please try again.\n');
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});