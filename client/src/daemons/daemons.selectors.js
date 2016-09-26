import { transformFilterToObject } from '../utils/search.js';
import { containsWithoutAccents } from '../utils/strings.js';

export const getFilteredDaemons = (daemons, sites, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(daemons);
  } else {
    return Object.values(daemons).filter(daemon => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key];
        switch(key) {
          case 'text':
          case 'name':
            match &= containsWithoutAccents(daemon.name, value);
            return;
          case 'site':
            const site = sites[daemon.site];
            match &= site && containsWithoutAccents(site.title, value);
            return;
          case 'tags':
            const tags = daemon.tags || [];
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
