import { generateEntitiesConstants } from '../utils/entities';

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

export default {
  ...generateEntitiesConstants('groups'),
  CHANGE_FILTER: 'CHANGE_FILTER_GROUPS',
  REQUEST_GROUP : 'REQUEST_GROUP',
  RECEIVE_GROUP : 'RECEIVE_GROUP',
  REQUEST_SAVE_GROUP : 'REQUEST_SAVE_GROUP',
  GROUP_SAVED : 'GROUP_SAVED',
  REQUEST_DELETE_GROUP: 'REQUEST_DELETE_GROUP',
  GROUP_DELETED: 'GROUP_DELETED',
  INVALID_REQUEST_GROUP : 'INVALID_REQUEST_GROUP'
};
