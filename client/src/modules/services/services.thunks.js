import { withAuth } from '../utils/utils';
import ServicesActions from './services.actions';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';
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
        dispatch(ServicesActions.receiveSome(response));
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
