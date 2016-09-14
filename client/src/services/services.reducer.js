// import constants
import ServicesConstants from './services.constants.js';

const initialState = {
    isFetching: false,
    didInvalidate: true,
    items: {}
};

const createRequestAllServices  = () => {
    return {
        isFetching: true,
        didInvalidate: false
    };
};

const createReceiveServices  = (action) => {
    let services = {};
    action.services.forEach(service => services[service.id] = service);
    return {
        isFetching: false,
        didInvalidate: false,
        items: services,
        lastUpdated: action.receivedAt
    };
};

const servicesReducer = (state = initialState, action) => {
    switch (action.type) {
        case ServicesConstants.INVALID_REQUEST_SERVICES:
            return Object.assign({}, initialState);
        case ServicesConstants.REQUEST_ALL_SERVICES:
            return Object.assign({}, state, createRequestAllServices());
        case ServicesConstants.RECEIVE_SERVICES:
            return Object.assign({}, state, createReceiveServices(action));
        default:
            return state;
    }
};

export default servicesReducer;
