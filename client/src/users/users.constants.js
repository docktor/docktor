import { generateEntitiesConstants } from '../utils/entities.js';

export const USER_LDAP_PROVIDER = 'LDAP';
export const USER_LOCAL_PROVIDER = 'local';

export default {
  ...generateEntitiesConstants('users'),
  REQUEST_SAVE_USER: 'REQUEST_SAVE_USER',
  RECEIVE_SAVED_USER: 'RECEIVE_SAVED_USER',
  INVALID_SAVE_USER: 'INVALID_SAVE_USER',
  CHANGE_FILTER: 'CHANGE_FILTER_USERS'
};
