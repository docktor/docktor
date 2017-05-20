import { generateEntitiesConstants } from '../utils/entities';

export default {
  ...generateEntitiesConstants('users'),
  USER_LDAP_PROVIDER: 'LDAP',
  USER_LOCAL_PROVIDER: 'local',
};
