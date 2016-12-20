// import constants
import TagsConstants from './tags.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

const createRequestCreateTag = () => {
  return {
    isFetching: true,
    didInvalidate: false
  };
};

const createRequestDeleteTag = (state, action) => {
  if (action.tag.id !== -1) {
    let newItem = { ...state.items[action.tag.id] };
    let newItems = { ...state.items };
    newItem.isDeleting = true;
    newItem.errorMessage = '';
    newItems[action.tag.id] = newItem;
    return {
      items: newItems
    };
  }
  return {};
};

const createReceiveDeletedTag = (state, action) => {
  let { [action.tag.id] : omit,  ...newItems } = state.items;
  return {
    items: newItems
  };
};

const createInvalidDeleteTag = (state, action) => {
  if (action.tag.id !== -1) {
    let newItem = { ...state.items[action.tag.id] };
    newItem.isDeleting = false;
    newItem.errorMessage = action.error;

    state.items[action.tag.id] = newItem;
    return {
      items: state.items
    };
  }
  return {};
};

const tagsReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'tags');
  switch (action.type) {
  case TagsConstants.REQUEST_CREATE_TAG:
    return { ...entitiesState, ...createRequestCreateTag() };
  case TagsConstants.RECEIVE_TAG_CREATED:
    let newTagsState = {
      ...entitiesState,
      items: { ...entitiesState.items },
      isFetching: false
    };
    newTagsState.items[action.tag.id] = action.tag;
    return newTagsState;
  case TagsConstants.CREATE_TAG_INVALID:
    let failTagsState = {
      ...entitiesState,
      isFetching: false,
      didInvalidate: true
    };
    return failTagsState;
  case TagsConstants.REQUEST_DELETE_TAG:
    return Object.assign({}, entitiesState, createRequestDeleteTag(state, action));
  case TagsConstants.RECEIVE_TAG_DELETED:
    return Object.assign({}, entitiesState, createReceiveDeletedTag(state, action) );
  case TagsConstants.DELETE_TAG_INVALID:
    return Object.assign({}, entitiesState, createInvalidDeleteTag(state, action) );
  default:
    return entitiesState;
  }
};

export default tagsReducer;
