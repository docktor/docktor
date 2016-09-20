import { transformFilterToObject } from '../utils/utils.js';

export const getFilteredUsers = (users, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(users);
  } else {
    return Object.values(users).filter(user => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key].toLowerCase();
        switch(key) {
          case 'text':
          case 'name':
          case 'title':
            match &= user.displayName.toLowerCase().indexOf(value) !== -1;
            return;
          case 'username':
            match &= user.username.toLowerCase().indexOf(value) !== -1;
            return;
          case 'provider':
            match &= user.provider.toLowerCase().indexOf(value) !== -1;
            return;
          case 'role':
            match &= user.role.toLowerCase().indexOf(value) !== -1;
            return;
          case 'tags':
            const tags = user.tags || [];
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
