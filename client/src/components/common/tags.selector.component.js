import React from 'react';

import classNames from 'classnames';
import groupBy from 'lodash.groupby';
import sortBy from 'lodash.sortby';

class TagsSelector extends React.Component {

  constructor(props) {
    super(props);

    this.state = { tags: props.selectedTags || [] };
  }

  componentDidMount() {
    $(`.${this.props.tagsSelectorId}.ui.dropdown`).dropdown({
      forceSelection: false,
      onAdd: this.onAddTag.bind(this),
      onRemove: this.onRemoveTag.bind(this)
    });
  }

  onAddTag(addedValue) {
    const state = {
      ...this.state,
      tags: [...this.state.tags, addedValue]
    };
    this.setState(state);
  }

  onRemoveTag(removedValue) {
    const state = {
      ...this.state,
      tags: this.state.tags.filter(tag => tag !== removedValue)
    };
    this.setState(state);
  }

  // TODO: add isFormValid method

  render() {
    const { tags, selectedTags, tagsSelectorId } = this.props;

    // Create an object indexing the tags by their category
    // This allows to easily add a divider with the name of the category in the dropdown
    const tagsItems = Object.values(tags.items) || [];
    const sortedTagsItems = sortBy(tagsItems, t => t.name.raw);
    const groupedTagItems = groupBy(sortedTagsItems, (t => t.category.raw));

    const dropdownItems = [];
    Object.keys(groupedTagItems).forEach(category => {
      dropdownItems.push(
        <div key={category} className='ui horizontal divider'>
          {category}
        </div>
      );

      groupedTagItems[category].forEach(tag => {
        dropdownItems.push(
          <div key={tag.id} className='item' data-value={tag.id}>
            {tag.name.raw}
          </div>
        );
      });
    });

    const loading = tags.isFetching || tags.didInvalidate;
    const classes = classNames('ui fluid multiple search selection dropdown optgroup', tagsSelectorId, { loading });

    return (
      <div className={classes}>
        <input name='tags' type='hidden' defaultValue={selectedTags.join(',')} />
        <i className='dropdown icon'></i>
        <div className='default text'>{loading ? 'Loading tags…' : 'Tags'}</div>
        <div className='menu'>
          {loading || dropdownItems}
        </div>
      </div>
    );
  }
}

TagsSelector.propTypes = {
  tagsSelectorId: React.PropTypes.string.isRequired,
  tags: React.PropTypes.object,
  selectedTags: React.PropTypes.array
};

export default TagsSelector;
