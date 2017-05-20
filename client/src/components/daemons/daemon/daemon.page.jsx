// React
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Form, Input, Button, Dimmer, Loader, Label, Icon, Popup, Grid } from 'semantic-ui-react';
import Joi from 'joi-browser';

// Thunks / Actions
import SitesThunks from '../../../modules/sites/sites.thunks';
import TagsThunks from '../../../modules/tags/tags.thunks';
import DaemonsThunks from '../../../modules/daemons/daemons.thunks';
import ToastsActions from '../../../modules/toasts/toasts.actions';

// Components
import VolumesBox from '../../common/boxes/volumes.box.component';
import VariablesBox from '../../common/boxes/variables.box.component';
import TagsSelector from '../../tags/tags.selector.component';

import { parseError } from '../../../modules/utils/forms';

// Style
import './daemon.page.scss';

// Daemon Component
class DaemonComponent extends React.Component {

  state = { errors: { details: [], fields: {} }, daemon: {}, tags:[] }

  schema = Joi.object().keys({
    site: Joi.string().trim().required().label('Site'),
    name: Joi.string().trim().required().label('Name'),
    mountingPoint: Joi.string().trim().required().label('Mounting Point'),
    protocol: Joi.string().trim().required().label('Protocol'),
    host: Joi.string().trim().required().label('Host'),
    port: Joi.number().required().label('Port'),
    timeout: Joi.number().required().label('Timeout')
  })

  componentWillMount = () => {
    const daemon = this.props.daemon;
    const active = typeof daemon.active !== 'undefined' ? daemon.active : true;
    this.setState({ daemon: { ...daemon, active }, errors: { details: [], fields:{} } });
  }

  componentWillReceiveProps = (nextProps) => {
    const daemon = nextProps.daemon;
    const active = typeof daemon.active !== 'undefined' ? daemon.active : true;
    this.setState({ daemon: { ...daemon, active }, errors: { details: [], fields:{} } });
  }

