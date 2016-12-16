import React from 'react';

import classNames from 'classnames';

class TagsSelector extends React.Component {

  constructor(props) {
    super(props);

    this.state = { tags: props.selectedTags || [] };
  }

  componentDidMount() {
    // FIXME: use a more specific selector
    $('.ui.dropdown').dropdown({
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
    // TODO: sorting
    const tags = this.props.tags;
    const loading = tags.isFetching || tags.didInvalidate;
    const classes = classNames('ui fluid multiple search selection dropdown', { loading });

    return (
      <div className={classes}>
        <input name='tags' type='hidden' defaultValue={this.props.selectedTags.join(',')} />
        <i className='dropdown icon'></i>
        <div className='default text'>{loading ? 'Loading tags…' : 'Tags'}</div>
        <div className='menu'>
          {
            loading || Object.values(tags.items).map(tag => (
            <div key={tag.id} className='item' data-value={tag.id}>
              {tag.category.raw} &mdash; {tag.name.raw}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

TagsSelector.propTypes = {
  tags: React.PropTypes.object,
  selectedTags: React.PropTypes.array
};

export default TagsSelector;
