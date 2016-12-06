// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { AUTH_ADMIN_ROLE, AUTH_USER_ROLE, getRoleLabel } from '../auth/auth.constants.js';
import UsersThunks from './users.thunks.js';

// Style
import './user.card.component.scss';

// UserCard Component
class UserCardComponent extends React.Component {

    onChangeRole() {
      const oldUser = this.props.user;
      const userToSave = Object.assign({}, oldUser, { Role: (oldUser.role === AUTH_ADMIN_ROLE ? AUTH_USER_ROLE :  AUTH_ADMIN_ROLE) });
      this.props.saveUserProp(userToSave);
    }

    render() {
      const getRoleClass = (user, connectedUser) => {
        let classes = 'tiny compact ui top right attached toggle button';
        if (connectedUser.role !== AUTH_ADMIN_ROLE) {
          classes += ' disabled';
        }
        if (user.isFetching) {
          classes += ' loading';
        }
        if (user.role === AUTH_ADMIN_ROLE) {
          classes += ' active';
        }
        return classes;
      };
      const user = this.props.user;
      const connectedUser = this.props.auth.user;
        return (
          <div className='ui card user'>
            <div className='content'>
              <img className='ui avatar image' src='/images/avatar.jpg'/>{user.displayName}
              <span className='right floated meta'>
                <button onClick={() => this.onChangeRole()} className={getRoleClass(user, connectedUser)} >
                  <i className={user.role === AUTH_ADMIN_ROLE ? 'unlock icon' : 'lock icon'}></i>
                  {getRoleLabel(user.role)}
                </button>
              </span>
            </div>
            <div className='extra content'>
            <div className='ui tiny right floated provider label'>
              {user.provider.toUpperCase()}
            </div>
              <div className='email' title={user.email}>
            <i className='mail icon'></i> <a href={'mailto:' + user.email}>{user.email}</a>
              </div>
            </div>
          </div>
        );
    }
}
UserCardComponent.propTypes = {
   user: React.PropTypes.object,
   auth: React.PropTypes.object,
   saveUserProp: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  return {
      auth: state.auth,
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    saveUserProp: (user) => {
      dispatch(UsersThunks.saveUser(user));
    }
  };
};

// Redux container to Sites component
const UserCard = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserCardComponent);

export default UserCard;
