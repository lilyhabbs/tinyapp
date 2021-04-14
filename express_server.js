const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const checkEmail = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }

  return false;
};

const verifyPassword = (users, email, password) => {
  for (const user in users) {
    if (users[user].email === email && users[user].password === password) {
      return true;
    }
  }

  return false;
};

const getUserId = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW'
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW' },
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
  'aJ48lW': {
    id: 'aJ48lW',
    email: 'user3@example.com',
    password: 'underwater-disneyland',
  },
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Templates
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id],
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
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
  };
  // urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect(`/urls/${shortURL}`);
});

// Edit URL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.updatedURL,
  };
  res.redirect(`/urls/`);
});

// Delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Login
app.post('/login', (req, res) => {
  const isRegistered = checkEmail(users, req.body.email);
  const isVerified = verifyPassword(users, req.body.email, req.body.password);
  const userId = getUserId(users, req.body.email);

  if (!isRegistered || !isVerified) {
    res.sendStatus(403);
  }
  
  res.cookie('user_id', userId);
  res.redirect(`/urls`);
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Register new user
app.post('/register', (req, res) => {
  const isRegistered = checkEmail(users, req.body.email);

  if (req.body.email === '' || req.body.password === '' || isRegistered) {
    res.sendStatus(400);
  }

  const userId = generateRandomString();
  
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password,
  };

  res.cookie('user_id', userId);
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});