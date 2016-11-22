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


// Request delete user
const requestDeleteUser = (user) => {
  return {
    type: UsersConstants.REQUEST_DELETE_USER,
    user
  };
};

// User was deleted
const receiveDeletedUser = (removedID) => {
  return {
    type: UsersConstants.RECEIVE_DELETED_USER,
    removedID
  };
};

// Users API returns an Error
const invalidDeleteUser = (user) => {
  return function(error) {
    return {
      type: UsersConstants.INVALID_DELETE_USER,
      user,
      error
    };
  };
};

// Change filter
const changeFilter = (filterValue) => {
  return {
    type: UsersConstants.CHANGE_FILTER,
    filterValue
  };
};


export default {
  ...generateEntitiesActions('users'),
  requestSaveUser,
  receiveSavedUser,
  invalidSaveUser,
  requestDeleteUser,
  receiveDeletedUser,
  invalidDeleteUser,
  changeFilter
};
