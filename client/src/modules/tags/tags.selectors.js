import { transformFilterToObject } from '../utils/search.js';
import { containsWithoutAccents } from '../utils/strings.js';

const getFilteredTags = (tagsByCategory, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(tagsByCategory);
  } else {
    return Object.values(tagsByCategory).filter(category => {
      let match = true;
      const query = transformFilterToObject(filterValue);
      Object.keys(query).forEach(key => {
        const value = query[key];
        switch(key) {
        case 'text':
          match &= containsWithoutAccents(JSON.stringify(Object.values(category)), value);
          return;
        case 'name':
        case 'title':
          match &= containsWithoutAccents(category.slug, value);
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

// Group by the tags by category
const groupByCategory = (tags) => {
  var categories = {};
  var new_categories = [];

  for (var i in tags) {
    const tag = tags[i];
    const category = tag.category;
    var cat = categories[category.slug] || { raw: category.raw, slug: category.slug, tags: [] };
    cat.tags.push(tag);
    categories[category.slug] = cat;
  }

  for (i in categories) {
    new_categories.push(categories[i]);
  }

  return new_categories;
};

  // Get the available categories in a generic format
  // Removes duplicates
const availableCategories = (tags) => {
  var categories = {};
  var new_categories = [];

  for (var i in tags) {
    const tag = tags[i];
    const category = tag.category;
    var cat = categories[category.slug] || { id: category.slug, value: category.raw };
    categories[category.slug] = cat;
  }

  for (i in categories) {
    new_categories.push(categories[i]);
  }

  return new_categories;
};

export default {
  getFilteredTags,
  groupByCategory,
  availableCategories
};
