// React
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import UUID from 'uuid-js';

// Thunks / Actions
import SitesThunks from '../../../modules/sites/sites.thunks.js';
import TagsThunks from '../../../modules/tags/tags.thunks.js';
import DaemonsThunks from '../../../modules/daemons/daemons.thunks.js';
import ToastsActions from '../../../modules/toasts/toasts.actions.js';

// Components
import VolumesBox from '../../common/boxes/volumes.box.component.js';
import VariablesBox from '../../common/boxes/variables.box.component.js';
import TagsSelector from '../../tags/tags.selector.component.js';

// Style
import './daemon.page.scss';

// Daemon Component
class DaemonComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ...props.daemon };
  }

  componentWillReceiveProps(nextProps) {
    this.state = { ...nextProps.daemon };
    this.forceUpdate();
  }

  componentDidMount() {
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
      $('.ui.form.daemon-form').form('clear');
      const volumesBox = this.refs.volumes;
      volumesBox.setState({ volumes: [] });
      const variablesBox = this.refs.variables;
      variablesBox.setState({ variables: [] });
      const tagsSelector = this.refs.tags;
      tagsSelector.setState({ tags: [] });
      this.refs.scrollbars.scrollTop();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    $('#sites-dropdown').dropdown({
      onChange: value => this.onChangeProperty(value, 'site')
    });
    $('#protocol-dropdown').dropdown();
    $('.ui.corner.label').popup();
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
        site: 'empty',
        name: 'empty',
        mountingPoint: 'empty',
        protocol: 'empty',
        host: 'empty',
        port: 'empty',
        timeout: 'empty'
      }
    };
    $('.ui.form.daemon-form').form(settings);
    $('.ui.form.daemon-form').form('validate form');
    return $('.ui.form.daemon-form').form('is valid');
  }

  onSave(event) {
    event.preventDefault();
    const volumesBox = this.refs.volumes;
    const variablesBox = this.refs.variables;
    const tagsSelector = this.refs.tags;
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    let formValid = volumesBox.isFormValid() & variablesBox.isFormValid() & this.isFormValid();
    if (formValid) {
      const daemon = { ...this.state };
      daemon.volumes = volumesBox.state.volumes;
      daemon.variables = variablesBox.state.variables;
      daemon.tags = tagsSelector.state.tags;
      this.props.onSave(daemon);
    }
  }

  renderSites(sites, daemon) {
    if (sites.isFetching || sites.didInvalidate) {
      return (
        <div className='ui loading fluid search selection dropdown'>
          Sites loading…<i className='dropdown icon' />
        </div>
      );
    } else {
      const items = Object.values(sites.items);
      return (
        <div id='sites-dropdown' className='ui fluid search selection dropdown'>
          <input type='hidden' name='site' defaultValue={daemon.site}/>
          <i className='dropdown icon' />
          <div className='default text'>Select Site</div>
          <div className='menu'>
            {items.map(site => <div className='item' key={site.id} data-value={site.id}>{site.title}</div>)}
          </div>
        </div>
      );
    }
  }

  renderCertificates(daemon) {
    if (daemon.protocol === 'https') {
      return (
        <div className='three fields'>
          <div className='field'>
            <label>CA</label>
            <textarea rows='10' name='ca' value={daemon.ca || ''} onChange={event => this.onChangeProperty(event.target.value, 'ca')}
              placeholder='The Certification Authority key Pem file' autoComplete='off' />
          </div>
          <div className='field'>
            <label>Cert</label>
            <textarea rows='10' name='cert' value={daemon.cert || ''} onChange={event => this.onChangeProperty(event.target.value, 'cert')}
              placeholder='The certificate Pem file' autoComplete='off' />
          </div>
          <div className='field'>
            <label>Key</label>
            <textarea rows='10' name='key' value={daemon.key || ''} onChange={event => this.onChangeProperty(event.target.value, 'key')}
              placeholder='The private key file' autoComplete='off' />
          </div>
        </div>
      );
    } else {
      return '';
    }
  }

  render() {
    const daemon = this.state;
    const isFetching = this.props.isFetching;
    const sites = this.props.sites;
    const tags = this.props.tags;
    const popup = `
      <div>
        Example: <strong>http://host:port/api/v1.x</strong>
        <br/>
        cAdvisor is used to retrieve monitoring stats (CPU, RAM, FS) on host where docker's daemon is running.
        <hr/>
        Docktor recommends to have a cAdvisor instance for each daemon.
      </div>
    `;
    return (
      <div className='flex layout vertical start-justified daemon-page'>
        <Scrollbars ref='scrollbars' className='flex ui dimmable'>
          <div className='flex layout horizontal around-justified'>
            {
              isFetching ?
                <div className='ui active dimmer'>
                  <div className='ui text loader'>Fetching</div>
                </div>
                :
                <div className='flex layout vertical start-justified daemon-details'>
                  <h1>
                    <Link to={'/daemons'}>
                      <i className='arrow left icon'/>
                    </Link>
                    {this.props.daemon.name || 'New Daemon'}
                    <button disabled={!daemon.id} onClick={() => this.props.onDelete(daemon)} className='ui red labeled icon button right-floated'>
                      <i className='trash icon'/>Remove
                    </button>
                  </h1>
                  <form className='ui form daemon-form'>
                    <input type='hidden' name='created' value={daemon.created || ''} onChange={event => this.onChangeProperty(event.target.value, 'created')} />
                    <input type='hidden' name='id' value={daemon.id || ''} onChange={event => this.onChangeProperty(event.target.value, 'id')} />

                    <div className='two fields'>
                      <div className='field required'>
                        <label>Name</label>
                        <input type='text' name='name' value={daemon.name || ''} onChange={event => this.onChangeProperty(event.target.value, 'name')}
                          placeholder='A unique name' autoComplete='off' />
                      </div>
                      <div className='field'>
                        <label>Description</label>
                        <textarea rows='4' name='description' value={daemon.description || ''} onChange={event => this.onChangeProperty(event.target.value, 'description')}
                          placeholder='A description of the daemon' autoComplete='off' />
                      </div>
                    </div>

                    <div className='fields'>
                      <div className='two wide field'>
                        <div className='large ui label form-label'>Tags</div>
                      </div>
                      <div className='fourteen wide field'>
                        <label>Tags of the daemon</label>
                        <TagsSelector tagsSelectorId={UUID.create(4).hex} selectedTags={daemon.tags || []} tags={tags} ref='tags' />
                      </div>
                    </div>

                    <div className='two fields'>
                      <div className='field required'>
                        <label>Site</label>
                        {this.renderSites(sites, daemon)}
                      </div>
                      <div className='field required'>
                        <label>Default data mounting point</label>
                        <input type='text' name='mountingPoint' value={daemon.mountingPoint || ''} onChange={event => this.onChangeProperty(event.target.value, 'mountingPoint')}
                          placeholder='/data' autoComplete='off' />
                      </div>
                    </div>

                    <div className='fields'>
                      <div className='two wide field'>
                        <div className='large ui label form-label'>cAdvisor</div>
                      </div>
                      <div className='fourteen wide field'>

                        <label>cAdvisor API URL</label>
                        <div className='ui corner labeled input'>
                          <input type='text' name='cadvisorApi' placeholder='http://host:port/api/v1.x'
                            value={daemon.cadvisorApi || ''} onChange={event => this.onChangeProperty(event.target.value, 'cadvisorApi')} autoComplete='off' />
                          <div className='ui corner label' data-html={popup} data-variation='inverted very wide'>
                            <i className='help circle link icon' />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='fields'>
                      <div className='two wide field'>
                        <div className='large ui label form-label'>Docker</div>
                      </div>
                      <div className='three wide field required'>
                        <label>Protocol</label>
                        <select id='protocol-dropdown' name='protocol' value={daemon.protocol || ''} onChange={event => this.onChangeProperty(event.target.value, 'protocol')}
                          className='ui fluid dropdown'>
                          <option value=''>Protocol</option>
                          <option value='http'>HTTP</option>
                          <option value='https'>HTTPS</option>
                        </select>
                      </div>
                      <div className='five wide field required'>
                        <label>Hostname</label>
                        <input type='text' name='host' value={daemon.host || ''} onChange={event => this.onChangeProperty(event.target.value, 'host')}
                          placeholder='Hostname or IP' autoComplete='off' />
                      </div>
                      <div className='three wide field required'>
                        <label>Port</label>
                        <input type='number' name='port' min='0' value={daemon.port || ''} onChange={event => this.onChangeProperty(event.target.value, 'port')}
                          placeholder='Port' autoComplete='off' />
                      </div>
                      <div className='three wide field required'>
                        <label>Timeout</label>
                        <input type='number' name='timeout' min='0' value={daemon.timeout || ''} onChange={event => this.onChangeProperty(event.target.value, 'timeout')}
                          placeholder='Timeout' autoComplete='off' />
                      </div>
                    </div>
                    {this.renderCertificates(daemon)}
                  </form>

                  <VolumesBox volumes={daemon.volumes} ref='volumes' boxId={UUID.create(4).hex}>
                    <p>These volumes are used to have common volumes mapping on all services deployed on this daemon. You can add / remove / modify volumes mapping when you deploy a new service on a group.</p>
                  </VolumesBox>

                  <VariablesBox variables={daemon.variables} ref='variables' boxId={UUID.create(4).hex}>
                    <p>These variables are used to have common variables environment into all services deployed on this daemon (Proxy, LDAP,...). You can add / remove / modify variables when you deploy a new service on a group.</p>
                  </VariablesBox>

                  <div className='flex button-form'>
                    <a className='ui fluid button' onClick={event => this.onSave(event)}>Save</a>
                  </div>
                </div>
            }
          </div>
        </Scrollbars>
      </div>
    );
  }
}
DaemonComponent.propTypes = {
  daemon: React.PropTypes.object,
  isFetching: React.PropTypes.bool,
  daemonId: React.PropTypes.string,
  sites: React.PropTypes.object,
  tags: React.PropTypes.object,
  fetchDaemon: React.PropTypes.func.isRequired,
  fetchSites: React.PropTypes.func.isRequired,
  fetchTags: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func,
  onDelete: React.PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const daemons = state.daemons;
  const daemon = daemons.selected;
  const emptyDaemon = { volumes: [], variables: [], tags: [] };
  const isFetching = paramId && (paramId !== daemon.id || (daemon.id ? daemon.isFetching : true));
  return {
    daemon: daemons.items[paramId] || emptyDaemon,
    isFetching,
    daemonId: paramId,
    sites: state.sites,
    tags: state.tags
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchDaemon: (id) => dispatch(DaemonsThunks.fetchDaemon(id)),
    fetchSites: () => dispatch(SitesThunks.fetchIfNeeded()),
    fetchTags: () => dispatch(TagsThunks.fetchIfNeeded()),
    onSave: (daemon) => dispatch(DaemonsThunks.saveDaemon(daemon)),
    onDelete: daemon => {
      const callback = () => dispatch(DaemonsThunks.deleteDaemon(daemon.id));
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
