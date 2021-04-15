const { assert } = require('chai');
const { generateRandomString, getUserByEmail, getUrlsForUser, verifyLongUrl } = require('../helpers.js');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  }
};

const testDatabase = {
  b6UTxQ: { 
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
};

describe('generateRandomString', function() {
  it('should return a random string with six characters', function() {
    const actual = generateRandomString();
    const expected = 'tbd';
    assert.strictEqual(actual, expected);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const actual = user.id;
    const expected = 'userRandomID';
    assert.strictEqual(actual, expected);
  });

  it('should return undefined if an email is not in the database', function() {
    const actual = getUserByEmail('user3@example.com', testUsers);
    const expected = undefined;
    assert.strictEqual(actual, expected);
  });

  describe('getUrlsForUser', function() {
    it('should return the list of URLs for a given user ID', function() {
      const actual = getUrlsForUser();
      const expected = 'tbd';
      assert.strictEqual(actual, expected);
    });

    it('should return an empty object if the user does not have existing URLs', function() {
      const actual = getUrlsForUser();
      const expected = 'tbd';
      assert.strictEqual(actual, expected);
    });
  });

  describe('verifyLongUrl', function() {
    it('should return true if the URL begins with http', function() {
      const actual = verifyLongUrl();
      const expected = true;
      assert.strictEqual(actual, expected);
    });

    it('should return false if the URL does not begin with http', function() {
      const actual = verifyLongUrl();
      const expected = false;
      assert.strictEqual(actual, expected);
    });
  });
});