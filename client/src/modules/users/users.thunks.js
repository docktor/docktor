import { normalize } from 'normalizr';
import { withAuth } from '../utils/utils';
import { generateEntitiesThunks, entitiesSchema } from '../utils/entities';
import UsersActions from './users.actions';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';

// Thunk to get all tags used on a group:
// - from group itself
// - from containers and services
const fetchGroupMembers = (groupId) => {
  return function (dispatch) {

    dispatch(UsersActions.requestAll());

    let request = new Request(`/api/groups/${groupId}/members`, withAuth({
      method: 'GET',
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        const normalizedResponse = normalize(response, entitiesSchema);
        dispatch(UsersActions.receiveSome(normalizedResponse));
      })
      .catch(error => {
        handleError(error, UsersActions.invalidRequest, dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('users'),
  fetchGroupMembers
};
