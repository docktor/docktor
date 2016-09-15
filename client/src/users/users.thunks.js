// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';

import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';

// User Actions
import * as UsersActions from './users.actions.js';

// Thunk to fetch users
export function fetchUsers() {
  return function (dispatch) {

    dispatch(UsersActions.requestAllUsers());
    return fetch('/api/users', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(UsersActions.receiveUsers(response));
      })
      .catch(error => {
        handleError(error, UsersActions.invalidRequestUsers, dispatch);
      });
  };
}

export function saveUser(user) {

  const id = user.id ? user.id : -1;

  return function (dispatch) {

    dispatch(UsersActions.requestSaveUser(user));
    let request = new Request('/api/users/' + id, withAuth({
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    }));

    return fetch(request)
    .then(checkHttpStatus)
    .then(parseJSON)
    .then(response => {
        dispatch(UsersActions.receiveSavedUser(response));
    })
    .catch(error => {
        handleError(error, UsersActions.invalidSaveUser(user), dispatch);
    });
  };
}


/********** Helper Functions **********/

// Check that if users should be fetched
function shouldFetchUsers(state) {
  const users = state.users;
  if (!users || users.didInvalidate) {
    return true;
  } else if (users.isFetching) {
    return false;
  } else {
    return true;
  }
}

// Thunk to fech users only if needed
export function fetchUsersIfNeeded() {

  return (dispatch, getState) => {
    if (shouldFetchUsers(getState())) {
      return dispatch(fetchUsers());
    } else {
      return Promise.resolve();
    }
  };
}
