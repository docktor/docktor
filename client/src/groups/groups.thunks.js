// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';

// User Actions
import * as GroupsActions from './groups.actions.js';

// Thunk to fetch users
export function fetchGroups() {
  return function (dispatch) {

    dispatch(GroupsActions.requestAllGroups());
    return fetch('/api/groups', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(GroupsActions.receiveGroups(response));
      })
      .catch(error => {
        handleError(error, GroupsActions.invalidRequestGroups, dispatch);
      });
  };
}


/********** Helper Functions **********/

// Check that if groups should be fetched
function shouldFetchGroups(state) {
  const groups = state.groups;
  if (!groups || groups.didInvalidate) {
    return true;
  } else if (groups.isFetching) {
    return false;
  } else {
    return true;
  }
}

// Thunk to fech groups only if needed
export function fetchGroupsIfNeeded() {

  return (dispatch, getState) => {
    if (shouldFetchGroups(getState())) {
      return dispatch(fetchGroups());
    } else {
      return Promise.resolve();
    }
  };
}
