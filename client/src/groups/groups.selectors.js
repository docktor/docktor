import { transformFilterToObject } from '../utils/utils.js';

export const getFilteredGroups = (groups, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(groups);
  } else {
    return Object.values(groups).filter(group => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key].toLowerCase();
        switch(key) {
          case 'text':
          case 'name':
          case 'title':
            match &= group.title.toLowerCase().indexOf(value) !== -1;
            return;
          case 'tags':
            const tags = group.tags || [];
            match &= tags.filter(tag => tag.toLowerCase().indexOf(value) !== -1).length > 0;
            return;
          default:
            match = false;
            return;
        }
      });
      return match;
    });
  }
};
