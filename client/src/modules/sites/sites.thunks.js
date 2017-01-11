import { withAuth } from '../auth/auth.wrappers';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';
import { generateEntitiesThunks } from '../utils/entities';

// Site Actions
import SitesActions from './sites.actions';

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

  const site = { ...form };
  site.created = site.created ? site.created : new Date();

  const endpoint = site.id || 'new';
  const method = site.id ? 'PUT' : 'POST';

  return function (dispatch) {

    dispatch(SitesActions.requestSaveSite(site));

    const request = new Request('/api/sites/' + endpoint, withAuth({
      method: method,
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
