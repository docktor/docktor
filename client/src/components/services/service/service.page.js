// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Scrollbars } from 'react-custom-scrollbars';
import { WithContext as ReactTags } from 'react-tag-input';

// Thunks / Actions
import SitesThunks from '../../../modules/sites/sites.thunks.js';
import ServiceThunks from '../../../modules/services/service/service.thunks.js';
import ServiceActions from '../../../modules/services/service/service.actions.js';
import ToastsActions from '../../../modules/toasts/toasts.actions.js';


// Components
import CommandsBox from '../../common/boxes/commands.box.component.js';
import URLsBox from '../../common/boxes/urls.box.component.js';
import JobsBox from '../../common/boxes/jobs.box.component.js';
import ImageDetails from './images-details/image.component.js';

// Style
import './service.page.scss';

// Service Component
class ServiceComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...props.service, tags: [] };
  }

  componentWillReceiveProps(nextProps) {
    const tags = [];
    if (nextProps.service.tags) {
      nextProps.service.tags.forEach((tag, index) => {
        tags.push({
          id: index,
          text: tag
        });
      });
    }
    this.state = { ...nextProps.service, tags };
    this.forceUpdate();
  }

  componentDidMount() {
    $('.ui.pointing.two.item.menu .item').tab();
    const serviceId = this.props.serviceId;
    if (serviceId) {
      // Fetch when known service
      this.props.fetchService(serviceId);
    } else {
      // New service
      $('.ui.form.service-form').form('clear');
      this.refs.scrollbars.scrollTop();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    $('.ui.pointing.two.item.menu .item').tab();
    if (prevProps.isFetching) {
      this.refs.scrollbars.scrollTop();
    }
  }

  onChangeProperty(value, property) {
    this.setState({ [property]: value });
  }

  handleDeleteTag(i) {
    let tags = this.state.tags;
    tags.splice(i, 1);
    this.setState({ tags });
  }
  handleAddTag(tag) {
    let tags = this.state.tags;
    tags.push({
      id: tags.length + 1,
      text: tag
    });
    this.setState({ tags });
  }
  handleDragTag(tag, currPos, newPos) {
    let tags = this.state.tags;

      // mutate array
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

      // re-render
    this.setState({ tags });
  }

  isFormValid() {
    const settings = {
      fields:{
        title:'empty',
      }
    };
    $('.ui.form.service-form').form(settings);
    $('.ui.form.service-form').form('validate form');
    return $('.ui.form.service-form').form('is valid');
  }

  onSave(event) {
    event.preventDefault();
    const commandsBox = this.refs.commands;
    const urlsBox = this.refs.urls;
    const jobsBox = this.refs.jobs;
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    let formValid = commandsBox.isFormValid() & urlsBox.isFormValid() & jobsBox.isFormValid() & this.isFormValid();
    if (formValid) {
      const tags = this.state.tags.map(tag => tag.text);
      const service = {
        title: this.refs.title.value,
        created: this.refs.created.value,
        id: this.refs.id.value,
        urls: urlsBox.state.urls,
        jobs: jobsBox.state.jobs,
        commands: commandsBox.state.commands,
        tags: tags,
      };
      console.log(service);
      //this.props.onSave(service);
    }
  }

  renderGeneralTab(service) {
    return (
      <div className='ui tab segment active' data-tab='general'>
        <form className='ui form service-form'>
          <input type='hidden' name='created' ref='created' defaultValue={service.created}/>
          <input type='hidden' name='id' ref='id' defaultValue={service.id}/>
          <div className='fields'>
          <div className='sixteen wide field required'>
            <label>
              Title
            </label>
            <input type='text' ref='title' name='title' defaultValue={service.title} placeholder='A unique title' autoComplete='off' />
          </div>
          </div>
        </form>
        <URLsBox urls={service.urls || []} ref='urls'>
          <p>These URLs are used to generate quick access to a service on a group.</p>
        </URLsBox>
        <JobsBox jobs={service.jobs || []} ref='jobs'>
          <p>These Jobs are used to make checks on the service asynchronously.</p>
        </JobsBox>
        <CommandsBox commands={service.commands || []} ref='commands'>
          <p>These commands will be available for this service to the users/admins of a group.</p>
        </CommandsBox>
        <div className='tags'>
          <div className='large ui label form-label'>Tags</div>
          <ReactTags tags={this.state.tags}
            handleDelete={(i) => this.handleDeleteTag(i)}
            handleAddition={(tag) => this.handleAddTag(tag)}
            handleDrag={(tag, currPos, newPos) => this.handleDragTag(tag, currPos, newPos)} />
        </div>
      </div>
    );
  }

  renderImagesTab(service) {
    return (
      <div className='ui tab segment nonpadded' data-tab='images'>
        <ImageDetails images={service.images} />
      </div>
    );
  }

  renderTabular(service) {
    return (
      <div className='flex tabular-details'>
        <div className='ui pointing two item menu'>
          <a className='item active' data-tab='general'>General</a>
          <a className='item' data-tab='images'>Images</a>
        </div>
        {this.renderImagesTab(service)}
        {this.renderGeneralTab(service)}
      </div>
    );
  }

  render() {
    const service = this.state;
    const isFetching = this.props.isFetching;
    return (
      <div className='flex layout vertical start-justified'>
        <Scrollbars ref='scrollbars' className='flex ui dimmable'>
           <div className='flex layout horizontal around-justified'>
              {
                isFetching ?
                  <div className='ui active dimmer'>
                    <div className='ui text loader'>Fetching</div>
                  </div>
                :
                  <div className='flex layout vertical start-justified service-details'>
                    <h1>
                      <Link to={'/services'}>
                        <i className='arrow left icon'></i>
                      </Link>
                      {this.props.service.title || 'New Service'}
                      <button disabled={!service.id} onClick={() => this.props.onDelete(service)} className='ui red button right-floated'>
                        <i className='trash icon'></i>Remove
                      </button>
                    </h1>
                    {this.renderTabular(service)}
                    <div className='flex button-form'>
                      <a className='ui fluid button' onClick={(event) => this.onSave(event)}>Save</a>
                    </div>
                  </div>
              }
            </div>
          </Scrollbars>
      </div>
    );
  }
}
ServiceComponent.propTypes = {
  service: React.PropTypes.object,
  isFetching: React.PropTypes.bool,
  serviceId: React.PropTypes.string,
  fetchService: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func,
  onDelete: React.PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const service = state.service;
  const emptyService = { commands: [], urls: [], jobs: [], images:[] };
  return {
    service: paramId ? service.item : emptyService,
    isFetching: service.isFetching,
    serviceId: paramId
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchService: id => dispatch(ServiceThunks.fetchService(id)),
    onSave: serviceId => dispatch(ServiceThunks.saveService(service)),
    onDelete: service => {
      const callback = () => dispatch(ServiceThunks.deleteService(service.id));
      dispatch(ToastsActions.confirmDeletion(service.title, callback));
    }
  };
};

// Redux container to Sites component
const ServicePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ServiceComponent);

export default ServicePage;
