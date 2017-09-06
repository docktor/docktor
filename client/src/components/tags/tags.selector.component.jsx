import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Divider } from 'semantic-ui-react';

import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';

class TagsSelector extends React.Component {

  // TODO: add isFormValid method

  render = () => {
    const { tags, selectedTags, onChange } = this.props;

    // Create an object indexing the tags by their category
    // This allows to easily add a divider with the name of the category in the dropdown
    const tagsItems = Object.values(tags.items) || [];
    const sortedTagsItems = sortBy(tagsItems, t => t.name.raw);
    const groupedTagItems = groupBy(sortedTagsItems, (t => t.category.raw));

    const dropdownItems = [];
    Object.keys(groupedTagItems).forEach(category => {
      dropdownItems.push({ value: category, content:<Divider horizontal>{category}</Divider>, disabled: true, className:'dropdown-divider' });
      groupedTagItems[category].forEach(tag => {
        dropdownItems.push({ key:tag.id, value:tag.id, text:tag.name.raw });
      });
    });
    const loading = tags.isFetching;
    return (
      <Dropdown placeholder={loading ? 'Loading tags…' : 'Tags'} name='tags' loading={loading} value={selectedTags} options={dropdownItems}
        multiple search fluid className='fluid multiple search selection dropdown optgroup' selection onChange={onChange}
      />
    );
  }
}

TagsSelector.propTypes = {
  tags: PropTypes.object,
  selectedTags: PropTypes.array,
  onChange: PropTypes.func
};

export default TagsSelector;
