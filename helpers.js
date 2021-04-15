const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

const getUrlsForUser = (id, urlDatabase) => {
  const userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
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