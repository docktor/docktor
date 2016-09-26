import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { push } from 'react-router-redux';
import { withAuth } from '../../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../../utils/promises.js';

// Daemon Actions
import DaemonActions from './daemon.actions.js';

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

// Thunk to save daemons
const saveDaemon = (form) => {

  let daemon = Object.assign({}, form);
  daemon.port = parseInt(daemon.port);
  daemon.timeout = parseInt(daemon.timeout);
  daemon.created = new Date(daemon.created);
  const id = form.id || -1;
  return function (dispatch) {

    dispatch(DaemonActions.requestSaveDaemon(daemon));

    let request = new Request('/api/daemons/' + id, withAuth({
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(daemon)
    }));

    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(DaemonActions.daemonSaved(response));
        dispatch(push('/daemons'));
      })
      .catch(error => {
        handleError(error, DaemonActions.invalidRequestDaemon, dispatch);
      });
  };
};

// Thunk to delete a site
const deleteDaemon = (id) => {
  return function (dispatch) {

    dispatch(DaemonActions.requestDeleteDaemon(id));

    let request = new Request('/api/daemons/' + id, withAuth({
      method: 'DELETE'
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(DaemonActions.daemonDeleted(response));
          dispatch(push('/daemons'));
      })
      .catch(error => {
          handleError(error, DaemonActions.invalidRequestDaemon, dispatch);
      });
  };
};

 export default {
   fetchDaemon,
   saveDaemon,
   deleteDaemon
 };
