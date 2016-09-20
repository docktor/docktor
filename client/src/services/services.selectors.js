import { transformFilterToObject } from '../utils/utils.js';

export const getFilteredServices = (services, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(services);
  } else {
    return Object.values(services).filter(service => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key].toLowerCase();
        switch(key) {
          case 'text':
          case 'name':
          case 'title':
            match &= service.title.toLowerCase().indexOf(value) !== -1;
            return;
          case 'tags':
            const tags = service.tags || [];
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
