// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import DebounceInput from 'react-debounce-input';

// API Fetching
import TagsThunks from '../../modules/tags/tags.thunks.js';
import TagsActions from '../../modules/tags/tags.actions.js';
import TagsSelectors from '../../modules/tags/tags.selectors.js';
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

  render() {
    const categories = this.props.categories;
    const fetching = this.props.isFetching;
    const filterValue = this.props.filterValue;
    const onAddTag = this.props.onCreate;
    const onDelete = this.props.onDelete;
    const onEdit = this.props.onEdit;
    const onChangeFilter = this.props.onChangeFilter;
    const availableUsageRights = this.usageRoles;
    const availableCategories = this.props.availableCategories;

    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal justified tags-bar'>
          <div className='ui left corner labeled icon input flex' >
            <div className='ui left corner label'><i className='search icon' /></div>
            <i className='remove link icon' onClick={() => onChangeFilter('')} />
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              placeholder='Search...'
              onChange={(event) => onChangeFilter(event.target.value)}
              value={filterValue}/>
          </div>
          <div className='flex-2 layout horizontal end-justified'>
            <a className='ui teal labeled icon button' onClick={() => onAddTag(availableUsageRights, availableCategories)}>
              <i className='plus icon' />New Tag
            </a>
          </div>
        </div>
        <Scrollbars className='flex ui dimmable'>
          <div className='flex layout horizontal wrap'>
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
  categories: React.PropTypes.array,
  availableCategories: React.PropTypes.array,
  filterValue: React.PropTypes.string,
  isFetching: React.PropTypes.bool,
  fetchTags: React.PropTypes.func.isRequired,
  onCreate: React.PropTypes.func.isRequired,
  onDelete: React.PropTypes.func.isRequired,
  onEdit: React.PropTypes.func.isRequired,
  onChangeFilter: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const filterValue = state.tags.filterValue ;
  const tags = Object.values(state.tags.items);
  const rawCategories = TagsSelectors.groupByCategory(tags);
  const categories = TagsSelectors.getFilteredTags(rawCategories, filterValue);
  const availableCategories = TagsSelectors.availableCategories(tags);
  const isFetching = state.tags.isFetching;
  return { categories, availableCategories, isFetching, filterValue };
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
    onChangeFilter: (filterValue) => dispatch(TagsActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const TagsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tags);

export default TagsPage;
