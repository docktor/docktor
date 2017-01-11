// React
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Form, Button, Dimmer, Loader, Label, Icon, Dropdown } from 'semantic-ui-react';

import { ALL_ROLES, getRoleLabel, getRoleColor, getRoleIcon } from '../../../modules/auth/auth.constants';

// Thunks / Actions
import UsersThunks from '../../../modules/users/users.thunks';
import TagsThunks from '../../../modules/tags/tags.thunks';

// Components
import TagsSelector from '../../tags/tags.selector.component';

// Style
import './user.page.scss';

// User Component
class UserComponent extends React.Component {

  state = { user: {}, tags:[] }

  componentWillMount = () => {
    this.setState({ user: { ...this.props.user } });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ user: { ...nextProps.user } });
  }

  componentDidMount = () => {
    const { userId } = this.props;

    // We need to fetch the tags before the user info
    this.props.fetchTags()
      .then(() => this.props.fetchUser(userId));
  }

  handleChange = (e, { name, value }) => {
    const { user } = this.state;
    const state = {
      user: { ...user, [name]: value },
    };
    this.setState(state);
  }

  isFormValid = () => {
    return true;
  }

  onSave = (e) => {
    e.preventDefault();
    const tagsSelector = this.refs.tags;
    if (this.isFormValid()) {
      const user = {
        ...this.state.user,
        tags: [...tagsSelector.state.tags]
      };
      this.props.onSave(user);
    }
  }

  renderDropDownButton = (user, isFetching) => {
    return (
      <Button loading={isFetching} color={getRoleColor(user.role)} className='role' onClick={e => e.preventDefault()}>
        <Icon name={getRoleIcon(user.role)} />
        {getRoleLabel(user.role)}
      </Button>
    );
  }

  renderRoleDropdown = (user, isFetching) => {
    const options = ALL_ROLES.map(role => {
      return {
        icon: <Icon name={getRoleIcon(role)} color={getRoleColor(role)} />,
        value: role,
        text: getRoleLabel(role)
      };
    });

    return (
      <Dropdown trigger={this.renderDropDownButton(user, isFetching)} onChange={this.handleChange} options={options}
        icon={null} value={user.role} name='role'
      />
    );
  }

  render = () => {
    const { isFetching, tags } = this.props;
    const { user } = this.state;
    return (
      <div className='flex layout vertical start-justified user-page'>
        <Scrollbars ref='scrollbars' className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified'>
            {isFetching && <Dimmer active><Loader size='big' content='Fetching'/></Dimmer>}
            <div className='flex layout vertical start-justified user-details'>
              <h1>
                <Link to={'/users'}>
                  <Icon name='arrow left' fitted/>
                </Link>
                {`${user.displayName} (${user.username})`}
              </h1>

              <Form className='user-form'>
                <Form.Group>
                  <Form.Field width='two'>
                    <Label size='large' className='form-label' content={user.provider && user.provider.toUpperCase()} />
                  </Form.Field>

                  <Form.Field width='two'>
                    {this.renderRoleDropdown(user, isFetching)}
                  </Form.Field>
                </Form.Group>

                <Form.Group widths='two'>
                  <Form.Input required readOnly label='Username' value={user.username || ''} onChange={this.handleChange}
                    type='text' name='username' autoComplete='off' placeholder='Username'
                  />
                  <Form.Input required readOnly label='Email Address' value={user.email || ''} onChange={this.handleChange}
                      type='text' name='email' autoComplete='off' placeholder='A valid email address'
                  />
                </Form.Group>

                <Form.Group widths='two'>
                  <Form.Input required readOnly label='First Name' value={user.firstName || ''} onChange={this.handleChange}
                    type='text' name='firstName' autoComplete='off' placeholder='First Name'
                  />
                  <Form.Input required readOnly label='Last Name' value={user.lastName || ''} onChange={this.handleChange}
                      type='text' name='lastName' autoComplete='off' placeholder='Last Name'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Field width='two'>
                    <Label size='large' className='form-label' content='Tags' />
                  </Form.Field>
                  <Form.Field width='fourteen'>
                    <label>Tags of the daemon</label>
                    <TagsSelector selectedTags={user.tags || []} tags={tags} ref='tags' />
                  </Form.Field>
                </Form.Group>

                <div className='flex button-form'>
                  <Button fluid onClick={this.onSave}>Save</Button>
                </div>
              </Form>
            </div>
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
  onSave: React.PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const users = state.users;
  const user = users.selected;
  const emptyUser = { tags: [] };
  const isFetching = paramId && (paramId !== user.id);
  return {
    user: users.items[user.id] || emptyUser,
    isFetching,
    userId: paramId,
    tags: state.tags
  };
};

const mapDispatchToProps = dispatch => ({
  fetchUser: id => dispatch(UsersThunks.fetchUser(id)),
  fetchTags: () => dispatch(TagsThunks.fetchIfNeeded()),
  onSave: user => dispatch(UsersThunks.saveUser(user))
});

const UserPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserComponent);

export default UserPage;
