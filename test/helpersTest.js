const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const actual = user.id;
    const expected = 'userRandomID';
    assert.strictEqual(actual, expected);
  });

  it('should return undefined if a user is not in the database', function() {
    const actual = getUserByEmail('user3@example.com', testUsers);
    const expected = undefined;
    assert.strictEqual(actual, expected);
  });
});