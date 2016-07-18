// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';

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
    let error = false;

    return fetch('/api/users')
      .then(response => {
        if (!response.ok) {
          error = true;
          return response.text();
        }
        return response.json();
      })
      .then(json => {
        if (error) {
          throw Error(json);
        }
        dispatch(receiveUsers(json));
      })
      .catch(error => {
        dispatch(invalidRequestUsers(error.message));
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
