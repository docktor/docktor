// import constants
import ModalConstants from './modal.constants.js';

const initialState = {
    isVisible: false,
    form: { lines: [], hidden: [] }
};

const modalReducer = (state = initialState, action) => {
    switch (action.type) {
        case ModalConstants.CLOSE_MODAL:
            return Object.assign({}, initialState);

        case ModalConstants.OPEN_MODAL:
            return Object.assign({}, initModal(action));

        default:
            return state;
    }
};

const initModal = (action) => {
    let res = {};
    res.isVisible = true;
    res.title = action.title;
    res.form = action.form;
    res.callback = action.callback;
    return res;
};

export default modalReducer;
