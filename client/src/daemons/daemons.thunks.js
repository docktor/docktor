// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';
import { generateEntitiesThunks } from '../utils/entities.js';

// Daemons Actions
import DaemonsActions from './daemons.actions.js';

/********** Thunk Functions **********/

// Thunk to fetch daemon info
const fetchDaemonInfo = (daemon, force) => {
  return function (dispatch) {

    dispatch(DaemonsActions.requestDaemonInfo(daemon));
    let url = `/api/daemons/${daemon.id}/info`;
    url = force ? url + '?force=true' : url;
    return fetch(url, withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(DaemonsActions.receiveDaemonInfo(daemon, response));
      })
      .catch(error => {
        handleError(error, DaemonsActions.invalidRequestDaemonInfo(daemon), dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('daemons'),
  fetchDaemonInfo
};
