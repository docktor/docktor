import { transformFilterToObject } from '../utils/utils.js';

export const getFilteredDaemons = (daemons, sites, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(daemons);
  } else {
    return Object.values(daemons).filter(daemon => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key].toLowerCase();
        switch(key) {
          case 'text':
          case 'name':
            match &= daemon.name.toLowerCase().indexOf(value) !== -1;
            return;
          case 'site':
            const site = sites[daemon.site];
            match &= site && site.title.toLowerCase().indexOf(value) !== -1;
            return;
          case 'tags':
            const tags = daemon.tags || [];
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
