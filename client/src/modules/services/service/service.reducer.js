import ServiceConstants from './service.constants.js';

const initialState = {
  isFetching: false,
  didInvalidate: true,
  item: { volumes:[], variables:[] }
};

const serviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case ServiceConstants.INVALID_REQUEST_SERVICE:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: true
      });
    case ServiceConstants.REQUEST_SERVICE:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false,
        item: {}
      });
    case ServiceConstants.RECEIVE_SERVICE:
      return Object.assign({}, state, {
        isFetching: false,
        item: action.service
      });
    case ServiceConstants.REQUEST_SAVE_SERVICE:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      });
    case ServiceConstants.SERVICE_SAVED:
      let newServiceState = Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        item : action.service
      });
      return newServiceState;
    case ServiceConstants.NEW_SERVICE:
      return initialState;
    default:
      return state;
  }
};

export default serviceReducer;
