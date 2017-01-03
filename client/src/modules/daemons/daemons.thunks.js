// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { push } from 'react-router-redux';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises.js';

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

// Thunk to fetch daemons
const fetchDaemon = (id) => {
  return function (dispatch) {

    dispatch(DaemonsActions.requestDaemon(id));

    return fetch(`/api/daemons/${id}`, withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(DaemonsActions.receiveDaemon(response));
      })
      .catch(error => {
        handleError(error, DaemonsActions.invalidRequestDaemon, dispatch);
      });
  };
};

// Thunk to save daemons
const saveDaemon = (form) => {

  let daemon = Object.assign({}, form);
  daemon.port = parseInt(daemon.port);
  daemon.timeout = parseInt(daemon.timeout);
  daemon.created = daemon.created ? new Date(daemon.created) : new Date();
  const endpoint = form.id || 'new';
  const method = form.id ? 'PUT' : 'POST';
  return function (dispatch) {

    dispatch(DaemonsActions.requestSaveDaemon(daemon));

    let request = new Request('/api/daemons/' + endpoint, withAuth({
      method: method,
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
        dispatch(DaemonsActions.daemonSaved(response));
        dispatch(push('/daemons'));
      })
      .catch(error => {
        handleError(error, DaemonsActions.invalidRequestDaemon, dispatch);
      });
  };
};

// Thunk to delete a site
const deleteDaemon = (id) => {
  return function (dispatch) {

    dispatch(DaemonsActions.requestDeleteDaemon(id));

    let request = new Request('/api/daemons/' + id, withAuth({
      method: 'DELETE'
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(DaemonsActions.daemonDeleted(response));
        dispatch(push('/daemons'));
      })
      .catch(error => {
        handleError(error, DaemonsActions.invalidRequestDaemon, dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('daemons'),
  fetchDaemonInfo,
  fetchDaemon,
  saveDaemon,
  deleteDaemon
};
