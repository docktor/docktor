// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';

// API Fetching
import UsersThunks from './users.thunks.js';
import UsersActions from './users.actions.js';

// Components
import UserCard from './user.card.component.js';

// Selectors
import { getFilteredUsers } from './users.selectors.js';

// Style
import './users.page.scss';

//Site Component using react-leaflet
class Users extends React.Component {

  componentWillMount() {
    this.props.fetchUsers();
  }

  render() {
    const users = this.props.users;
    const filterValue = this.props.filterValue;
    const fetching = this.props.isFetching;
    const changeFilter = this.props.changeFilter;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal center-center users-bar'>
          <div className='ui icon input'>
            <i className='search icon'></i>
            <input type='text' placeholder='Search...' onChange={(event) => changeFilter(event.target.value)} defaultValue=''/>
          </div>
          <div className='flex'></div>
        </div>
        <Scrollbars className='flex ui dimmable'>
          <div className='flex layout horizontal center-center wrap user-list'>
              {(fetching => {
                if (fetching) {
                  return (
                      <div className='ui active inverted dimmer'>
                        <div className='ui text loader'>Fetching</div>
                      </div>
                  );
                }
              })(fetching)}
              {users.map(user => {
                return (
                  <UserCard user={user} key={user.id} />
                );
              })}
          </div>
        </Scrollbars>
      </div>
    );
  }
}
Users.propTypes = {
  users: React.PropTypes.array,
  filterValue: React.PropTypes.string,
  isFetching: React.PropTypes.bool,
  fetchUsers: React.PropTypes.func.isRequired,
  changeFilter: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToUsersProps = (state) => {
  const filterValue = state.services.filterValue;
  const users = getFilteredUsers(state.users.items, filterValue);
  const isFetching = state.services.isFetching;
  return { filterValue, users, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToUsersProps = (dispatch) => {
  return {
    fetchUsers : () => {
      dispatch(UsersThunks.fetchIfNeeded());
    },
    changeFilter: (filterValue) => dispatch(UsersActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const UsersPage = connect(
  mapStateToUsersProps,
  mapDispatchToUsersProps
)(Users);

export default UsersPage;
