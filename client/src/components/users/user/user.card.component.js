// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';

import { AUTH_ADMIN_ROLE, ALL_ROLES, getRoleLabel, getRoleColor, getRoleIcon } from '../../../modules/auth/auth.constants.js';
import UsersThunks from '../../../modules/users/users.thunks.js';

// Style
import './user.card.component.scss';

// UserCard Component
class UserCardComponent extends React.Component {
  onChangeRole(newRole) {
    const oldUser = this.props.user;
    const userToSave = {
      ...oldUser,
      Role: newRole
    };
    this.props.saveUser(userToSave);
  }

  initializeDropdownComponents() {
    const userCardSelector = `.card.id-${this.props.user.id} .ui.dropdown`;
    $(userCardSelector).dropdown({
      action: 'select', // necessary to avoid refresh conflicts between jQuery and React
      onChange: value => {
        $(userCardSelector).dropdown('hide');
        this.onChangeRole(value);
      }
    });
  }

  componentDidMount() {
    this.initializeDropdownComponents();
  }

  render() {
    const user = this.props.user;
    const connectedUser = this.props.auth.user;

    const rolesDropdownClasses = classNames(
      'ui tiny compact top right attached pointing dropdown button',
      getRoleColor(user.role),
      {
        disabled: connectedUser.role !== AUTH_ADMIN_ROLE,
        loading: user.isFetching
      }
    );

    return (
      <div className={`ui card user id-${user.id}`}>
        <div className='content'>
          <img className='ui avatar image' alt='Avatar' src='/images/avatar.jpg' />{user.displayName}
          <div className={rolesDropdownClasses}>
            <input type='hidden' name='role' />
            <div className='default text'>
              <i className={classNames(getRoleIcon(user.role), 'icon')} />
              {getRoleLabel(user.role)}
            </div>
            <div className='menu'>
              {ALL_ROLES.map(role => {
                const itemClasses = classNames('item', {
                  'active selected': role === user.role
                });
                return (<div key={role} className={itemClasses} data-value={role}>
                  <i className={classNames(getRoleIcon(role), 'icon')} />
                  {getRoleLabel(role)}
                </div>);
              })}
            </div>
          </div>
        </div>
        <div className='extra content'>
          <div className='ui tiny right floated provider label'>
            {user.provider.toUpperCase()}
          </div>
          <div className='email' title={user.email}>
            <i className='mail icon' /> <a href={`mailto:${user.email}`}>{user.email}</a>
          </div>
        </div>
      </div>
    );
  }
}

UserCardComponent.propTypes = {
  user: React.PropTypes.object,
  auth: React.PropTypes.object,
  saveUser: React.PropTypes.func.isRequired
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
    saveUser: (user) => {
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
