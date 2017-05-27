import fetch from 'isomorphic-fetch';
import { normalize } from 'normalizr';
import { generateEntitiesThunks, entitySchema, entitiesSchema } from '../utils/entities';
import { withAuth } from '../utils/utils';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';

// Tags Actions
import TagsActions from './tags.actions';

// Thunk to create new category containing tags
const createTags = (form) => {

  let tags = form.tags.map(tag =>{
    return {
      'name': { 'raw' : tag },
      'category': { 'raw' : form.category },
      'usageRights' : form.rights
    };
  });

  return function (dispatch) {

    const createTag = (tag) => {
      dispatch(TagsActions.requestSave(tag));

      let request = new Request('/api/tags', withAuth({
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tag)
      }));
      return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        const normalizedResponse = normalize(response, entitySchema);
        dispatch(TagsActions.saved(normalizedResponse));
      })
      .catch(error => {
        handleError(error, TagsActions.invalidSaveEntity(tag), dispatch);
      });
    };

    return Promise.all(
      tags.map(tag => createTag(tag))
    );

  };
};

// Thunk to get all tags used on a group:
// - from group itself
// - from containers and services
const fetchGroupTags = (groupId) => {
  return function (dispatch) {

    dispatch(TagsActions.requestAll());

    let request = new Request(`/api/groups/${groupId}/tags?containers=true&services=true`, withAuth({
      method: 'GET',
    }));
    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        const normalizedResponse = normalize(response, entitiesSchema);
        dispatch(TagsActions.receiveSome(normalizedResponse));
      })
      .catch(error => {
        handleError(error, TagsActions.invalidRequest, dispatch);
      });
  };
};

export default {
  ...generateEntitiesThunks('tags'),
  createTags,
  fetchGroupTags
};
