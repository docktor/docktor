// Imports for fetch API
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';
import { generateEntitiesThunks } from '../utils/entities.js';

// Site Actions
import SitesActions from './sites.actions.js';

/********** Thunk Functions **********/

// Thunk to delete a site
const deleteSite = (id) => {
  return function (dispatch) {

    dispatch(SitesActions.requestDeleteSite(id));

    let request = new Request('/api/sites/' + id, withAuth({
      method: 'DELETE'
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(SitesActions.receiveSiteDeleted(response));
      })
      .catch(error => {
          handleError(error, SitesActions.invalidRequestSites, dispatch);
      });
  };
};

// Thunk to save a site
const saveSite = (form) => {

  let site = Object.assign({}, form);
  site.latitude = parseFloat(site.latitude.replace(',', '.'));
  site.longitude = parseFloat(site.longitude.replace(',', '.'));
  site.created = site.created ? site.created : new Date();

  const id = site.id ? site.id : -1;

  return function (dispatch) {

    dispatch(SitesActions.requestSaveSite(site));

    let request = new Request('/api/sites/' + id, withAuth({
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(site)
    }));
    return fetch(request)
    .then(checkHttpStatus)
    .then(parseJSON)
    .then(response => {
        dispatch(SitesActions.receiveSiteSaved(response));
    })
    .catch(error => {
        handleError(error, SitesActions.invalidRequestSites, dispatch);
    });
  };
};

export default {
  ...generateEntitiesThunks('sites'),
  deleteSite,
  saveSite
};
