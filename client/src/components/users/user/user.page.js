// React
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import classNames from 'classnames';

import { AUTH_ADMIN_ROLE, ALL_ROLES, getRoleLabel, getRoleColor, getRoleIcon } from '../../../modules/auth/auth.constants.js';

// Thunks / Actions
import UserThunks from '../../../modules/users/user/user.thunks.js';

// Style
import './user.page.scss';

// User Component
class UserComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...props.user };
  }

  componentDidMount() {
    const { userId } = this.props;
    if (userId) {
      this.props.fetchUser(userId);
    }
    this.initializeRoleDropdown();
  }

  componentDidUpdate() {
    this.initializeRoleDropdown();
  }

  initializeRoleDropdown() {
    const roleDropdownSelector = '.role.ui.dropdown';
    $(roleDropdownSelector).dropdown({
      action: 'select', // necessary to avoid refresh conflicts between jQuery and React
      onChange: newRole => {
        $(roleDropdownSelector).dropdown('hide');
        this.onChangeRole(newRole);
      }
    });
  }

  onChangeRole(newRole) {
    this.setState({
      ...this.state,
      role: newRole
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps.user });
  }

  renderRoleDropdown() {
    const user = this.state;
    const { isFetching } = this.props;

    const rolesDropdownClasses = classNames(
      'role ui dropdown button form-label',
      getRoleColor(user.role),
      { loading: isFetching }
    );

    return (
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
            return (
              <div key={role} className={itemClasses} data-value={role}>
                <i className={classNames(getRoleIcon(role), 'icon')} />
                {getRoleLabel(role)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const { isFetching } = this.props;
    const user = this.state;

    return (
      <div className='flex layout vertical start-justified'>
        <Scrollbars ref='scrollbars' className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified'>
            {
              isFetching
                ?
                <div className='ui active dimmer'>
                  <div className='ui text loader'>Fetching</div>
                </div>
                :
                <div className='flex layout vertical start-justified user-details'>
                  <h1>
                    <Link to={'/users'}>
                      <i className='arrow left icon'></i>
                    </Link>
                    {`${user.displayName} (${user.username})`}
                  </h1>

                  <form className='ui form user-form'>
                    <div className='fields'>
                      <div className='two wide field'>
                        <div className='ui large label form-label'>{user.provider && user.provider.toUpperCase()}</div>
                      </div>

                      <div className='two wide field'>
                        {this.renderRoleDropdown()}
                      </div>
                    </div>

                    <div className='two fields'>
                      <div className='required field'>
                        <label>Username</label>
                        <input type='text' defaultValue={user.username || ''} disabled />
                      </div>

                      <div className='required field'>
                        <label>Email Address</label>
                        <input type='text' defaultValue={user.email || ''} disabled />
                      </div>
                    </div>

                    <div className='two fields'>
                      <div className='required field'>
                        <label>First Name</label>
                        <input type='text' defaultValue={user.firstName || ''} disabled />
                      </div>

                      <div className='required field'>
                        <label>Last Name</label>
                        <input type='text' defaultValue={user.lastName || ''} disabled />
                      </div>
                    </div>

                    <div className='flex button-form'>
                        <a className='ui fluid button'>Save</a>
                      </div>
                  </form>
                </div>
            }
          </div>
        </Scrollbars>
      </div>
    );
  }
}

UserComponent.propTypes = {
  user: React.PropTypes.object,
  isFetching: React.PropTypes.bool,
  userId: React.PropTypes.string.isRequired,
  fetchUser: React.PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const user = state.user;
  return {
    user: user.item,
    isFetching: user.isFetching,
    userId: paramId
  };
};

const mapDispatchToProps = dispatch => ({
  fetchUser: id => dispatch(UserThunks.fetchUser(id))
});

const UserPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserComponent);

export default UserPage;
