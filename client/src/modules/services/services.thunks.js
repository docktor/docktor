import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { push } from 'react-router-redux';
import { withAuth } from '../auth/auth.wrappers';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';

// Service Actions
import ServicesActions from './services.actions';

// Imports for fetch API
import { generateEntitiesThunks } from '../utils/entities';

// Thunk to fetch services
const fetchService = (id) => {
  return function (dispatch) {

    dispatch(ServicesActions.requestService(id));

    return fetch(`/api/services/${id}`, withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(ServicesActions.receiveService(response));
      })
      .catch(error => {
        handleError(error, ServicesActions.invalidRequestService, dispatch);
      });
  };
};

// Thunk to get all daemons used on a group:
const fetchGroupServices = (groupId) => {
  return function (dispatch) {

    dispatch(ServicesActions.requestAll());

    let request = new Request(`/api/groups/${groupId}/services`, withAuth({
      method: 'GET',
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(ServicesActions.received(response));
      })
      .catch(error => {
        handleError(error, ServicesActions.invalidRequest, dispatch);
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

    dispatch(ServicesActions.requestSaveService(service));

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
        dispatch(ServicesActions.serviceSaved(response));
        dispatch(push('/services'));
      })
      .catch(error => {
        handleError(error, ServicesActions.invalidRequestService, dispatch);
      });
  };
};

// Thunk to delete a site
const deleteService = (id) => {
  return function (dispatch) {

    dispatch(ServicesActions.requestDeleteService(id));

    let request = new Request('/api/services/' + id, withAuth({
      method: 'DELETE'
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(ServicesActions.serviceDeleted(response));
        dispatch(push('/services'));
      })
      .catch(error => {
        handleError(error, ServicesActions.invalidRequestService, dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('services'),
  fetchService,
  fetchGroupServices,
  saveService,
  deleteService
};
