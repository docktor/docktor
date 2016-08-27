import {
    INVALID_REQUEST_SERVICES,
    REQUEST_ALL_SERVICES,
    RECEIVE_SERVICES
} from './services.actions.js';

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
    action.services.forEach(service => services[service.ID] = service);
    return {
        isFetching: false,
        didInvalidate: false,
        items: services,
        lastUpdated: action.receivedAt
    };
};

const servicesReducer = (state = initialState, action) => {
    switch (action.type) {
        case INVALID_REQUEST_SERVICES:
            return Object.assign({}, initialState);
        case REQUEST_ALL_SERVICES:
            return Object.assign({}, state, createRequestAllServices());
        case RECEIVE_SERVICES:
            return Object.assign({}, state, createReceiveServices(action));
        default:
            return state;
    }
};

export default servicesReducer;
