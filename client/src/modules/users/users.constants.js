import { generateEntitiesConstants } from '../utils/entities';

export default {
  ...generateEntitiesConstants('users'),
  CHANGE_FILTER: 'CHANGE_FILTER_USERS',
  USER_LDAP_PROVIDER: 'LDAP',
  USER_LOCAL_PROVIDER: 'local',
};
