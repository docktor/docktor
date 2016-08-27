// Request all groups
export const REQUEST_ALL_GROUPS = 'REQUEST_ALL_GROUPS';

export function requestAllGroups() {
  return {
    type: REQUEST_ALL_GROUPS
  };
}


// Groups are received
export const RECEIVE_GROUPS = 'RECEIVE_GROUPS';

export function receiveGroups(groups) {
  return {
    type: RECEIVE_GROUPS,
    groups,
    receivedAt: Date.now()
  };
}

// Groups API returns an Error
export const INVALID_REQUEST_GROUPS = 'INVALID_REQUEST_GROUPS';

export function invalidRequestGroups(error) {
  return {
    type: INVALID_REQUEST_GROUPS,
    error
  };
}
