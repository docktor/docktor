import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../../utils/utils.js';

// Daemon Actions
import * as DaemonActions from './daemon.actions.js';

/********** Thunk Functions **********/

// Thunk to fetch daemons
const fetchDaemon = (id) => {
  return function (dispatch) {

    dispatch(DaemonActions.requestDaemon(id));

    return fetch(`/api/daemons/${id}`, withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(DaemonActions.receiveDaemon(response));
      })
      .catch(error => {
        handleError(error, DaemonActions.invalidRequestDaemon, dispatch);
      });
  };
};
 export default {
   fetchDaemon
 };
