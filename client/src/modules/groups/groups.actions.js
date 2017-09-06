// import constants
import { generateEntitiesActions, generateEntitiesConstants } from '../utils/entities';

//=================================================
// Groups constants
//=================================================

export const GROUP_MEMBER_ROLE = 'member';
export const GROUP_MODERATOR_ROLE = 'moderator';
export const ALL_GROUP_ROLES = [GROUP_MEMBER_ROLE, GROUP_MODERATOR_ROLE];

export const getGroupRoleLabel = role => {
  switch (role) {
    case GROUP_MEMBER_ROLE:
      return 'Member';
    case GROUP_MODERATOR_ROLE:
      return 'Moderator';
    default:
      return 'Unknown';
  }
};

export const getGroupRoleColor = role => {
  switch (role) {
    case GROUP_MEMBER_ROLE:
      return '';
    case GROUP_MODERATOR_ROLE:
      return 'teal';
    default:
      return 'red'; // aggressive color because it should not happen
  }
};

export const getGroupRoleIcon = role => {
  switch (role) {
    case GROUP_MEMBER_ROLE:
      return 'lock';
    case GROUP_MODERATOR_ROLE:
      return 'unlock';
    default:
      return 'warning sign';
  }
};

export const getGroupRoleData = role => {
  return{
    'value': role,
    'name': getGroupRoleLabel(role),
    'color': getGroupRoleColor(role),
    'icon': getGroupRoleIcon(role)
  };
};

export const GroupsConstants = {
  ...generateEntitiesConstants('groups'),
};

//=================================================
// Groups actions
//=================================================

export default {
  ...generateEntitiesActions('groups'),
};
