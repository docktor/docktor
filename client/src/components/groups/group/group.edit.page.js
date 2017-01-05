// React
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';
import UUID from 'uuid-js';

// Thunks / Actions
import TagsThunks from '../../../modules/tags/tags.thunks.js';
import DaemonsThunks from '../../../modules/daemons/daemons.thunks.js';
import UsersThunks from '../../../modules/users/users.thunks.js';

import GroupsThunks from '../../../modules/groups/groups.thunks.js';
import ToastsActions from '../../../modules/toasts/toasts.actions.js';

// Components
import FilesystemsBox from '../../common/boxes/filesystems.box.component.js';
import MembersBox from '../../common/boxes/members.box.component.js';
import TagsSelector from '../../tags/tags.selector.component.js';

// Selectors
import { getDaemonsAsFSOptions } from '../../../modules/daemons/daemons.selectors.js';
import { getUsersAsOptions } from '../../../modules/users/users.selectors.js';

import { parseError } from '../../../modules/utils/forms.js';

// Style
import './group.edit.page.scss';

// Group Component for edition
class GroupEditComponent extends React.Component {

  state = { errors: { details: [], fields: {} }, group: {}, tags:[] }

  schema = Joi.object().keys({
    title: Joi.string().trim().required().label('Title'),
    description: Joi.string().trim().required().label('Description')
  })

  componentWillMount = () => {
    this.setState({ group: { ...this.props.group }, errors: { details: [], fields:{} } });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ group: { ...nextProps.group }, errors: { details: [], fields:{} } });
  }

  componentDidMount = () => {
    const groupId = this.props.groupId;

    // Tags must be fetched before the group for the UI to render correctly
    Promise.all([
      this.props.fetchTags(),
      this.props.fetchDaemons(),
      this.props.fetchUsers()
    ]).then(() => {
      if (groupId) {
        // Fetch when known group
        this.props.fetchGroup(groupId);
      }
    });

    if (!groupId) {
      const tagsSelector = this.refs.tags;
      tagsSelector.setState({ tags: [] });
      this.refs.scrollbars && this.refs.scrollbars.scrollTop();
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.isFetching) {
      this.refs.scrollbars && this.refs.scrollbars.scrollTop();
    }
  }

  onChangeProperty = (value, property) => {
    this.setState({ group: { ...this.state.group, [property]: value } });
  }

  isFormValid = () => {
    const { error } = Joi.validate(this.state.group, this.schema, { abortEarly: false, allowUnknown: true });
    error && this.setState({ errors: parseError(error) });
    return !Boolean(error);
  }

  onSave = (e) => {
    e.preventDefault();
    const tagsSelector = this.refs.tags;
    const filesystemsBox = this.refs.filesystems;
    const membersBox = this.refs.members;
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    let formValid = this.isFormValid() & filesystemsBox.isFormValid() & membersBox.isFormValid();
    if (formValid) {
      const group = { ...this.state.group };
      group.tags = tagsSelector.state.tags;
      group.filesystems = filesystemsBox.state.filesystems;
      group.members = membersBox.state.members;
      this.props.onSave(group);
    }
  }

  render = () => {
    const { group } = this.state;
    const { isFetching, daemons, tags, users } = this.props;
    return (
      <div className='flex layout vertical start-justified group-page'>
        <Scrollbars ref='scrollbars' className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified'>
            {
              isFetching ?
                <div className='ui active dimmer'>
                  <div className='ui text loader'>Fetching</div>
                </div>
                :
                <div className='flex layout vertical start-justified group-details'>
                  <h1>
                    <Link to={group.id ? `/groups/${group.id}` : '/groups'}>
                      <i className='arrow left icon'/>
                    </Link>
                    {this.props.group.title || 'New Group'}
                    <button disabled={!group.id} onClick={() => this.props.onDelete(group)} className='ui red labeled icon button right-floated'>
                      <i className='trash icon'/>Remove
                    </button>
                  </h1>
                  <form className='ui form group-form'>
                    <input type='hidden' name='created' value={group.created || ''} onChange={event => this.onChangeProperty(event.target.value, 'created')} />
                    <input type='hidden' name='id' value={group.id || ''} onChange={event => this.onChangeProperty(event.target.value, 'id')} />
                    <div className='field required'>
                      <label>Title</label>
                      <input type='text' name='title' value={group.title || ''} onChange={event => this.onChangeProperty(event.target.value, 'title')}
                        placeholder='A unique name' autoComplete='off' />
                    </div>
                    <div className='field'>
                      <label>Description</label>
                      <textarea rows='4' name='description' value={group.description || ''} onChange={event => this.onChangeProperty(event.target.value, 'description')}
                        placeholder='A description of the group' autoComplete='off' />
                    </div>
                    <div className='fields'>
                      <div className='two wide field'>
                        <div className='large ui label form-label'>Tags</div>
                      </div>
                      <div className='fourteen wide field'>
                        <label>Tags of the group</label>
                        <TagsSelector tagsSelectorId={UUID.create(4).hex} selectedTags={group.tags || []} tags={tags} ref='tags' />
                      </div>
                    </div>
                  </form>
                  <FilesystemsBox filesystems={group.filesystems || []} daemons={daemons} ref='filesystems' boxId={UUID.create(4).hex}>
                    <p>Monitoring filesystem is only available if selected daemon has cAdvisor deployed on it and configured on Docktor.</p>
                  </FilesystemsBox>
                  <MembersBox members={group.members} users={users} ref='members'>
                    <p>Members of groups are able to see it and interact with containers.</p>
                    <ul>
                      <li>Moderators are able to add other members and to interact with services (stop/start)</li>
                      <li>Simple members are only able to see the group and instanciated services</li>
                    </ul>
                  </MembersBox>
                  <div className='flex button-form'>
                    <a className='ui fluid button' onClick={this.onSave}>Save</a>
                  </div>
                </div>
            }
          </div>
        </Scrollbars>
      </div>
    );
  }
}
GroupEditComponent.propTypes = {
  group: React.PropTypes.object,
  isFetching: React.PropTypes.bool,
  groupId: React.PropTypes.string,
  daemons: React.PropTypes.array,
  users: React.PropTypes.array,
  tags: React.PropTypes.object,
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
  const emptyGroup = { tags: [], filesystems: [], members: [] };
  const daemons = getDaemonsAsFSOptions(state.daemons.items) || [];
  const users = getUsersAsOptions(state.users.items) || [];
  const isFetching = paramId && (paramId !== group.id || (group.id ? group.isFetching : true));
  return {
    group: groups.items[paramId] || emptyGroup,
    isFetching,
    groupId: paramId,
    tags: state.tags,
    daemons,
    users
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchGroup: (id) => dispatch(GroupsThunks.fetchGroup(id)),
    fetchDaemons: () => dispatch(DaemonsThunks.fetchIfNeeded()),
    fetchUsers: () => dispatch(UsersThunks.fetchIfNeeded()),
    fetchTags: () => dispatch(TagsThunks.fetchIfNeeded()),
    onSave: (group) => dispatch(GroupsThunks.saveGroup(group)),
    onDelete: group => {
      const callback = () => dispatch(GroupsThunks.deleteGroup(group.id));
      dispatch(ToastsActions.confirmDeletion(group.title, callback));
    }
  };
};

// Redux container to Sites component
const GroupEditPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupEditComponent);

export default GroupEditPage;
