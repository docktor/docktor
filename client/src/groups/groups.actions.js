// import constants
import GroupsConstants from './groups.constants.js';

// Request all groups
export function requestAllGroups() {
  return {
    type: GroupsConstants.REQUEST_ALL_GROUPS
  };
}


// Groups are received
export function receiveGroups(groups) {
  return {
    type: GroupsConstants.RECEIVE_GROUPS,
    groups,
    receivedAt: Date.now()
  };
}

// Groups API returns an Error
export function invalidRequestGroups(error) {
  return {
    type: GroupsConstants.INVALID_REQUEST_GROUPS,
    error
  };
}
