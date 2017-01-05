// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Scrollbars } from 'react-custom-scrollbars';
import UUID from 'uuid-js';

// Thunks / Actions
import SitesThunks from '../../../modules/sites/sites.thunks.js';
import TagsThunks from '../../../modules/tags/tags.thunks.js';
import ServicesThunks from '../../../modules/services/services.thunks.js';
import ToastsActions from '../../../modules/toasts/toasts.actions.js';

// Components
import CommandsBox from '../../common/boxes/commands.box.component.js';
import URLsBox from '../../common/boxes/urls.box.component.js';
import JobsBox from '../../common/boxes/jobs.box.component.js';
import TagsSelector from '../../tags/tags.selector.component.js';
import ImageTab from './details/image.tab.js';

// Style
import './service.page.scss';

// Service Component
class ServiceComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...props.service };
  }

  componentWillReceiveProps(nextProps) {
    this.state = { ...nextProps.service };
    this.forceUpdate();
  }

  componentDidMount() {
    $('.ui.pointing.two.item.menu .item').tab();
    const serviceId = this.props.serviceId;

    // Tags must be fetched before the service for the UI to render correctly
    this.props.fetchTags().then(() => {
      if (serviceId) {
        // Fetch when known service
        this.props.fetchService(serviceId);
      }
    });

    if (!serviceId) {
      // New service
      $('.ui.form.service-form').form('clear');
      const tagsSelector = this.refs.tags;
      tagsSelector.setState({ tags: [] });
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

  isFormValid() {
    const settings = {
      fields: {
        title: 'empty',
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
    const imagesBoxes = this.refs.images;
    const tagsSelector = this.refs.tags;
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    let formValid = commandsBox.isFormValid() & urlsBox.isFormValid() & jobsBox.isFormValid() & imagesBoxes.isFormValid() & this.isFormValid();
    if (formValid) {
      const service = {
        title: this.refs.title.value,
        created: this.refs.created.value,
        id: this.refs.id.value,
        urls: urlsBox.state.urls,
        jobs: jobsBox.state.jobs,
        commands: commandsBox.state.commands,
        tags: tagsSelector.state.tags,
        images: imagesBoxes.getImages()
      };
      this.props.onSave(service);
    }
  }

  renderGeneralTab(service) {
    return (
      <div className='ui tab segment padded active' data-tab='general'>
        <form className='ui form service-form'>
          <input type='hidden' name='created' ref='created' defaultValue={service.created} />
          <input type='hidden' name='id' ref='id' defaultValue={service.id} />
          <div className='fields'>
            <div className='sixteen wide field required'>
              <label>
                Title
              </label>
              <input type='text' ref='title' name='title' defaultValue={service.title} placeholder='A unique title' autoComplete='off' />
            </div>
          </div>

          <div className='fields'>
            <div className='two wide field'>
              <div className='large ui label form-label'>Tags</div>
            </div>
            <div className='fourteen wide field'>
              <label>Tags of the service</label>
              <TagsSelector tagsSelectorId={UUID.create(4).hex} selectedTags={service.tags || []} tags={this.props.tags} ref='tags' />
            </div>
          </div>
        </form>

        <URLsBox urls={service.urls ||  []} ref='urls' boxId={UUID.create(4).hex}>
          <p>These URLs are used to generate quick access to a service on a group.</p>
        </URLsBox>

        <JobsBox jobs={service.jobs ||  []} ref='jobs' boxId={UUID.create(4).hex}>
          <p>These Jobs are used to make checks on the service asynchronously.</p>
        </JobsBox>

        <CommandsBox commands={service.commands ||  []} ref='commands' boxId={UUID.create(4).hex}>
          <p>These commands will be available for this service to the users/admins of a group.</p>
        </CommandsBox>
      </div>
    );
  }

  renderImagesTab(service) {
    return (
      <div className='ui tab segment nonpadded' data-tab='images'>
        <ImageTab scrollbars={this.refs.scrollbars} images={service.images} ref='images' />
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
      <div className='flex layout vertical start-justified service-page'>
        <Scrollbars autoHide ref='scrollbars' className='flex ui dimmable'>
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
                      <i className='arrow left icon' />
                    </Link>
                    {this.props.service.title || 'New Service'}
                    <button disabled={!service.id} onClick={() => this.props.onDelete(service)} className='ui red labeled icon button right-floated'>
                      <i className='trash icon' />Remove
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
  tags: React.PropTypes.object,
  isFetching: React.PropTypes.bool,
  serviceId: React.PropTypes.string,
  fetchService: React.PropTypes.func.isRequired,
  fetchTags: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func,
  onDelete: React.PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const services = state.services;
  const service = services.selected;
  const emptyService = { commands: [], urls: [], jobs: [], images: [], tags: [] };
  const isFetching = paramId && (paramId !== service.id || (service.id ? service.isFetching : true));
  return {
    service: services.items[paramId] || emptyService,
    isFetching,
    serviceId: paramId,
    tags: state.tags
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchService: id => dispatch(ServicesThunks.fetchService(id)),
    fetchTags: () => dispatch(TagsThunks.fetchIfNeeded()),
    onSave: service => dispatch(ServicesThunks.saveService(service)),
    onDelete: service => {
      const callback = () => dispatch(ServicesThunks.deleteService(service.id));
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
