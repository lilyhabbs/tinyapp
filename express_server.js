const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Functions
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
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      return true;
    }
  }

  return false;
};

const getIdByEmail = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

const urlsForUser = (urlDatabase, id) => {
  const userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }

  return userUrls;
};

// Databases
const urlDatabase = {};
const users = {};

// Templates
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    const templateVars = {
      urls: urlsForUser(urlDatabase, req.session.user_id),
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
    urls: urlsForUser(urlDatabase, req.session.user_id),
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
  const userUrls = urlsForUser(urlDatabase, req.session.user_id);

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
  const userUrls = urlsForUser(urlDatabase, req.session.user_id);

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
  
  const isRegistered = checkEmail(users, req.body.email);
  
  if (newEmail === '' || hashPassword === '' || isRegistered) {
    res.sendStatus(400);
  } else {
    const newUserID = generateRandomString();
    
    users[newUserID] = {
      id: newUserID,
      email: newEmail,
      password: hashPassword,
    };
  
    req.session.user_id = newUserID;
    res.redirect(`/urls`);
  }
});

// Login
app.post('/login', (req, res) => {
  const testEmail = req.body.email;
  const testPassword = req.body.password;

  const isRegistered = checkEmail(users, testEmail);
  const isVerified = verifyPassword(users, testEmail, testPassword);
  const userID = getIdByEmail(users, testEmail);

  if (!isRegistered || !isVerified) {
    res.sendStatus(403);
  } else {
    req.session.user_id = userID;
    res.redirect(`/urls`);
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