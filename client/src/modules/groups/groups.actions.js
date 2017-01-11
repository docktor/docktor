// import constants
import GroupsConstants from './groups.constants';
import { generateEntitiesActions } from '../utils/entities';

// Change filter
const changeFilter = (filterValue) => {
  return {
    type: GroupsConstants.CHANGE_FILTER,
    filterValue
  };
};

// Request a groups
const requestGroup = (id) => {
  return {
    type: GroupsConstants.REQUEST_GROUP,
    id
  };
};

// group is received
const receiveGroup = (group) => {
  return {
    type: GroupsConstants.RECEIVE_GROUP,
    group
  };
};

// Request to save a group
const requestSaveGroup = (group) => {
  return {
    type: GroupsConstants.REQUEST_SAVE_GROUP,
    group
  };
};

// group is saved
const groupSaved = (group) => {
  return {
    type: GroupsConstants.GROUP_SAVED,
    group
  };
};

// Request site deletion
const requestDeleteGroup = (id) => {
  return {
    type: GroupsConstants.REQUEST_DELETE_GROUP,
    id
  };
};

// group is deleted
const groupDeleted = (response) => {
  return {
    type: GroupsConstants.GROUP_DELETED,
    id: response,
    receivedAt: Date.now()
  };
};


// group API returns an Error
const invalidRequestGroup = (error) => {
  return {
    type: GroupsConstants.INVALID_REQUEST_GROUP,
    error
  };
};

export default {
  ...generateEntitiesActions('groups'),
  changeFilter,
  requestGroup,
  receiveGroup,
  requestSaveGroup,
  groupSaved,
  requestDeleteGroup,
  groupDeleted,
  invalidRequestGroup
};
