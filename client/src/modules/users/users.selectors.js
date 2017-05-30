import { transformFilterToObject, contains } from '../utils/utils';

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
            match &= contains(JSON.stringify(Object.values(user)), value);
            return;
          case 'name':
          case 'title':
            match &= contains(user.displayName, value);
            return;
          case 'username':
            match &= contains(user.username, value);
            return;
          case 'provider':
            match &= contains(user.provider, value);
            return;
          case 'role':
            match &= contains(user.role, value);
            return;
          case 'tags':
            const tags = user.tags || [];
            match &= tags.filter(tag => contains(tag, value)).length > 0;
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

export const getUsersAsOptions = (users) => {
  return Object.values(users).map(user => {
    return { value: user.id, name: user.displayName } ;
  });
};

