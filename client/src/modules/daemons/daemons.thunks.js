import { withAuth } from '../auth/auth.wrappers';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';

import { generateEntitiesThunks } from '../utils/entities';

// Daemons Actions
import DaemonsActions from './daemons.actions';

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
