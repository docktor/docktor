// import constants
import UsersConstants from './users.constants';
import { generateEntitiesActions } from '../utils/entities';


// Change filter
const changeFilter = (filterValue) => {
  return {
    type: UsersConstants.CHANGE_FILTER,
    filterValue
  };
};

// Request a user
const requestUser = id => ({
  type: UsersConstants.REQUEST_USER,
  id
});

// User is received
const receiveUser = user => ({
  type: UsersConstants.RECEIVE_USER,
  user
});

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
    type: UsersConstants.USER_SAVED,
    user
  };
};

// Request site deletion
const requestDeleteUser = id => ({
  type: UsersConstants.REQUEST_DELETE_USER,
  id
});

// User is deleted
const receiveDeletedUser = response => ({
  type: UsersConstants.USER_DELETED,
  id: response,
  receivedAt: Date.now()
});

// User API returns an Error
const invalidRequestUser = error => ({
  type: UsersConstants.INVALID_REQUEST_USER,
  error
});

const invalidSaveUser = user => error => ({
  type: UsersConstants.INVALID_SAVE_USER,
  title: `Cannot save user ${user.username}`,
  message: error,
  level: 'error'
});

const invalidDeleteUser = user => error => ({
  type: UsersConstants.INVALID_DELETE_USER,
  title: `Can not delete user ${user.username}`,
  message: error,
  level: 'error',
});

export default {
  ...generateEntitiesActions('users'),
  changeFilter,
  requestUser,
  receiveUser,
  requestSaveUser,
  receiveSavedUser,
  requestDeleteUser,
  receiveDeletedUser,
  invalidRequestUser,
  invalidSaveUser,
  invalidDeleteUser
};
