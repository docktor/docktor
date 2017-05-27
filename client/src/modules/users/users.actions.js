// import constants
import { generateEntitiesActions, generateEntitiesConstants } from '../utils/entities';

//=================================================
// Toasts constants
//=================================================

export const UsersConstants = {
  ...generateEntitiesConstants('users'),
  USER_LDAP_PROVIDER: 'LDAP',
  USER_LOCAL_PROVIDER: 'local',
};


//=================================================
// Toasts actions
//=================================================

export default {
  ...generateEntitiesActions('users'),
};
