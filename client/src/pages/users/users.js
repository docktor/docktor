// React
import React from 'react';
import { connect } from 'react-redux';

// Components
import UserCard from '../../components/user-card/user-card.js';

// Style
import './users.scss';

//Site Component using react-leaflet
class Users extends React.Component {

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
        <div className='flex layout horizontal around-justified wrap user-list ui dimmable'>
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
                <UserCard user={user} key={user.ID} />
              );
            })}
        </div>
      </div>
    );
  }
}
Users.propTypes = { users: React.PropTypes.object };

// Function to map state to container props
const mapStateToUsersProps = (state) => {
  return { users: state.users };
};

// Function to map dispatch to container props
const mapDispatchToUsersProps = (dispatch) => {
  return {};
};

// Redux container to Sites component
const UsersPage = connect(
  mapStateToUsersProps,
  mapDispatchToUsersProps
)(Users);

export default UsersPage;
