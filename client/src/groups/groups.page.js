// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';

// API Fetching
import { fetchGroupsIfNeeded } from './groups.thunks.js';

// Components
import GroupCard from './group.card.component.js';

// Style
import './groups.page.scss';

//Site Component using react-leaflet
class Groups extends React.Component {

  componentWillMount() {
    this.props.fetchGroups();
  }

  render() {
    const groups = Object.values(this.props.groups.items);
    const fetching = this.props.groups.isFetching;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal center-center groups-bar'>
          <div className='ui icon input'>
            <i className='search icon'></i>
            <input type='text' placeholder='Search...'/>
          </div>
          <div className='flex'></div>
        </div>
        <Scrollbars className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified groups-list wrap'>
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
                    <GroupCard group={group} key={group.ID} />
                  );
                })}
          </div>
        </Scrollbars>
      </div>
    );
  }
}
Groups.propTypes = {
  groups: React.PropTypes.object,
  fetchGroups: React.PropTypes.func.isRequired,
};

// Function to map state to container props
const mapStateToGroupsProps = (state) => {
  return { groups: state.groups };
};

// Function to map dispatch to container props
const mapDispatchToGroupsProps = (dispatch) => {
  return {
    fetchGroups : () => {
      dispatch(fetchGroupsIfNeeded());
    }
  };
};

// Redux container to Sites component
const GroupsPage = connect(
  mapStateToGroupsProps,
  mapDispatchToGroupsProps
)(Groups);

export default GroupsPage;
