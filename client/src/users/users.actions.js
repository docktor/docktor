// import constants
import UsersConstants from './users.constants.js';

// Request all users
export function requestAllUsers() {
  return {
    type: UsersConstants.REQUEST_ALL_USERS
  };
}


// Users are received
export function receiveUsers(users) {
  return {
    type: UsersConstants.RECEIVE_USERS,
    users,
    receivedAt: Date.now()
  };
}

// Users API returns an Error
export function invalidRequestUsers(error) {
  return {
    type: UsersConstants.INVALID_REQUEST_USERS,
    error
  };
}

// Request save user
export function requestSaveUser(user) {
  return {
    type: UsersConstants.REQUEST_SAVE_USER,
    user
  };
}

// User was saved
export function receiveSavedUser(user) {
  return {
    type: UsersConstants.RECEIVE_SAVED_USER,
    user
  };
}

// Users API returns an Error
export function invalidSaveUser(user) {
  return function(error) {
    return {
    type: UsersConstants.INVALID_SAVE_USER,
    user,
    error
    };
  };
}
