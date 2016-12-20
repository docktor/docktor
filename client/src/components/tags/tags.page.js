// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import DebounceInput from 'react-debounce-input';

// API Fetching
import TagsThunks from '../../modules/tags/tags.thunks.js';
import TagsActions from '../../modules/tags/tags.actions.js';
import ModalActions from '../../modules/modal/modal.actions.js';

import CategoryCard from './category/category.card.js';

import './tags.page.scss';

//Tags Component
class Tags extends React.Component {

  constructor() {
    super();

    // Formatter and editor for usage rights dropdown
    this.usageRoles = [
      { id: 'admin', value: 'Admin' },
      { id: 'supervisor', value: 'Supervisor' },
      { id: 'user', value: 'User' }
    ];
  }

  componentWillMount() {
    this.props.fetchTags();
  }

  // Group by the tags by category
  groupByCategory() {
    const tags = this.props.tags;
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
  }

  // Get the available categories in a generic format
  // Removes duplicates
  availableCategories() {
    const tags = this.props.tags;
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
  }

  render() {
    const tags = this.props.tags;
    const fetching = this.props.isFetching;
    const onAddTag = this.props.onCreate;
    const onDelete = this.props.onDelete;
    const onEdit = this.props.onEdit;
    const availableUsageRights = this.usageRoles;
    const categories = this.groupByCategory();
    const availableCategories = this.availableCategories();
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal justified tags-bar'>
          <div className='ui left corner labeled icon input flex' >
            <div className='ui left corner label'><i className='search icon'></i></div>
            <i className='remove link icon'></i>
          </div>
          <div className='flex-2 layout horizontal end-justified'>
            <a className='ui teal labeled icon button' onClick={() => onAddTag(availableUsageRights, availableCategories)}>
              <i className='plus icon'></i>New Tag
            </a>
          </div>
        </div>
        <Scrollbars className='flex ui dimmable'>
          <div className='flex layout horizontal center-center wrap'>
            {(fetching => {
              if (fetching) {
                return (
                  <div className='ui active inverted dimmer'>
                    <div className='ui text loader'>Fetching</div>
                  </div>
                );
              }
            })(fetching)}
            {categories.map(cat => {
              return (
                <CategoryCard
                category={cat}
                key={cat.slug}
                onDelete={(tag) => onDelete(tag)}
                onEdit={(tag) => onEdit(tag, availableUsageRights, availableCategories)} />
              );
            })}
          </div>
        </Scrollbars>
      </div >
    );

  }
}
Tags.propTypes = {
  tags: React.PropTypes.array,
  isFetching: React.PropTypes.bool,
  fetchTags: React.PropTypes.func.isRequired,
  onCreate: React.PropTypes.func.isRequired,
  onDelete: React.PropTypes.func.isRequired,
  onEdit: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const tags = Object.values(state.tags.items);
  const isFetching = state.tags.isFetching;
  return { tags, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchTags: () => {
      dispatch(TagsThunks.fetchIfNeeded());
    },
    onCreate: (availableRights, availableCategories) => {
      const callback = (tagForm) => dispatch(TagsThunks.createTag(tagForm));
      dispatch(ModalActions.openNewTagModal(availableRights, availableCategories, callback));
    },
    onDelete: (tag) => {
      dispatch(TagsThunks.deleteTag(tag));
    },
    onEdit: (tag, availableRights, availableCategories) => {
      const callback = (tagForm) => dispatch(TagsThunks.saveTag(tagForm));
      dispatch(ModalActions.openEditTagModal(tag, availableRights, availableCategories, callback));
    },
  };
};

// Redux container to Sites component
const TagsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tags);

export default TagsPage;
