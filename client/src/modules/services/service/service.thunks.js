import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { push } from 'react-router-redux';
import { withAuth } from '../../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../../utils/promises.js';

// Service Actions
import ServiceActions from './service.actions.js';

/********** Thunk Functions **********/

// Thunk to fetch services
const fetchService = (id) => {
  return function (dispatch) {

    dispatch(ServiceActions.requestService(id));

    return fetch(`/api/services/${id}`, withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(ServiceActions.receiveService(response));
      })
      .catch(error => {
        handleError(error, ServiceActions.invalidRequestService, dispatch);
      });
  };
};

// Thunk to save services
const saveService = (form) => {

  let service = Object.assign({}, form);
  service.port = parseInt(service.port);
  service.timeout = parseInt(service.timeout);
  service.created = service.created ? new Date(service.created) : new Date();
  const endpoint = form.id || 'new';
  const method = form.id ? 'PUT' : 'POST';
  return function (dispatch) {

    dispatch(ServiceActions.requestSaveService(service));

    let request = new Request('/api/services/' + endpoint, withAuth({
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(service)
    }));

    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(ServiceActions.serviceSaved(response));
        dispatch(push('/services'));
      })
      .catch(error => {
        handleError(error, ServiceActions.invalidRequestService, dispatch);
      });
  };
};

// Thunk to delete a site
const deleteService = (id) => {
  return function (dispatch) {

    dispatch(ServiceActions.requestDeleteService(id));

    let request = new Request('/api/services/' + id, withAuth({
      method: 'DELETE'
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(ServiceActions.serviceDeleted(response));
        dispatch(push('/services'));
      })
      .catch(error => {
        handleError(error, ServiceActions.invalidRequestService, dispatch);
      });
  };
};

export default {
  fetchService,
  saveService,
  deleteService
};
