//JS dependancies
import UUID from 'uuid-js'
import MD5 from 'md5'

//Actions
import { LOCATION_CHANGED } from '../actions/router.actions.js'
import { INVALID_REQUEST_SITES, requestDeleteSite } from '../actions/sites.actions.js'
import { CLOSE_NOTIFICATION, COMFIRM_DELETION } from '../actions/toasts.actions.js'

const initialState = {}

const toastsReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOCATION_CHANGED:
            return Object.assign({}, initialState)
            
        case INVALID_REQUEST_SITES:
            const invalidReqSitesToast= createInvalidReqSitesToast(state, action)
            return Object.assign({}, {...state}, invalidReqSitesToast)

        case COMFIRM_DELETION:
            const confirmDelToast = createConfirmDelToast(state, action)
            return Object.assign({}, {...state}, confirmDelToast)

        case CLOSE_NOTIFICATION:
            let resState = Object.assign({}, {...state})
            delete resState[action.id]
            return resState
            
        default:
            return state
    }
}

const createInvalidReqSitesToast = (state, action) => {
    let res = {}
    const uuid = UUID.create(4)
    res[uuid] = {
        title: "Error on Sites API",
        message: action.error,
        level: "error",
        position: "br",
        uid: uuid
    }
    return res
}

const createConfirmDelToast = (state, action) => {
    let res = {}
    const id = MD5(action.title)
    res[id] = {
        title: "Confirm Suppression",
        message: "Remove "+action.title+" ?",
        autoDismiss: 0,
        level: "error",
        position: "br",
        uid: id,
        action: {
            label: 'Remove',
            callback: action.callback
        }
    }
    return res
}

export default toastsReducer