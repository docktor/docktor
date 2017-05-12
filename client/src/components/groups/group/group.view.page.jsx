// React
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Form, Segment, Button, Dimmer, Loader, Label, Icon } from 'semantic-ui-react';
import classNames from 'classnames';
import get from 'lodash.get';

// Thunks / Actions
import TagsThunks from '../../../modules/tags/tags.thunks';
import DaemonsThunks from '../../../modules/daemons/daemons.thunks';
import GroupsThunks from '../../../modules/groups/groups.thunks';
import UsersThunks from '../../../modules/users/users.thunks';
import ServicesThunks from '../../../modules/services/services.thunks';

// Selectors
import { ALL_ROLES, getRoleData } from '../../../modules/auth/auth.constants';
import { GROUP_MODERATOR_ROLE } from '../../../modules/groups/groups.constants';

// Components
import HeadingBox from '../../common/boxes/box/heading.box.component';
import ContainersBox from './containers/containers.box.component';

// Style
import './group.view.page.scss';

// Group Component for view (with services and so on)
class GroupViewComponent extends React.Component {

  state = { group: {} }
  roles = {}

  componentWillMount = () => {
    ALL_ROLES.forEach(role => {
      this.roles[role] = getRoleData(role);
    });
    this.setState({ group: { ...this.props.group } });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ group: { ...nextProps.group } });
  }

  componentDidMount = () => {
    const groupId = this.props.groupId;

    if (groupId) {
      this.props.fetchGroup(groupId);
      this.props.fetchTags(groupId);
      this.props.fetchDaemons(groupId);
      this.props.fetchMembers(groupId);
      this.props.fetchServices(groupId);
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.isFetching) {
      this.refs.scrollbars.scrollTop();
    }
  }

  getMembersEmail = (members, users) => {
    return members.map(member => users[member.user])
                  .filter(member => Boolean(member))
                  .map(member => member.email);
  }

  // Render the members of the group
  renderMembers = (group, users) => {
    if(users.isFetching) {
      return <span><Icon loading name='notched circle' />Loading...</span>;
    }
    if (group.members && group.members.length > 0) {
      const memberAddresses = this.getMembersEmail(group.members, users.items) || [];
      const moderatorAdresses = this.getMembersEmail(group.members.filter(m => m.role === GROUP_MODERATOR_ROLE), users.items) || [];
      const mailtoModeratorAddressesClasses = classNames('ui icon button', { 'disabled': moderatorAdresses.length === 0 });
      return (
        <div className='members-list'>
          <div className='ui buttons'>
              <a href={`mailto:${memberAddresses.join(',')}?subject=[Docktor] ${group.title}`} className='ui icon button'><Icon name='mail' />Email all</a>
              <a href={`mailto:${moderatorAdresses.join(',')}?subject=[Docktor] For ${group.title} moderators`} className={mailtoModeratorAddressesClasses}>
                <Icon name='mail' />Email moderators
              </a>
          </div>
          <div className='flex layout horizontal wrap'>
            {group.members.map(member => {
              const user = users.items[member.user];
              if (user) {
                // Only displays users who still exist
                return (
                  <div key={user.id} className='ui card member'>
                    <div className='content'>
                      <Link to={`/users/${user.id}`}><Icon name='user' />{user.displayName}</Link>
                      <div className='ui tiny right floated provider label'>
                        {member.role.toUpperCase()}
                      </div>
                    </div>
                    <div className='extra content'>
                      <div className='email' title={user.email}>
                        <Icon name='mail' /> <a href={`mailto:${user.email}?subject=[Docktor] ${group.title} - `}>{user.email}</a>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      );
    }
    return <span>No members</span>;
  }

  renderTags = (group, tags) => {
    if (tags.isFetching) {
      return <span><Icon loading name='notched circle' />Loading...</span>;
    }
    if (group.tags && group.tags.length > 0) {
      return group.tags.map(id => {
        const tag = tags.items[id];
        if (tag) {
          const role = this.roles[tag.usageRights];
          const title = `Tag '${tag.name.raw}' from category '${tag.category.raw}' can be added or removed from group by '${role.value}s'`;
          return (<Label key={id} className={role.color} title={title}><b>{tag.category.raw} : </b>{tag.name.raw}</Label>);
        }
      });
    }
    return 'No tags';
  }

  render = () => {
    const { isFetching, group, daemons, tags, users, services } = this.props;
    const { display, groupBy } = this.props;
    return (
      <div className='flex layout vertical start-justified group-view-page'>
        <Scrollbars ref='scrollbars' className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified'>
            {isFetching && <Dimmer active><Loader size='big' content='Fetching'/></Dimmer>}
            <div className='flex layout vertical start-justified group-view-details'>
              <h1>
                <Link to={'/groups'}>
                  <Icon name='arrow left'/>
                </Link>
                {group.title}
                <Button size='large' content='Edit' color='teal' labelPosition='left' icon='edit'
                  disabled={!group.id} as={Link} to={`/groups/${group.id}/edit`} className='right-floated'
                />
              </h1>
              <Segment padded>
                <div className='labelised-field'>
                  <Label size='large'>Description</Label>
                  <span>{group.description}</span>
                </div>
                <div className='labelised-field'>
                  <Label size='large'>Tags</Label>
                  <Label.Group as='span'>
                    {this.renderTags(group, tags)}
                  </Label.Group>
                </div>
                <Form as={HeadingBox} stacked className='box-component' icon='users' title='Members'>
                  {this.renderMembers(group, users)}
                </Form>
                 <ContainersBox isFetching={isFetching} group={group} display={display} groupBy={groupBy} containers={group.containers || []} tags={tags || {}}  services={services || {}} daemons={daemons || []} />
              </Segment>
            </div>
          </div>
        </Scrollbars>
      </div>
    );
  }
}

GroupViewComponent.propTypes = {
  group: PropTypes.object,
  isFetching: PropTypes.bool,
  groupId: PropTypes.string,
  daemons: PropTypes.object,
  tags: PropTypes.object,
  users: PropTypes.object,
  services: PropTypes.object,
  fetchGroup: PropTypes.func.isRequired,
  fetchDaemons: PropTypes.func.isRequired,
  fetchTags: PropTypes.func.isRequired,
  fetchMembers: PropTypes.func.isRequired,
  fetchServices: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
  display: PropTypes.string,
  groupBy: PropTypes.string
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  const localSettings = JSON.parse(localStorage.getItem('settings')) || {};
  const groupId = ownProps.params.id;
  const display = ownProps.loc.query.display || get(localSettings, `groups.${groupId}.display`);
  const groupBy = ownProps.loc.query.groupBy || get(localSettings, `groups.${groupId}.groupBy`);
  const groups = state.groups;
  const group = groups.selected;
  const emptyGroup = { tags: [], filesystems: [], containers: [] };
  const isFetching = groupId && (groupId !== group.id);

  // External dependencies
  const daemons = state.daemons || [];
  const tags = state.tags || {};
  const users = state.users || {};
  const services = state.services || {};

  // Props
  return {
    groupId,
    group: groups.items[groupId] || emptyGroup,
    display,
    groupBy,
    isFetching,
    tags,
    daemons,
    users,
    services
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchGroup: (id) => dispatch(GroupsThunks.fetch(id)),
    fetchDaemons: id => dispatch(DaemonsThunks.fetchGroupDaemons(id)),
    fetchTags: id => dispatch(TagsThunks.fetchGroupTags(id)),
    fetchMembers: id => dispatch(UsersThunks.fetchGroupMembers(id)),
    fetchServices: id => dispatch(ServicesThunks.fetchGroupServices(id))
  };
};

// Redux container to component
const GroupViewPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupViewComponent);

export default GroupViewPage;
