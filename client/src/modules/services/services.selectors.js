import { transformFilterToObject } from '../utils/search';
import { contains } from '../utils/search';

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
            match &= contains(JSON.stringify(Object.values(service)), value);
            return;
          case 'name':
          case 'title':
            match &= contains(service.title, value);
            return;
          case 'tags':
            const tags = service.tags || [];
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
