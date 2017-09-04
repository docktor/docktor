import { transformFilterToObject, contains } from '../utils/utils';



export const sortUsers = (u1, u2) => {
  let comp = 0;
  // if comp = -1 -> u1 will be displayed before u2
  // if comp = 1 -> u2 will be displayed before u1
  if (u1.role === 'admin' && (u2.role === 'supervisor' || u2.role === 'user')) {
    comp = -1;
  } else if (u1.role === 'supervisor' && u2.role === 'user') {
    comp = -1;
  } else if (u1.role === 'supervisor' && u2.role === 'admin') {
    comp = 1;
  } else if (u1.role === 'user' && (u2.role === 'admin' || u2.role === 'supervisor')) {
    comp = 1;
  }
  if (comp === 0) {
    // if users have the same roles, sort them by full name
    return `${u1.lastName} ${u1.firstName}`.localeCompare(`${u2.lastName} ${u2.firstName}`);
  }
  return comp;
};

export const getFilteredUsers = (users, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(users).sort(sortUsers);
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
    })
      .sort(sortUsers);
  }
};

export const getUsersAsOptions = (users) => {
  return Object.values(users).map(user => {
    return { value: user.id, name: user.displayName } ;
  });
};

