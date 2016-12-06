import { transformFilterToObject } from '../utils/search.js';
import { containsWithoutAccents } from '../utils/strings.js';

export const getFilteredUsers = (users, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(users);
  } else {
    return Object.values(users).filter(user => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key];
        switch(key) {
          case 'text':
            match &= containsWithoutAccents(JSON.stringify(Object.values(user)), value);
            return;
          case 'name':
          case 'title':
            match &= containsWithoutAccents(user.displayName, value);
            return;
          case 'username':
            match &= containsWithoutAccents(user.username, value);
            return;
          case 'provider':
            match &= containsWithoutAccents(user.provider, value);
            return;
          case 'role':
            match &= containsWithoutAccents(user.role, value);
            return;
          case 'tags':
            const tags = user.tags || [];
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
