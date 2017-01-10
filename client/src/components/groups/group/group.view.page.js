// React
import React from 'react';
import { Link } from 'react-router';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import classNames from 'classnames';

// Thunks / Actions
import TagsThunks from '../../../modules/tags/tags.thunks.js';
import DaemonsThunks from '../../../modules/daemons/daemons.thunks.js';
import GroupsThunks from '../../../modules/groups/groups.thunks.js';
import UsersThunks from '../../../modules/users/users.thunks.js';
import ToastsActions from '../../../modules/toasts/toasts.actions.js';

// Selectors
import { getDaemonsAsFSOptions } from '../../../modules/daemons/daemons.selectors.js';
import { ALL_ROLES, getRoleData } from '../../../modules/auth/auth.constants.js';
import { GROUP_MODERATOR_ROLE } from '../../../modules/groups/groups.constants.js';

// Components
import HeadingBox from '../../common/boxes/box/heading.box.component.js';
import ContainerCard from './container/container.card.component.js';

// Style
import './group.view.page.scss';

// Group Component for view (with services and so on)
class GroupViewComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...props.group };
    this.roles = {};
    ALL_ROLES.forEach(role => {
      this.roles[role] = getRoleData(role);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps.group });
  }

  componentDidMount() {
    const groupId = this.props.groupId;

    if (groupId) {
      this.props.fetchGroup(groupId);
      this.props.fetchTags();
      this.props.fetchDaemons();
      this.props.fetchUsers(); // TODO : replace by fetchMembers thunk (that does not get all users)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isFetching) {
      this.refs.scrollbars.scrollTop();
    }
  }

  getMembersEmail(members, users) {
    return members.map(member => users[member.user]).map(member => member.email);
  }

  renderMembers(group, users) {
    if(users.isFetching) {
      return <span><i className='notched circle loading icon' />Loading...</span>;
    } else {
      if (group.members && group.members.length > 0) {
        const memberAddresses = this.getMembersEmail(group.members, users.items) || [];
        const moderatorAdresses = this.getMembersEmail(group.members.filter(m => m.role === GROUP_MODERATOR_ROLE), users.items) || [];
        const mailtoModeratorAddressesClasses = classNames('ui icon button', { 'disabled': moderatorAdresses.length === 0 });
        return (
          <div className='members-list'>
           <div className='ui buttons'>
               <a href={`mailto:${memberAddresses.join(',')}?subject=[Docktor] ${group.title}`} className='ui icon button'><i className='mail icon' />Email all</a>
               <a href={`mailto:${moderatorAdresses.join(',')}?subject=[Docktor] For ${group.title} moderators`} className={mailtoModeratorAddressesClasses}>
                <i className='mail icon' />Email moderators
               </a>
           </div>
           <div className='flex layout horizontal wrap'>
            { group.members.map(member => {
              const user = users.items[member.user];
              if (user) {
                // Only displays users who still exist
                return (
                  <div key={user.id} className='ui card member'>
                    <div className='content'>
                      <Link to={`/users/${user.id}`}><i className='user icon' />{user.displayName}</Link>
                      <div className='ui tiny right floated provider label'>
                        {member.role.toUpperCase()}
                      </div>
                    </div>
                    <div className='extra content'>
                      <div className='email' title={user.email}>
                        <i className='mail icon' /> <a href={`mailto:${user.email}?subject=[Docktor] ${group.title} - `}>{user.email}</a>
                      </div>
                    </div>
                  </div>
                );
              } else {
                '';
              }

            })}
            </div>
          </div>
        );
      } else {
        return 'No members';
      }
    }
  }

  renderReadOnlyTags(group, tags) {
    if (tags.isFetching) {
      return <span><i className='notched circle loading icon' />Loading...</span>;
    } else {
      if (group.tags && group.tags.length > 0) {
        return group.tags.map(id => {
          const tag = tags.items[id];
          if (tag) {
            const role = this.roles[tag.usageRights];
            const classes = classNames('ui label', role.color);
            const title = `Tag '${tag.name.raw}' from category '${tag.category.raw}' can be added or removed from group by '${role.value}s'`;
            return (<span key={id} className={classes} title={title}><b>{tag.category.raw} : </b>{tag.name.raw}</span>);
          } else {
            return '';
          }
        });
      } else {
        return 'No tags';
      }

    }
  }

  render() {
    const { isFetching, group, daemons, tags, users } = this.props;
    return (
      <div className='flex layout vertical start-justified group-view-page'>
        <Scrollbars ref='scrollbars' className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified'>
            {
              isFetching ?
                <div className='ui active dimmer'>
                  <div className='ui text loader'>Fetching</div>
                </div>
                :
                <div className='flex layout vertical start-justified group-view-details'>
                  <h1>
                    <Link to={'/groups'}>
                      <i className='arrow left icon'/>
                    </Link>
                    {group.title}
                    <Link disabled={!group.id} to={`/groups/${group.id}/edit`} title={`Edit ${group.title}`} className='ui labeled icon teal button right-floated'>
                      <i className='edit icon'/> Edit
                    </Link>
                  </h1>
                  <div className='ui tab segment padded active' data-tab='general'>
                    <div className='labelised-field'>
                      <span className='large ui label'>Description</span>
                      <span>{group.description}</span>
                    </div>
                    <div className='labelised-field'>
                      <span className='large ui label'>Tags</span>
                      <span className='ui labels'>
                        {this.renderReadOnlyTags(group, tags)}
                      </span>
                    </div>
                    <HeadingBox stacked className='box-component ui form' icon='users icon' title='Members'>
                      {this.renderMembers(group, users)}
                    </HeadingBox>
                    <HeadingBox className='box-component ui form' icon='cube icon' title='Containers'>
                      <div className='ui buttons'>
                        <div className='ui icon disabled button'><i className='stop icon' />Stop all</div>
                        <div className='ui icon disabled button'><i className='play icon' />Start all</div>
                        <div className='ui icon disabled button'><i className='repeat icon' />Restart all</div>
                        <div className='ui icon disabled button'><i className='cloud upload icon' />Redeploy all</div>
                        <div className='ui icon disabled button'><i className='trash icon' />Uninstall all</div>
                      </div>
                      <div className='flex layout center-justified horizontal wrap'>
                        {group.containers.map(container => {
                          return <ContainerCard key={container.id} daemons={daemons} container={container} />;
                        })
                        }
                        </div>
                    </HeadingBox>
                  </div>
                </div>
            }
          </div>
        </Scrollbars>
      </div>
    );
  }
}
GroupViewComponent.propTypes = {
  group: React.PropTypes.object,
  isFetching: React.PropTypes.bool,
  groupId: React.PropTypes.string,
  daemons: React.PropTypes.array,
  tags: React.PropTypes.object,
  users: React.PropTypes.object,
  fetchGroup: React.PropTypes.func.isRequired,
  fetchDaemons: React.PropTypes.func.isRequired,
  fetchTags: React.PropTypes.func.isRequired,
  fetchUsers: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func,
  onDelete: React.PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const groups = state.groups;
  const group = groups.selected;
  const emptyGroup = { tags: [], filesystems: [], containers: [] };
  const daemons = getDaemonsAsFSOptions(state.daemons.items) || [];
  const tags = state.tags;
  const users = state.users;
  const isFetching = paramId && (paramId !== group.id);
  return {
    group: groups.items[paramId] || emptyGroup,
    isFetching,
    groupId: paramId,
    tags,
    daemons,
    users
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchGroup: (id) => dispatch(GroupsThunks.fetchGroup(id)),
    fetchDaemons: () => dispatch(DaemonsThunks.fetchIfNeeded()),
    fetchTags: () => dispatch(TagsThunks.fetchIfNeeded()),
    fetchUsers: () => dispatch(UsersThunks.fetchIfNeeded())
  };
};

// Redux container to component
const GroupViewPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupViewComponent);

export default GroupViewPage;
