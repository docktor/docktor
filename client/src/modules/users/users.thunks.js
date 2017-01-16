import { push } from 'react-router-redux';
import { withAuth } from '../auth/auth.wrappers';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';

import { generateEntitiesThunks } from '../utils/entities';
import UsersActions from './users.actions';

/********** Thunk Functions **********/

// Thunk to save users
// It's used to modify an existing user, not to create one
const saveUser = user => {
  user.created = new Date(user.created);
  const endpoint = user.id;
  const method = 'PUT';
  return dispatch => {

    dispatch(UsersActions.requestSaveUser(user));

    const request = new Request(`/api/users/${endpoint}`, withAuth({
      method: method,
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
        dispatch(push('/users'));
      })
      .catch(error => {
        handleError(error, UsersActions.invalidSaveUser(user), dispatch);
      });
  };
};

const deleteUser = (user) => {
  return function (dispatch) {

    dispatch(UsersActions.requestDeleteUser(user));
    let request = new Request('/api/users/' + user.id, withAuth({
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }));

    return fetch(request)
    .then(checkHttpStatus)
    .then(parseJSON)
    .then(response => {
      dispatch(UsersActions.receiveDeletedUser(response));
    })
    .catch(error => {
      handleError(error, UsersActions.invalidDeleteUser(user), dispatch);
    });
  };
};

// Thunk to fetch users
const fetchUser = id => {
  return dispatch => {

    dispatch(UsersActions.requestUser(id));

    return fetch(`/api/users/${id}`, withAuth({ method: 'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(UsersActions.receiveUser(response));
      })
      .catch(error => {
        handleError(error, UsersActions.invalidRequestUser, dispatch);
      });
  };
};

// Thunk to get all tags used on a group:
// - from group itself
// - from containers and services
const fetchGroupMembers = (groupId) => {
  return function (dispatch) {

    dispatch(UsersActions.requestAll());

    let request = new Request(`/api/groups/${groupId}/members`, withAuth({
      method: 'GET',
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(UsersActions.received(response));
      })
      .catch(error => {
        handleError(error, UsersActions.invalidRequest, dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('users'),
  saveUser,
  deleteUser,
  fetchUser,
  fetchGroupMembers
};
