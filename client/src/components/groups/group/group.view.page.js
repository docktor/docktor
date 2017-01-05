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
import ToastsActions from '../../../modules/toasts/toasts.actions.js';

// Selectors
import { getDaemonsAsFSOptions } from '../../../modules/daemons/daemons.selectors.js';
import { ALL_ROLES, getRoleData } from '../../../modules/auth/auth.constants.js';

// Components
import HeadingBox from '../../common/boxes/box/heading.box.component.js';

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
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isFetching) {
      this.refs.scrollbars.scrollTop();
    }
  }

  renderReadOnlyTags(group, tags) {
    if (tags.isFetching) {
      return <span>Fetching...</span>;
    } else {
      return group.tags.map(id => {
        const tag = tags.items[id];
        if (tag) {
          const role = this.roles[tag.usageRights];
          const classes = classNames('ui label', role.color);
          const title = `Tag '${tag.name.raw}' from category '${tag.category.raw}' can be add or removed from group by '${role.value}s'`;
          return (<span key={id} className={classes} title={title}><b>{tag.category.raw} : </b>{tag.name.raw}</span>);
        } else {
          return '';
        }
      });
    }
  }

  renderGeneralTab(group, tags) {
    return (
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
        <HeadingBox className='box-component ui form' icon='cube icon' title='Containers'>
            <p> test</p>
          </HeadingBox>
      </div>
    );
  }

  renderDetailsTab(group) {
    return (
      <div className='ui tab segment nonpadded' data-tab='details'>
        {/* TODO Members */}
      </div>
    );
  }

  renderTabs(group, tags) {
    return (
      <div className='flex tabular-details'>
        <div className='ui pointing two item menu'>
          <a className='item active' data-tab='general'>General</a>
          <a className='item' data-tab='details'>Details</a>
        </div>
        {this.renderDetailsTab(group)}
        {this.renderGeneralTab(group, tags)}
      </div>
    );
  }

  render() {
    const group = this.props.group;
    const isFetching = this.props.isFetching;
    const daemons = this.props.daemons;
    const tags = this.props.tags;
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
                  {this.renderTabs(group, tags)}
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
  fetchGroup: React.PropTypes.func.isRequired,
  fetchDaemons: React.PropTypes.func.isRequired,
  fetchTags: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func,
  onDelete: React.PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const groups = state.groups;
  const group = groups.selected;
  const emptyGroup = { tags: [], filesystems: [] };
  const daemons = getDaemonsAsFSOptions(state.daemons.items) || [];
  const isFetching = paramId && (paramId !== group.id || (group.id ? group.isFetching : true));
  return {
    group: groups.items[paramId],
    isFetching,
    groupId: paramId,
    tags: state.tags,
    daemons
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchGroup: (id) => dispatch(GroupsThunks.fetchGroup(id)),
    fetchDaemons: () => dispatch(DaemonsThunks.fetchIfNeeded()),
    fetchTags: () => dispatch(TagsThunks.fetchIfNeeded())
  };
};

// Redux container to component
const GroupViewPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupViewComponent);

export default GroupViewPage;
