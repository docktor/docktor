// Request all users
export const REQUEST_ALL_USERS = 'REQUEST_ALL_USERS';

export function requestAllUsers() {
  return {
    type: REQUEST_ALL_USERS
  };
}


// Users are received
export const RECEIVE_USERS = 'RECEIVE_USERS';

export function receiveUsers(users) {
  return {
    type: RECEIVE_USERS,
    users,
    receivedAt: Date.now()
  };
}

// Users API returns an Error
export const INVALID_REQUEST_USERS = 'INVALID_REQUEST_USERS';

export function invalidRequestUsers(error) {
  return {
    type: INVALID_REQUEST_USERS,
    error
  };
}

export const REQUEST_SAVE_USER = 'REQUEST_SAVE_USER';

export function requestSaveUser(user) {
  return {
    type: REQUEST_SAVE_USER,
    user
  };
}

export const RECEIVE_SAVED_USER = 'RECEIVE_SAVED_USER';

export function receiveSavedUser(user) {
  return {
    type: RECEIVE_SAVED_USER,
    user
  };
}

export const INVALID_SAVE_USER = 'INVALID_SAVE_USER';

export function invalidSaveUser(user) {
  return function(error) {
    return {
    type: INVALID_SAVE_USER,
    user,
    error
    };
  };
}
