// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Input, Button, Dimmer, Loader, Label, Icon } from 'semantic-ui-react';
import DebounceInput from 'react-debounce-input';

// Roles
import { ALL_ROLES, getRoleData } from '../../modules/auth/auth.constants';

// API Fetching
import TagsThunks from '../../modules/tags/tags.thunks';
import TagsActions from '../../modules/tags/tags.actions';
import TagsSelectors from '../../modules/tags/tags.selectors';
import ModalActions from '../../modules/modal/modal.actions';
import ToastsActions from '../../modules/toasts/toasts.actions';

import CategoryCard from './category/category.card';

import './tags.page.scss';

//Tags Component
class Tags extends React.Component {

  usageRoles = ALL_ROLES.map(role => {
    return {
      id: role,
      ...getRoleData(role)
    };
  })

  componentWillMount = () => {
    this.props.fetchTags();
  }

  render = () => {
    const { isFetching, filterValue, tags, availableCategories } = this.props;
    const { onCreate, onEdit, onDelete, onChangeFilter } = this.props;
    const availableUsageRights = this.usageRoles;

    return (
      <div className='flex layout vertical start-justified tags-page'>
        <div className='layout horizontal justified tags-bar'>
          <Input icon labelPosition='left corner' className='flex'>
            <Label corner='left' icon='search' />
            <DebounceInput
              placeholder='Search...'
              minLength={1}
              debounceTimeout={300}
              onChange={(event) => onChangeFilter(event.target.value)}
              value={filterValue}
            />
            <Icon link name='remove' onClick={() => changeFilter('')}/>
          </Input>
          <div className='flex-2 layout horizontal end-justified'>
            <Button color='teal' content='New Tags' labelPosition='left' icon='plus'
              onClick={() => onCreate(availableUsageRights, availableCategories)}
            />
          </div>
        </div>
        <Scrollbars autoHide className='flex ui dimmable'>
          <div className='flex layout horizontal wrap'>
            {isFetching && <Dimmer active><Loader size='large' content='Fetching'/></Dimmer>}
            {availableCategories.map(cat => {
              return (
                <CategoryCard
                  category={cat}
                  tags={tags.filter(tag => tag.category.slug === cat.id)}
                  key={cat.id}
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
  const tags = TagsSelectors.getFilteredTags(state.tags.items, filterValue);
  const availableCategories = TagsSelectors.availableCategories(tags);
  const isFetching = state.tags.isFetching;
  return { tags, availableCategories, isFetching, filterValue };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchTags: () => {
      dispatch(TagsThunks.fetchIfNeeded());
    },
    onCreate: (availableRights, availableCategories) => {
      const callback = (tagForm) => dispatch(TagsThunks.createTags(tagForm));
      dispatch(ModalActions.openNewTagsModal(availableRights, availableCategories, callback));
    },
    onDelete: (tag) => {
      dispatch(TagsThunks.delete(tag));
    },
    onEdit: (tag, availableRights, availableCategories) => {
      const callback = (tagForm) => {
        tagForm.name = { raw: tagForm.name };
        tagForm.category = { raw: tagForm.category };
        tagForm.usageRights = tagForm.rights;
        dispatch(TagsThunks.save(tagForm, null, ToastsActions.confirmSave(`Tag "${tagForm.name.raw}"`)));
      };
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
