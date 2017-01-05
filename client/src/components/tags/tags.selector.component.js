import React from 'react';
import { Dropdown, Divider } from 'semantic-ui-react';

import classNames from 'classnames';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';

class TagsSelector extends React.Component {

  state = { tags: [] };

  componentWillMount = () => {
    this.setState({ tags: this.props.selectedTags });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ tags: nextProps.selectedTags });
  }

  handleChange = (e, { name, value }) => {
    const state = { tags:[...value] };
    this.setState(state);
  }

  // TODO: add isFormValid method

  render = () => {
    const { tags, selectedTags, tagsSelectorId } = this.props;

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
    const loading = tags.isFetching || tags.didInvalidate;
    return (
      <Dropdown placeholder={loading ? 'Loading tags…' : 'Tags'} loading={loading} value={this.state.tags} options={dropdownItems}
        multiple search fluid className='fluid multiple search selection dropdown optgroup' selection onChange={this.handleChange}
      />
    );
  }
}

TagsSelector.propTypes = {
  tagsSelectorId: React.PropTypes.string.isRequired,
  tags: React.PropTypes.object,
  selectedTags: React.PropTypes.array
};

export default TagsSelector;
