// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import DebounceInput from 'react-debounce-input';

// API Fetching
import UsersThunks from '../../modules/users/users.thunks.js';
import UsersActions from '../../modules/users/users.actions.js';

// Selectors
import { getFilteredUsers } from '../../modules/users/users.selectors.js';

// Components
import UserCard from './user/user.card.component.js';

// Style
import './users.page.scss';

//Site Component using react-leaflet
class Users extends React.Component {

  componentWillMount() {
    this.props.fetchUsers();
  }

  render() {
    const { users, filterValue, changeFilter,  isFetching } = this.props;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal justified users-bar'>
          <div className='ui left corner labeled icon input flex' >
            <div className='ui left corner label'><i className='search icon' /></div>
            <i className='remove link icon' onClick={() => changeFilter('')} />
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              placeholder='Search…'
              onChange={(event) => changeFilter(event.target.value)}
              value={filterValue}/>
          </div>
          <div className='flex-2' />
        </div>
        <Scrollbars autoHide className='flex ui dimmable'>
          <div className='flex layout horizontal center-center wrap user-list'>
              {isFetching && (
                  <div className='ui active inverted dimmer'>
                    <div className='ui text loader'>Fetching</div>
                  </div>
              )}
              {users.map(user => <UserCard user={user} key={user.id} />)}
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
  const filterValue = state.users.filterValue;
  const users = getFilteredUsers(state.users.items, filterValue);
  const isFetching = state.users.isFetching;
  return { filterValue, users, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToUsersProps = (dispatch) => {
  return {
    fetchUsers : () => dispatch(UsersThunks.fetchIfNeeded()),
    changeFilter: filterValue => dispatch(UsersActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const UsersPage = connect(
  mapStateToUsersProps,
  mapDispatchToUsersProps
)(Users);

export default UsersPage;
