// Import constants
import UserConstants from './user.constants.js';

// Request a user
const requestUser = id => ({
  type: UserConstants.REQUEST_USER,
  id
});

// User is received
const receiveUser = user => ({
  type: UserConstants.RECEIVE_USER,
  user
});

// Request to save a user
const requestSaveUser = (user => {
  type: UserConstants.REQUEST_SAVE_USER,
  user;
});

// User is saved
const userSaved = user => ({
  type: UserConstants.USER_SAVED,
  user
});

// Request site deletion
const requestDeleteUser = id => ({
  type: UserConstants.REQUEST_DELETE_USER,
  id
});

// User is deleted
const userDeleted = response => ({
  type: UserConstants.USER_DELETED,
  id: response.id,
  receivedAt: Date.now()
});


// User API returns an Error
const invalidRequestUser = error => ({
  type: UserConstants.INVALID_REQUEST_USER,
  error
});

export default {
  requestUser,
  receiveUser,
  requestSaveUser,
  userSaved,
  requestDeleteUser,
  userDeleted,
  invalidRequestUser
};
