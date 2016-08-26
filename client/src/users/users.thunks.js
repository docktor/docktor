// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';

import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';

// User Actions
import {
  requestAllUsers,
  receiveUsers,
  invalidRequestUsers
} from './users.actions.js';

// Thunk to fetch users
export function fetchUsers() {
  return function (dispatch) {

    dispatch(requestAllUsers());
    return fetch('/api/users', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(response => {
        var error = new Error('Oulala');
        throw error;
      })
      .then(parseJSON)
      .then(response => {
          dispatch(receiveUsers(response));
      })
      .catch(error => {
        handleError(error, invalidRequestUsers, dispatch);
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