  componentDidMount = () => {
    const daemonId = this.props.daemonId;

    // Tags must be fetched before the daemon for the UI to render correctly
    Promise.all([
      this.props.fetchSites(),
      this.props.fetchTags()
    ]).then(() => {
      if (daemonId) {
        // Fetch when known daemon
        this.props.fetchDaemon(daemonId);
      }
    });

    if (!daemonId) {
      // New daemon
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

  handleChange = (_, { name, value, checked }) => {
    const { daemon, errors } = this.state;
    const state = {
      daemon: { ...daemon, [name]:value || checked },
      errors: { details: [...errors.details], fields: { ...errors.fields } }
    };
    delete state.errors.fields[name];
    this.setState(state);
  }

  isFormValid = () => {
    const { error } = Joi.validate(this.state.daemon, this.schema, { abortEarly: false, allowUnknown: true });
    error && this.setState({ errors: parseError(error) });
    return !Boolean(error);
  }

  onSave = (e) => {
    e.preventDefault();
    const volumesBox = this.refs.volumes;
    const variablesBox = this.refs.variables;
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    let formValid = this.isFormValid() & volumesBox.isFormValid() & variablesBox.isFormValid();
    if (formValid) {
      const daemon = { ...this.state.daemon };
      daemon.volumes = volumesBox.state.volumes;
      daemon.variables = variablesBox.state.variables;
      daemon.port = parseInt(daemon.port);
      daemon.timeout = parseInt(daemon.timeout);
      this.props.onSave(daemon);
    }
  }

  renderSites = (sites, daemon, errors) => {
    const options = sites.map(site => {return { text: site.title, value: site.id };});
    return (
      <Form.Dropdown name='site' label='Site' fluid value={daemon.site} selection placeholder='Select a site...' autoComplete='off' options={options || []}
        required onChange={this.handleChange} loading={!options} error={errors.fields['site']} width='four'
      />
    );
  }

  renderProtocol = (daemon, errors) => {
    const options = [
      { text: 'HTTP', value: 'http' },
      { text: 'HTTPS', value: 'https' }
    ];
    return (
      <Form.Dropdown name='protocol' label='Protocol' fluid value={daemon.protocol} selection placeholder='Select a protocol...' autoComplete='off' options={options}
        required onChange={this.handleChange} error={errors.fields['protocol']} width='three'
      />
    );
  }

  renderCertificates = (daemon) => {
    return (
      <Form.Group widths='three'>
        <Form.TextArea label='CA' name='ca' value={daemon.ca || ''} onChange={this.handleChange}
          rows='10' placeholder='The Certification Authority key Pem file' autoComplete='off'
        />
        <Form.TextArea label='Cert' name='cert' value={daemon.cert || ''} onChange={this.handleChange}
          rows='10' placeholder='The certificate Pem file' autoComplete='off'
        />
        <Form.TextArea label='Key' name='key' value={daemon.key || ''} onChange={this.handleChange}
          rows='10' placeholder='The private key file' autoComplete='off'
        />
      </Form.Group>
    );
  }

  render = () => {
    const { daemon, errors } = this.state;
    const { isFetching, sites, tags } = this.props;
    const certificates = daemon.protocol === 'https';
    const popup = (
      <div>
        e.g., <strong>http://host:port/api/v1.x</strong>
        <br/>
        cAdvisor is used to retrieve monitoring stats (CPU, RAM, FS) on host where docker's daemon is running.
        <hr/>
        Docktor recommends to have a cAdvisor instance for each daemon.
      </div>
    );
    return (
      <div className='flex layout vertical start-justified daemon-page'>
        <Scrollbars autoHide ref='scrollbars' className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified'>
            {isFetching && <Dimmer active><Loader size='big' content='Fetching'/></Dimmer>}
            <div className='flex layout vertical start-justified daemon-details'>
              <h1>
                <Link to={'/daemons'}>
                  <Icon name='arrow left' fitted/>
                </Link>
                {this.props.daemon.name || 'New Daemon'}
                {daemon.id && <Button size='large' content='Remove' color='red' labelPosition='left' icon='trash'
                  onClick={() => this.props.onDelete(daemon)} className='right-floated' />}
              </h1>
              <Form className='daemon-form'>
                <Input type='hidden' name='created' value={daemon.created || ''} onChange={this.handleChange} />
                <Input type='hidden' name='id' value={daemon.id || ''} onChange={this.handleChange} />

                <Grid columns='equal' as={Form.Group}>
                  <Grid.Row>
                    <Grid.Column>
                      <Form.Input required label='Name' name='name' value={daemon.name || ''} onChange={this.handleChange}
                        type='text' placeholder='e.g., myDaemon' autoComplete='off' error={errors.fields['name']} />
                      <Form.Checkbox label='Mark this daemon as active' name='active' toggle checked={daemon.active} className='field toggle-button' onChange={this.handleChange} />
                    </Grid.Column>

                    <Grid.Column>
                      <Form.TextArea label='Description' name='description' value={daemon.description || ''} onChange={this.handleChange}
                        rows='4' placeholder='e.g., This daemon is used for...' autoComplete='off' />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>

                <Form.Group>
                  {this.renderSites(sites, daemon, errors)}
                  <Form.Input required label='Default data mounting point' name='mountingPoint' value={daemon.mountingPoint || ''} onChange={this.handleChange}
                    type='text' placeholder='e.g., /data' autoComplete='off' error={errors.fields['mountingPoint']} width='twelve'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Field width='two'>
                    <Label size='large' className='form-label' content='Tags' />
                  </Form.Field>
                  <Form.Field width='fourteen'>
                    <label>Tags of the daemon</label>
                    <TagsSelector selectedTags={daemon.tags || []} tags={tags} onChange={this.handleChange} ref='tags' />
                  </Form.Field>
                </Form.Group>

                <Form.Group widths='two'>
                  <Form.Field width='two'>
                    <Label size='large' className='form-label' content='cAdvisor' />
                  </Form.Field>
                  <Form.Input label='cAdvisor API URL' name='cadvisorApi' value={daemon.cadvisorApi || ''} onChange={this.handleChange}
                    type='text' autoComplete='off' labelPosition='right corner' width='fourteen'>
                    <input placeholder='e.g., http://host:port/api/v1.x' />
                    <Popup hoverable={true} trigger={<Label corner='right'><Icon link name='help circle'/></Label>} inverted wide='very'>{popup}</Popup>
                  </Form.Input>
                </Form.Group>

                <Form.Group>
                  <div className='two wide field'>
                    <div className='large ui label form-label'>Docker</div>
                  </div>
                  {this.renderProtocol(daemon, errors)}
                  <Form.Input required label='Hostname or IP' name='host' value={daemon.host || ''} onChange={this.handleChange}
                    type='text' placeholder='e.g., localhost or 127.0.0.1' autoComplete='off' error={errors.fields['host']} width='five'
                  />
                  <Form.Input required label='Port' min='0' name='port' value={daemon.port || ''} onChange={this.handleChange}
                    type='number' placeholder='e.g., 2375' autoComplete='off' error={errors.fields['port']} width='three'
                  />
                  <Form.Input required label='Timeout (in sec)' min='0' name='timeout' value={daemon.timeout || ''} onChange={this.handleChange}
                    type='number' placeholder='e.g., 3000' autoComplete='off' error={errors.fields['timeout']} width='three'
                  />
                </Form.Group>
                {certificates && this.renderCertificates(daemon, errors)}
              </Form>

              <VolumesBox volumes={daemon.volumes || []} ref='volumes'>
                <p>These volumes are used to have common volumes mapping on all services deployed on this daemon. You can add / remove / modify volumes mapping when you deploy a new service on a group.</p>
              </VolumesBox>

              <VariablesBox variables={daemon.variables || []} ref='variables'>
                <p>These variables are used to have common variables environment into all services deployed on this daemon (Proxy, LDAP,...). You can add / remove / modify variables when you deploy a new service on a group.</p>
              </VariablesBox>

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
DaemonComponent.propTypes = {
  daemon: PropTypes.object,
  isFetching: PropTypes.bool,
  daemonId: PropTypes.string,
  sites: PropTypes.array,
  tags: PropTypes.object,
  fetchDaemon: PropTypes.func.isRequired,
  fetchSites: PropTypes.func.isRequired,
  fetchTags: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  onDelete: PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const daemons = state.daemons;
  const daemon = daemons.selected;
  const emptyDaemon = { volumes: [], variables: [], tags: [] };
  const isFetching = paramId && (paramId !== daemon.id);
  const sites = Object.values(state.sites.items);
  return {
    daemon: daemons.items[paramId] || emptyDaemon,
    isFetching,
    daemonId: paramId,
    sites,
    tags: state.tags
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchDaemon: id => dispatch(DaemonsThunks.fetch(id)),
    fetchSites: () => dispatch(SitesThunks.fetchAll()),
    fetchTags: () => dispatch(TagsThunks.fetchAll()),
    onSave: daemon => dispatch(
      DaemonsThunks.save(daemon, (id) => push('/daemons/' + id), ToastsActions.confirmSave(`Daemon "${daemon.name}"`))
    ),
    onDelete: daemon => {
      const callback = () => dispatch(DaemonsThunks.delete(daemon, () => push('/daemons')));
      dispatch(ToastsActions.confirmDeletion(daemon.name, callback));
    }
  };
};

// Redux container to Sites component
const DaemonPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(DaemonComponent);

export default DaemonPage;
