import { generateEntitiesThunks } from '../utils/entities';


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
        dispatch(UsersActions.received(response));
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
