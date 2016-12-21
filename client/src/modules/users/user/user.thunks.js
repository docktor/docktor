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

// TODO: add saveUser and deleteUser

export default {
  fetchUser,
};
