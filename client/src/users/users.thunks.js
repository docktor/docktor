// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';
import { generateEntitiesThunks } from '../utils/entities.js';

// User Actions
import UsersActions from './users.actions.js';

/********** Thunk Functions **********/

// saveUser
const saveUser = (user) => {
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
};

export default {
  ...generateEntitiesThunks('users'),
  saveUser
};
