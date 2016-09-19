// import constants
import UsersConstants from './users.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

// Request save user
const requestSaveUser = (user) => {
  return {
    type: UsersConstants.REQUEST_SAVE_USER,
    user
  };
};

// User was saved
const receiveSavedUser = (user) => {
  return {
    type: UsersConstants.RECEIVE_SAVED_USER,
    user
  };
};

// Users API returns an Error
const invalidSaveUser = (user) => {
  return function(error) {
    return {
      type: UsersConstants.INVALID_SAVE_USER,
      user,
      error
    };
  };
};

export default {
  ...generateEntitiesActions('users'),
  requestSaveUser,
  receiveSavedUser,
  invalidSaveUser
};
