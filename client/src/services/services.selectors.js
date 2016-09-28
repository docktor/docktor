import { transformFilterToObject } from '../utils/search.js';
import { containsWithoutAccents } from '../utils/strings.js';

export const getFilteredServices = (services, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(services);
  } else {
    return Object.values(services).filter(service => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key];
        switch(key) {
          case 'text':
            match &= containsWithoutAccents(JSON.stringify(Object.values(service)), value);
            return;
          case 'name':
          case 'title':
            match &= containsWithoutAccents(service.title, value);
            return;
          case 'tags':
            const tags = service.tags || [];
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
