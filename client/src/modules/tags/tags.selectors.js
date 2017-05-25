import { transformFilterToObject } from '../utils/search';
import { contains } from '../utils/search';

import groupBy from 'lodash.groupby';
import flatMap from 'lodash.flatmap';
import uniqBy from 'lodash.uniqby';
import sortBy from 'lodash.sortby';
import differenceBy from 'lodash.differenceby';

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
            match &= contains(JSON.stringify(Object.values(tag)), value);
            return;
          case 'name':
          case 'title':
            match &= contains(tag.name, value);
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

// Get tags ids from all type of structure containing tags
const getTagIdsFromEntities = (entities) => {
  return flatMap(entities, (entity) => entity.tags);
};

// Get tags ids from all containers instances
const getTagIdsFromContainers = (containers) => {
  return getTagIdsFromEntities(containers);
};

// Get tag ids from all containers (= services)
const getTagsIdsFromServices = (containers, services) => {
  const containerServices = containers.map(container => services.items[container.serviceId])
                                        .filter(service => Boolean(service));
  return getTagIdsFromEntities(containerServices);
};

// Get tag categories from containers and services
// Categories contain tag of this type of category
const getTagCategories = (containers, services, tags) => {
  // Get tag ids
  const containersTagsIds = getTagIdsFromContainers(containers);
  const containerServicesTagsIds = getTagsIdsFromServices(containers, services);
  // Merge, uniq and sort ids
  const allTagIds = containersTagsIds.concat(containerServicesTagsIds);
  const allTags = allTagIds.map(tagId => tags.items[tagId]).filter(tag => Boolean(tag));
  const uniqAllTags = uniqBy(allTags, 'id');
  const sortedAllTags = sortBy(uniqAllTags, 'name.slug');
  // Group the tags by category
  const categories = groupBy(sortedAllTags, (tag) => tag.category.slug);
  return categories;
};

const otherTag = {
  id: 'others',
  name: { raw: 'Others', slug: 'others' },
  category: { raw: 'Others', slug: 'others' }
};

// Get containers grouped by category
const getContainersGroupedByCategory = (tagsFromCategory, allContainers, services) => {
    // Iterate through all tags from given category
  const containersByTag = tagsFromCategory.map(tag => {
    // Keep only containers with given tag
    const containersWithTag = allContainers.filter(container => {
      const tags = container.tags || [];
      return tags.includes(tag.id);
    });
    // Keep only services with given tag
    const servicesWithTag = allContainers.map(container => services.items[container.serviceId])
                                          .filter(service => Boolean(service))
                                          .filter(service => service.tags.includes(tag.id));
    // Keep only containers of a type of service containing given tag
    const containersFromServicesWithTags = allContainers.filter(
      container => servicesWithTag.filter( service => service.id === container.serviceId).length > 0
    );

    // Keep unique containers for a given tag
    return {
      tag: tag,
      containers: uniqBy(containersWithTag.concat(containersFromServicesWithTags), 'id')
    };
  });

  const containersContainingTags = flatMap(containersByTag, (container) => container.containers);

  // Containers without tags are displayed in a 'Other' section
  const containersWithoutTags = differenceBy(allContainers, containersContainingTags, 'id');
  return containersByTag.concat({ tag : otherTag, containers: containersWithoutTags });
};

export default {
  getFilteredTags,
  availableCategories,
  getTagCategories,
  getContainersGroupedByCategory
};
