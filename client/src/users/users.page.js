// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';

// API Fetching
import { fetchUsersIfNeeded } from './users.thunks.js';

// Components
import UserCard from './user.card.component.js';

// Style
import './users.page.scss';

//Site Component using react-leaflet
class Users extends React.Component {

  componentWillMount() {
    this.props.fetchUsers();
  }

  render() {
    const users = Object.values(this.props.users.items);
    const fetching = this.props.users.isFetching;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal center-center users-bar'>
          <div className='ui icon input'>
            <i className='search icon'></i>
            <input type='text' placeholder='Search...'/>
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
  users: React.PropTypes.object,
  fetchUsers: React.PropTypes.func.isRequired,
};

// Function to map state to container props
const mapStateToUsersProps = (state) => {
  return { users: state.users };
};

// Function to map dispatch to container props
const mapDispatchToUsersProps = (dispatch) => {
  return {
    fetchUsers : () => {
      dispatch(fetchUsersIfNeeded());
    }
  };
};

// Redux container to Sites component
const UsersPage = connect(
  mapStateToUsersProps,
  mapDispatchToUsersProps
)(Users);

export default UsersPage;
