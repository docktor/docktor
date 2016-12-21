import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { push } from 'react-router-redux';
import { withAuth } from '../../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../../utils/promises.js';

// User Actions
import UserActions from './user.actions.js';

// Thunk to fetch users
const fetchUser = id => {
  return dispatch => {

    dispatch(UserActions.requestUser(id));

    return fetch(`/api/users/${id}`, withAuth({ method: 'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(UserActions.receiveUser(response));
      })
      .catch(error => {
        handleError(error, UserActions.invalidRequestUser, dispatch);
      });
  };
};

// Thunk to save users
// It's used to modify an existing user, not to create one
const saveUser = form => {
  console.log(form);
  const user = {
    ...form,
    created: new Date(form.created)
  };
  const endpoint = form.id;
  const method = 'PUT';
  return dispatch => {

    console.log(user);

    dispatch(UserActions.requestSaveUser(user));

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
        dispatch(UserActions.userSaved(response));
        dispatch(push('/users'));
      })
      .catch(error => {
        handleError(error, UserActions.invalidRequestUser, dispatch);
      });
  };
};

// TODO: add deleteUser

export default {
  fetchUser,
  saveUser
};
