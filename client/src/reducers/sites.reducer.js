import {
    REQUEST_SITES, INVALID_REQUEST_SITES,
    RECEIVE_SITES
} from '../actions/sites.actions.js'

const initialState = {
    isFetching: false,
    didInvalidate: true,
    items: []
}

const sitesReducer = (state = initialState, action) => {
    switch (action.type) {
        case INVALID_REQUEST_SITES:
            return Object.assign({}, state, {
                didInvalidate: true
            })
        case REQUEST_SITES:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            })
        case RECEIVE_SITES:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.sites,
                lastUpdated: action.receivedAt
            })
        default:
            return state
    }
}

export default sitesReducer