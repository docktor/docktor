import { transformFilterToObject, contains } from '../utils/utils';

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
            const d = { ...daemon, site:sites[daemon.site] };
            match &= contains(JSON.stringify(Object.values(d)), value);
            return;
          case 'name':
          case 'title':
            match &= contains(daemon.name, value);
            return;
          case 'site':
            const site = sites[daemon.site];
            match &= site && contains(site.title, value);
            return;
          case 'tags':
            const tags = daemon.tags || [];
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

export const getDaemonsAsFSOptions = (daemons) => {
  return Object.values(daemons)
    .filter(daemon => Boolean(daemon.cadvisorApi))
    .map(daemon => {
      return { value: daemon.id, name: daemon.name };
    });
};
