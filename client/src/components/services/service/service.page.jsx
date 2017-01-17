// React
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Form, Input, Button, Dimmer, Loader, Label, Icon, Menu, Segment } from 'semantic-ui-react';
import classNames from 'classnames';
import Joi from 'joi-browser';

// Thunks / Actions
import TagsThunks from '../../../modules/tags/tags.thunks';
import ServicesThunks from '../../../modules/services/services.thunks';
import ToastsActions from '../../../modules/toasts/toasts.actions';

// Components
import CommandsBox from '../../common/boxes/commands.box.component';
import URLsBox from '../../common/boxes/urls.box.component';
import JobsBox from '../../common/boxes/jobs.box.component';
import TagsSelector from '../../tags/tags.selector.component';
import ImageTab from './details/image.tab';

import { parseError } from '../../../modules/utils/forms';

// Style
import './service.page.scss';

// Service Component
class ServiceComponent extends React.Component {

  state = { errors: { details: [], fields: {} }, service: {}, tags:[], selected: 'general' }

  schema = Joi.object().keys({
    title: Joi.string().trim().required().label('Title'),
  })

  componentWillMount = () => {
    this.setState({ service: { ...this.props.service }, errors: { details: [], fields:{} } });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ service: { ...nextProps.service }, errors: { details: [], fields:{} } });
  }

  componentDidMount() {
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
      const tagsSelector = this.refs.tags;
      tagsSelector.setState({ tags: [] });
      this.refs.scrollbars && this.refs.scrollbars.scrollTop();
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.isFetching) {
      this.refs.scrollbars && this.refs.scrollbars.scrollTop();
    }
  }

  handleChange = (e, { name, value }) => {
    const { service, errors } = this.state;
    const state = {
      service: { ...service, [name]:value },
      errors: { details: [...errors.details], fields: { ...errors.fields } }
    };
    delete state.errors.fields[name];
    this.setState(state);
  }

  toggleTab = (tab) => {
    const selected = tab;
    this.setState({ selected });
  }

  isFormValid = () => {
    const { error } = Joi.validate(this.state.service, this.schema, { abortEarly: false, allowUnknown: true });
    error && this.setState({ errors: parseError(error) });
    return !Boolean(error);
  }

  onSave = (e) => {
    e.preventDefault();
    const commandsBox = this.refs.commands;
    const urlsBox = this.refs.urls;
    const jobsBox = this.refs.jobs;
    const imagesBoxes = this.refs.images;
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    let formValid = this.isFormValid() & commandsBox.isFormValid() & urlsBox.isFormValid() & jobsBox.isFormValid() & imagesBoxes.isFormValid();
    if (formValid) {
      const service = { ...this.state.service };
      service.urls = urlsBox.state.urls;
      service.jobs = jobsBox.state.jobs;
      service.commands = commandsBox.state.commands;
      service.images = imagesBoxes.getImages();
      this.props.onSave(service);
    }
  }

  renderGeneralTab = (service, selected, tags, errors) => {
    const classes = classNames('tab', { active: selected === 'general' });
    return (
      <Segment padded className={classes}>
        <Form className='service-form'>
          <Input type='hidden' name='created' value={service.created || ''} onChange={this.handleChange} />
          <Input type='hidden' name='id' value={service.id || ''} onChange={this.handleChange} />

          <Form.Input required label='Title' name='title' value={service.title || ''} onChange={this.handleChange}
            type='text' placeholder='A unique title' autoComplete='off' error={errors.fields['title']}
          />

          <Form.Group>
            <Form.Field width='two'>
              <Label size='large' className='form-label' content='Tags' />
            </Form.Field>
            <Form.Field width='fourteen'>
              <label>Tags of the service</label>
              <TagsSelector selectedTags={service.tags || []} tags={tags} onChange={this.handleChange} ref='tags' />
            </Form.Field>
          </Form.Group>
        </Form>

        <URLsBox urls={service.urls ||  []} ref='urls'>
          <p>These URLs are used to generate quick access to a service on a group.</p>
        </URLsBox>

        <JobsBox jobs={service.jobs ||  []} ref='jobs'>
          <p>These Jobs are used to make checks on the service asynchronously.</p>
        </JobsBox>

        <CommandsBox commands={service.commands ||  []} ref='commands'>
          <p>These commands will be available for this service to the users/admins of a group.</p>
        </CommandsBox>
      </Segment>
    );
  }

  renderImagesTab = (service, selected) => {
    const classes = classNames('tab nonpadded', { active: selected === 'images' });
    return (
      <Segment className={classes}>
        <ImageTab scrollbars={this.refs.scrollbars} images={service.images} ref='images' />
      </Segment>
    );
  }

  renderTabular = (service, selected, tags, errors) => {
    return (
      <div className='flex tabular-details'>
        <Menu widths='two' pointing>
          <Menu.Item active={selected === 'general'} onClick={() => this.toggleTab('general')}>General</Menu.Item>
          <Menu.Item active={selected === 'images'} onClick={() => this.toggleTab('images')}>Images</Menu.Item>
        </Menu>
        {this.renderGeneralTab(service, selected, tags, errors)}
        {this.renderImagesTab(service, selected)}
      </div>
    );
  }

  render = () => {
    const { service, selected, errors } = this.state;
    const { isFetching, tags } = this.props;
    return (
      <div className='flex layout vertical start-justified service-page'>
        <Scrollbars autoHide ref='scrollbars' className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified'>
            {isFetching && <Dimmer active><Loader size='big' content='Fetching'/></Dimmer>}
            <div className='flex layout vertical start-justified service-details'>
              <h1>
                <Link to={'/services'}>
                  <Icon name='arrow left' fitted/>
                </Link>
                {this.props.service.title || 'New Service'}
                <Button size='large' content='Remove' color='red' labelPosition='left' icon='trash'
                  disabled={!service.id} onClick={() => this.props.onDelete(service)} className='right-floated'
                />
              </h1>
              {this.renderTabular(service, selected, tags, errors)}
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
    fetchService: id => dispatch(ServicesThunks.fetch(id)),
    fetchTags: () => dispatch(TagsThunks.fetchIfNeeded()),
    onSave: service => dispatch(ServicesThunks.save(service, push('/services'))),
    onDelete: service => {
      const callback = () => dispatch(ServicesThunks.delete(service, push('/services')));
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
