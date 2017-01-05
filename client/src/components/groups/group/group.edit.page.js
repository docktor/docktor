// React
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Form, Input, Button, Dimmer, Loader, Label, Icon } from 'semantic-ui-react';
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
    description: Joi.string().trim().allow('').label('Description')
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

  handleChange = (e, { name, value }) => {
    const { group, errors } = this.state;
    const state = {
      group: { ...group, [name]:value },
      errors: { details: [...errors.details], fields: { ...errors.fields } }
    };
    delete state.errors.fields[name];
    this.setState(state);
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
    const { group, errors } = this.state;
    const { isFetching, daemons, tags, users } = this.props;
    return (
      <div className='flex layout vertical start-justified group-page'>
        <Scrollbars autoHide ref='scrollbars' className='ui dimmable flex'>
          <div className='flex layout horizontal around-justified'>
            {isFetching && <Dimmer active><Loader size='big' content='Fetching'/></Dimmer>}
            <div className='flex layout vertical start-justified group-details'>
              <h1>
                <Link to={group.id ? `/groups/${group.id}` : '/groups'}>
                  <Icon name='arrow left'/>
                </Link>
                {this.props.group.title || 'New Group'}
                <Button size='large' content='Remove' color='red' labelPosition='left' icon='trash'
                  disabled={!group.id} onClick={() => this.props.onDelete(group)} className='right-floated'
                />
              </h1>
              <Form className='group-form'>
                <Input type='hidden' name='created' value={group.created || ''} onChange={this.handleChange} />
                <Input type='hidden' name='id' value={group.id || ''} onChange={this.handleChange} />
                <Form.Input required label='Title' name='title' value={group.title || ''} onChange={this.handleChange}
                  type='text' placeholder='A unique name' autoComplete='off' error={errors.fields['title']}
                />
                <Form.TextArea label='Description' name='description' value={group.description || ''} onChange={this.handleChange}
                  rows='4' placeholder='A description of the group' autoComplete='off' error={errors.fields['description']}
                />
                <Form.Group>
                  <Form.Field width='two'>
                    <Label size='large' className='form-label' content='Tags' />
                  </Form.Field>
                  <Form.Field width='fourteen'>
                    <label>Tags of the group</label>
                    <TagsSelector tagsSelectorId={UUID.create(4).hex} selectedTags={group.tags || []} tags={tags} ref='tags' />
                  </Form.Field>
                </Form.Group>
              </Form>
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
                <Button fluid onClick={this.onSave}>Save</Button>
              </div>
            </div>
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
  const isFetching = paramId && (paramId !== group.id);
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
