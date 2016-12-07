// import constants
import SitesConstants from './sites.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

// Request site deletion
const requestDeleteSite = (id) => {
  return {
    type: SitesConstants.REQUEST_DELETE_SITE,
    id
  };
};

// Site is deleted
const receiveSiteDeleted = (response) => {
  return {
    type: SitesConstants.RECEIVE_SITE_DELETED,
    id: response.id,
    receivedAt: Date.now()
  };
};

// Request save site
const requestSaveSite = (site) => {
  return {
    type: SitesConstants.REQUEST_SAVE_SITE,
    site
  };
};

// Site is saved
const receiveSiteSaved = (site) => {
  return {
    type: SitesConstants.RECEIVE_SITE_SAVED,
    site
  };
};

export default {
  ...generateEntitiesActions('sites'),
  requestDeleteSite,
  receiveSiteDeleted,
  requestSaveSite,
  receiveSiteSaved
};
