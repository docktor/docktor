// import constants
import GroupsConstants from './groups.constants.js';

const initialState = {
    isFetching: false,
    didInvalidate: true,
    items: {}
};

const createRequestAllGroups  = () => {
    return {
        isFetching: true,
        didInvalidate: false
    };
};

const createReceiveGroups  = (action) => {
    let groups = {};
    action.groups.forEach(group => groups[group.id] = group);
    return {
        isFetching: false,
        didInvalidate: false,
        items: groups,
        lastUpdated: action.receivedAt
    };
};

const groupsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GroupsConstants.INVALID_REQUEST_GROUPS:
            return Object.assign({}, initialState);
        case GroupsConstants.REQUEST_ALL_GROUPS:
            return Object.assign({}, state, createRequestAllGroups());
        case GroupsConstants.RECEIVE_GROUPS:
            return Object.assign({}, state, createReceiveGroups(action));
        default:
            return state;
    }
};

export default groupsReducer;
