// React
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import { Input, Button, Dimmer, Loader, Label, Icon } from 'semantic-ui-react';
import DebounceInput from 'react-debounce-input';

// Thunks / Actions
import GroupsThunks from '../../modules/groups/groups.thunks';
import GroupsActions from '../../modules/groups/groups.actions';

// Components
import GroupCard from './group/group.card.component';

// Selectors
import { getFilteredGroups } from '../../modules/groups/groups.selectors';

// Style
import './groups.page.scss';

// Groups Component
class Groups extends React.Component {

  componentWillMount = () => {
    this.props.fetchGroups();
  }

  render = () => {
    const { groups, filterValue, isFetching, changeFilter } = this.props;
    return (
      <div className='flex layout vertical start-justified groups-page'>
        <div className='layout horizontal justified groups-bar'>
          <Input icon labelPosition='left corner' className='flex'>
            <Label corner='left' icon='search' />
            <DebounceInput
              placeholder='Search...'
              minLength={1}
              debounceTimeout={300}
              onChange={(event) => changeFilter(event.target.value)}
              value={filterValue}
            />
            <Icon link name='remove' onClick={() => changeFilter('')}/>
          </Input>
          <div className='flex-2 layout horizontal end-justified'>
            <Button as={Link} color='teal' content='New Group' labelPosition='left' icon='plus' to={'/groups/new'} />
          </div>
        </div>
        <Scrollbars autoHide className='flex'>
          <div className='flex layout horizontal center-center groups-list wrap'>
              {isFetching && <Dimmer active><Loader size='large' content='Fetching'/></Dimmer>}
              {groups.map(group => {
                return (
                  <GroupCard group={group} key={group.id} />
                );
              })}
          </div>
        </Scrollbars>
      </div>
    );
  }
}
Groups.propTypes = {
  groups: PropTypes.array,
  filterValue: PropTypes.string,
  isFetching: PropTypes.bool,
  fetchGroups: PropTypes.func.isRequired,
  changeFilter: PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToGroupsProps = (state) => {
  const filterValue = state.groups.filterValue;
  const groups = getFilteredGroups(state.groups.items, filterValue);
  const isFetching = state.groups.isFetching;
  return { filterValue, groups, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToGroupsProps = (dispatch) => {
  return {
    fetchGroups : () => {
      dispatch(GroupsThunks.fetchIfNeeded());
    },
    changeFilter: (filterValue) => dispatch(GroupsActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const GroupsPage = connect(
  mapStateToGroupsProps,
  mapDispatchToGroupsProps
)(Groups);

export default GroupsPage;
