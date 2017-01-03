// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { push } from 'react-router-redux';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises.js';

import { generateEntitiesThunks } from '../utils/entities.js';
import GroupsActions from './groups.actions.js';

// Thunk to fetch groups
const fetchGroup = (id) => {
  return function (dispatch) {

    dispatch(GroupsActions.requestGroup(id));

    return fetch(`/api/groups/${id}`, withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(GroupsActions.receiveGroup(response));
      })
      .catch(error => {
        handleError(error, GroupsActions.invalidRequestGroup, dispatch);
      });
  };
};

// Thunk to save groups
const saveGroup = (form) => {

  let group = Object.assign({}, form);
  group.port = parseInt(group.port);
  group.timeout = parseInt(group.timeout);
  group.created = group.created ? new Date(group.created) : new Date();
  const endpoint = form.id || 'new';
  const method = form.id ? 'PUT' : 'POST';
  return function (dispatch) {

    dispatch(GroupsActions.requestSaveGroup(group));

    let request = new Request('/api/groups/' + endpoint, withAuth({
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(group)
    }));

    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(GroupsActions.groupSaved(response));
        dispatch(push('/groups'));
      })
      .catch(error => {
        handleError(error, GroupsActions.invalidRequestGroup, dispatch);
      });
  };
};

// Thunk to delete a site
const deleteGroup = (id) => {
  return function (dispatch) {

    dispatch(GroupsActions.requestDeleteGroup(id));

    let request = new Request('/api/groups/' + id, withAuth({
      method: 'DELETE'
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(GroupsActions.groupDeleted(response));
        dispatch(push('/groups'));
      })
      .catch(error => {
        handleError(error, GroupsActions.invalidRequestGroup, dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('groups'),
  fetchGroup,
  saveGroup,
  deleteGroup
};
