import { generateEntitiesThunks } from '../utils/entities';

// Thunk to get all daemons used on a group:
const fetchGroupServices = (groupId) => {
  return function (dispatch) {

    dispatch(ServicesActions.requestAll());

    let request = new Request(`/api/groups/${groupId}/services`, withAuth({
      method: 'GET',
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(ServicesActions.received(response));
      })
      .catch(error => {
        handleError(error, ServicesActions.invalidRequest, dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('services'),
  fetchGroupServices
};
