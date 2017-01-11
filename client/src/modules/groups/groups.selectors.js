import { transformFilterToObject } from '../utils/search';
import { containsWithoutAccents } from '../utils/strings';

export const getFilteredGroups = (groups, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(groups);
  } else {
    return Object.values(groups).filter(group => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key];
        switch(key) {
        case 'text':
          match &= containsWithoutAccents(JSON.stringify(Object.values(group)), value);
          return;
        case 'name':
        case 'title':
          match &= containsWithoutAccents(group.title, value);
          return;
        case 'tags':
          const tags = group.tags || [];
          match &= tags.filter(tag => containsWithoutAccents(tag, value)).length > 0;
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
