import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../../utils/utils.js';

// Daemon Actions
import {
  requestDaemon,
  receiveDaemon,
  invalidRequestDaemon
} from './daemon.actions.js';

/********** Thunk Functions **********/

// Thunk to fetch daemons
export function fetchDaemon(id) {
  return function (dispatch) {

    dispatch(requestDaemon(id));

    return fetch(`/api/daemons/${id}`, withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(receiveDaemon(response));
      })
      .catch(error => {
        handleError(error, invalidRequestDaemon, dispatch);
      });
  };
}
