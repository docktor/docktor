// import constants
import TagsConstants from './tags.constants';
import { generateEntitiesActions } from '../utils/entities';

// Change filter
const changeFilter = (filterValue) => {
  return {
    type: TagsConstants.CHANGE_FILTER,
    filterValue
  };
};

export default {
  ...generateEntitiesActions('tags'),
  changeFilter
};
