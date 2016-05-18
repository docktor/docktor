import { CLOSE_MODAL, OPEN_MODAL } from '../actions/modal.actions.js'

const initialState = {
    isVisible: false,
    form: { lines: [], hidden: [] }
}

const modalReducer = (state = initialState, action) => {
    switch (action.type) {
        case CLOSE_MODAL:
            return Object.assign({}, initialState)
            
        case OPEN_MODAL:
            return Object.assign({}, initModal(action))
            
        default:
            return state
    }
}

const initModal = (action) => {
    let res = {}
    res.isVisible = true
    res.title = action.title
    res.form = action.form
    res.callback = action.callback
    return res
}

export default modalReducer