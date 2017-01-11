import { transformFilterToObject } from '../utils/search';
import { containsWithoutAccents } from '../utils/strings';

const getFilteredTags = (tags, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(tags);
  } else {
    return Object.values(tags).filter(tag => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key];
        switch(key) {
        case 'text':
          match &= containsWithoutAccents(JSON.stringify(Object.values(tag)), value);
          return;
        case 'name':
        case 'title':
          match &= containsWithoutAccents(tag.name, value);
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

// Get the available categories in a generic format
// Removes duplicates
const availableCategories = (tags) => {
  var categories = {};
  var new_categories = [];

  tags.forEach( tag => {
    const category = tag.category;
    var cat = categories[category.slug] || { id: category.slug, value: category.raw };
    categories[category.slug] = cat;
  });


  Object.keys(categories).forEach(rawName => {
    new_categories.push(categories[rawName]);
  });

  return new_categories;
};

export default {
  getFilteredTags,
  availableCategories
};
