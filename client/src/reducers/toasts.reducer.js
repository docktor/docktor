import { INVALID_REQUEST_SITES } from '../actions/sites.actions.js'
import { CLOSE_NOTIFICATION } from '../actions/toasts.actions.js'

const initialState = {}
let toastCpt = 0

const toastsReducer = (state = initialState, action) => {
    switch (action.type) {
        case INVALID_REQUEST_SITES:
            let res = {}
            res[toastCpt] = {
                title: "Error on Sites API",
                message: action.error,
                level: "error",
                position: "br",
                uid: toastCpt++
            }
            return Object.assign({}, state, res)
            
        case CLOSE_NOTIFICATION:
            let resState = Object.assign({}, state)
            delete resState[action.id]
            return resState
        default:
            return state
    }
}

export default toastsReducer