const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

const getUrlsForUser = (id, urlDatabase) => {
  const urlsForUser = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      urlsForUser[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlsForUser;
};

const verifyLongUrl = (url) => {
  return url.startsWith('http');
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  getUrlsForUser,
  verifyLongUrl
};