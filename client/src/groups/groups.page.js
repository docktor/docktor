// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';

// Thunks / Actions
import GroupsThunks from './groups.thunks.js';
import GroupsActions from './groups.actions.js';

// Components
import GroupCard from './group.card.component.js';

// Selectors
import { getFilteredGroups } from './groups.selectors.js';

// Style
import './groups.page.scss';

// Groups Component
class Groups extends React.Component {

  componentWillMount() {
    this.props.fetchGroups();
  }

  render() {
    const groups = this.props.groups;
    const filterValue = this.props.filterValue;
    const fetching = this.props.isFetching;
    const changeFilter = this.props.changeFilter;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal center-center groups-bar'>
          <div className='ui icon input'>
            <i className='search icon'></i>
            <input type='text' placeholder='Search...' onChange={(event) => changeFilter(event.target.value)} defaultValue={filterValue}/>
          </div>
          <div className='flex'></div>
        </div>
        <Scrollbars className='flex ui dimmable'>
          <div className='flex layout horizontal center-center groups-list wrap'>
              {(fetching => {
                if (fetching) {
                  return (
                      <div className='ui active inverted dimmer'>
                        <div className='ui text loader'>Fetching</div>
                      </div>
                  );
                }
              })(fetching)}
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
  groups: React.PropTypes.array,
  filterValue: React.PropTypes.string,
  isFetching: React.PropTypes.bool,
  fetchGroups: React.PropTypes.func.isRequired,
  changeFilter: React.PropTypes.func.isRequired
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
