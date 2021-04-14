const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Functions
const generateRandomString = (value) => Math.random().toString(36).substr(2, value);

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

// Data
const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'id_aJ48',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'id_aJ48',
  },
};

const users = {
  'id_4we9': {
    id: 'id_4wJ9',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  'id_B52x': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
  'id_aJ48': {
    id: 'id_aJ48',
    email: 'user3@example.com',
    password: 'underwater-disneyland',
  },
};

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
  if (!req.cookies.user_id) {
    res.redirect(`/login`);
  } else {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.newURL,
      userID: users[req.cookies.user_id].id,
    };
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  }
  
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

// Register new user
app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  
  const isRegistered = checkEmail(users, req.body.email);
  
  if (newEmail === '' || newPassword === '' || isRegistered) {
    res.sendStatus(400);
  } else {
    const userID = generateRandomString(4);
    
    users[userID] = {
      id: `id_${userID}`,
      email: newEmail,
      password: newPassword,
    };
  
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  }
});

// Login
app.post('/login', (req, res) => {
  const testEmail = req.body.email;
  const testPassword = req.body.password;

  const isRegistered = checkEmail(users, testEmail);
  const isVerified = verifyPassword(users, testEmail, testPassword);
  const userID = getUserId(users, testEmail);

  if (!isRegistered || !isVerified) {
    res.sendStatus(403);
  } else {
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  }
  
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});