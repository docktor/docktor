// React
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import classNames from 'classnames';
import UUID from 'uuid-js';

import { AUTH_ADMIN_ROLE, ALL_ROLES, getRoleLabel, getRoleColor, getRoleIcon } from '../../../modules/auth/auth.constants.js';

// Thunks / Actions
import UserThunks from '../../../modules/users/user/user.thunks.js';
import TagsThunks from '../../../modules/tags/tags.thunks.js';

// Components
import TagsSelector from '../../common/tags.selector.component.js';

// Style
import './user.page.scss';

// User Component
class UserComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...props.user };
  }

  componentWillReceiveProps(nextProps) {
    this.state = { ...nextProps.user };
    this.forceUpdate();
  }

  componentDidMount() {
    const { userId } = this.props;

    // We need to fetch the tags before the user info
    this.props.fetchTags()
      .then(() => this.props.fetchUser(userId));

    this.initializeRoleDropdown();
  }

  componentDidUpdate() {
    this.initializeRoleDropdown();
  }

  initializeRoleDropdown() {
    const roleDropdownSelector = '.role.ui.dropdown';
    $(roleDropdownSelector).dropdown({
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

  onSave(event) {
    event.preventDefault();
    const tagsSelector = this.refs.tags;
    if (this.isFormValid()) {
      const user = {
        ...this.state,
        tags: [...tagsSelector.state.tags]
      };
      this.props.onSave(user);
    }
  }

  isFormValid() {
    return true;
  }

  renderRoleDropdown() {
    const { user, isFetching } = this.props;

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
    const { user, isFetching, tags } = this.props;

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
                      <i className='arrow left icon' />
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
                        <input type='text' defaultValue={user.username || ''} readOnly />
                      </div>

                      <div className='required field'>
                        <label>Email Address</label>
                        <input type='text' defaultValue={user.email || ''} readOnly />
                      </div>
                    </div>

                    <div className='two fields'>
                      <div className='required field'>
                        <label>First Name</label>
                        <input type='text' defaultValue={user.firstName || ''} readOnly />
                      </div>

                      <div className='required field'>
                        <label>Last Name</label>
                        <input type='text' defaultValue={user.lastName || ''} readOnly />
                      </div>
                    </div>

                    <div className='fields'>
                      <div className='two wide field'>
                        <div className='large ui label form-label'>Tags</div>
                      </div>
                      <div className='fourteen wide field'>
                        <label>Tags of the user</label>
                        <TagsSelector tagsSelectorId={UUID.create(4).hex} selectedTags={user.tags || []} tags={tags || []} ref='tags' />
                      </div>
                    </div>

                    <div className='flex button-form'>
                      <a className='ui fluid button' onClick={event => this.onSave(event)}>Save</a>
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
  tags: React.PropTypes.object,
  fetchUser: React.PropTypes.func.isRequired,
  fetchTags: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const user = state.user;
  return {
    user: user.item,
    isFetching: user.isFetching,
    userId: paramId,
    tags: state.tags
  };
};

const mapDispatchToProps = dispatch => ({
  fetchUser: id => dispatch(UserThunks.fetchUser(id)),
  fetchTags: () => dispatch(TagsThunks.fetchIfNeeded()),
  onSave: user => dispatch(UserThunks.saveUser(user))
});

const UserPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserComponent);

export default UserPage;
