import { generateEntitiesConstants } from '../utils/entities.js';

export default {
  ...generateEntitiesConstants('sites'),
  REQUEST_DELETE_SITE: 'REQUEST_DELETE_SITE',
  RECEIVE_SITE_DELETED: 'RECEIVE_SITE_DELETED',
  REQUEST_SAVE_SITE: 'REQUEST_SAVE_SITE',
  RECEIVE_SITE_SAVED: 'RECEIVE_SITE_SAVED'
};
