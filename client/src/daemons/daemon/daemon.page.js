// React
import React from 'react';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { WithContext as ReactTags } from 'react-tag-input';

// Thunks / Actions
import SitesThunks from '../../sites/sites.thunks.js';
import DaemonThunks from './daemon.thunks.js';
import DaemonActions from './daemon.actions.js';
import ToastsActions from '../../toasts/toasts.actions.js';


// Components
import VolumesBox from '../../common/volumes.box.component.js';
import VariablesBox from '../../common/variables.box.component.js';

// Style
import './daemon.page.scss';

// Daemon Component
class DaemonComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { chosenProtocol: null, tags: [] };
  }

  componentWillReceiveProps(nextProps) {
    const tags = [];
    if (nextProps.daemon.item.tags) {
      nextProps.daemon.item.tags.forEach((tag, index) => {
        tags.push({
          id: index,
          text: tag
        });
      });
    }
    this.setState({ tags });
  }

  componentDidMount() {
    const daemonId = this.props.daemonId;
    this.props.fetchSites();
    if (daemonId && daemonId !== '') {
      // Fetch when known daemon
      this.props.fetchDaemon(daemonId);
    } else {
      // New daemon
      this.props.newDaemon();
      $('.ui.form.daemon-form').form('clear');
      const volumesBox = this.refs.volumes;
      volumesBox.setState({ volumes: [] });
      const variablesBox = this.refs.variables;
      variablesBox.setState({ variables: [] });
      this.refs.scrollbars.scrollTop();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    $('#sites-dropdown').dropdown();
    $('#protocol-dropdown').dropdown();
    $('.ui.corner.label').popup();
  }

  onChangeProtocol(event) {
    this.setState({ chosenProtocol: event.target.value });
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
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    let formValid = volumesBox.isFormValid() & variablesBox.isFormValid() & this.isFormValid();
    if (formValid) {
      const tags = this.state.tags.map(tag => tag.text);
      const daemon = {
        name: this.refs.name.value,
        site: this.refs.site.value,
        description: this.refs.description.value,
        cadvisorApi: this.refs.cadvisorApi.value,
        mountingPoint: this.refs.mountingPoint.value,
        protocol: this.refs.protocol.value,
        host: this.refs.host.value,
        port: this.refs.port.value,
        timeout: this.refs.timeout.value,
        ca: this.refs.ca ? this.refs.ca.value : '',
        cert: this.refs.cert ? this.refs.cert.value : '',
        key: this.refs.key ? this.refs.key.value : '',
        created: this.refs.created.value,
        id: this.refs.id.value,
        volumes: volumesBox.state.volumes,
        variables: variablesBox.state.variables,
        tags: tags,
      };
      this.props.onSave(daemon);
    }
  }

  renderSites(sites, defaultSite) {
    if (sites.isFetching || sites.didInvalidate) {
      return (
        <div className='ui loading fluid search selection dropdown'>
          Sites loading...<i className='dropdown icon'></i>
        </div>
      );
    } else {
      const items = Object.values(sites.items);
      return (
        <div id='sites-dropdown' className='ui fluid search selection dropdown'>
          <input type='hidden' name='site' ref='site' value={defaultSite} />
          <i className='dropdown icon'></i>
          <div className='default text'>Select Site</div>
          <div className='menu'>
            {items.map(site => <div className='item' key={site.id} data-value={site.id}>{site.title}</div>)}
          </div>
        </div>
      );
    }
  }

  renderCertificates(item, chosenProtocol) {
    if (item.protocol === 'https' || chosenProtocol === 'https') {
      return (
        <div className='three fields'>
          <div className='field'>
            <label>CA</label>
            <textarea rows='10' ref='ca' name='ca' defaultValue={item.ca} placeholder='The Certification Authority key Pem file' autoComplete='off' />
          </div>
          <div className='field'>
            <label>Cert</label>
            <textarea rows='10' ref='cert' name='cert' defaultValue={item.cert} placeholder='The certificate Pem file' autoComplete='off' />
          </div>
          <div className='field'>
            <label>Key</label>
            <textarea rows='10' ref='key' name='key' defaultValue={item.key} placeholder='The private key file' autoComplete='off' />
          </div>
        </div>
      );
    } else {
      return '';
    }
  }

  render() {
    const { item, isFetching, didInvalidate } = this.props.daemon;
    const sites = this.props.sites;
    const chosenProtocol = this.state.chosenProtocol;
    const popup = `
      <div>
        Example: <strong>http://host:port/api/v1.x</strong>
        <br/>
        cAdvisor is used to retrieve monitoring stats (CPU, RAM, FS) on host where docker's daemon is running.
        <hr/>
        Docktor recommands to have a cAdvisor instance for each daemon.
      </div>
    `;
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
                <div className='flex layout vertical start-justified daemon-details'>
                  <h1><a onClick={() => this.props.backTo()}><i className='arrow left icon'></i></a>{item.name || 'New Daemon'} <button disabled={!item.id} onClick={() => this.props.onDelete(item)} className='ui red button right-floated'><i className='trash icon'></i>Remove</button></h1>
                  <form className='ui form daemon-form'>
                    <input type='hidden' name='created' ref='created' defaultValue={item.created} />
                    <input type='hidden' name='id' ref='id' defaultValue={item.id} />
                    <div className='two fields'>
                      <div className='field required'>
                        <label>
                          Name
                          </label>
                        <input type='text' ref='name' name='name' defaultValue={item.name} placeholder='A unique name' autoComplete='off' />
                      </div>
                      <div className='field'>
                        <label>Description</label>
                        <textarea rows='4' ref='description' name='description' defaultValue={item.description} placeholder='A description of the daemon' autoComplete='off' />
                      </div>
                    </div>
                    <div className='two fields'>
                      <div className='field required'>
                        <label>
                          Site
                          </label>
                        {this.renderSites(sites, item.site)}
                      </div>
                      <div className='field required'>
                        <label>
                          Default data mounting point
                          </label>
                        <input type='text' ref='mountingPoint' name='mountingPoint' placeholder='Mounting point like /data' defaultValue={item.mountingPoint} autoComplete='off' />
                      </div>
                    </div>

                    <div className='five fields'>
                      <div className='two wide field'>
                        <div className='large ui label form-label'>cAdvisor</div>
                      </div>
                      <div className='fourteen wide field'>

                        <label>cAdvisor Api Url</label>
                        <div className='ui corner labeled input'>
                          <input type='text' ref='cadvisorApi' name='cadvisorApi' placeholder='http://host:port/api/v1.x' defaultValue={item.cadvisorApi} autoComplete='off' />
                          <div className='ui corner label' data-html={popup} data-variation='inverted very wide'>
                            <i className='help circle link icon' ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='five fields'>
                      <div className='two wide field'>
                        <div className='large ui label form-label'>Docker</div>
                      </div>
                      <div className='two wide field required'>
                        <label>Protocol</label>
                        <select id='protocol-dropdown' name='protocol' defaultValue={item.protocol} ref='protocol' className='ui fluid dropdown' onChange={(event) => this.onChangeProtocol(event)}>
                          <option value=''>Protocol</option>
                          <option value='http'>HTTP</option>
                          <option value='https'>HTTPS</option>
                        </select>
                      </div>
                      <div className='six wide field required'>
                        <label>Hostname</label>
                        <input type='text' ref='host' name='host' placeholder='Hostname or IP' defaultValue={item.host} autoComplete='off' />
                      </div>
                      <div className='three wide field required'>
                        <label>Port</label>
                        <input type='number' ref='port' name='port' min='0' placeholder='Port' defaultValue={item.port} autoComplete='off' />
                      </div>
                      <div className='three wide field required'>
                        <label>Timeout</label>
                        <input type='number' ref='timeout' name='timeout' min='0' placeholder='Timeout' defaultValue={item.timeout} autoComplete='off' />
                      </div>
                    </div>

                    {this.renderCertificates(item, chosenProtocol)}

                  </form>
                  <VolumesBox volumes={item.volumes} ref='volumes'>
                    <p>These volumes are used to have common volumes mapping on all services deployed on this daemon. You can add / remove / modify volumes mapping when you deploy a new service on a group.</p>
                  </VolumesBox>
                  <VariablesBox variables={item.variables} ref='variables'>
                    <p>These variables are used to have common variables environment into all services deployed on this daemon (Proxy, LDAP,...). You can add / remove / modify variables when you deploy a new service on a group.</p>
                  </VariablesBox>
                  <div className='tags'>
                    <div className='large ui label form-label'>Tags</div>
                    <ReactTags tags={this.state.tags}
                      handleDelete={(i) => this.handleDeleteTag(i)}
                      handleAddition={(tag) => this.handleAddTag(tag)}
                      handleDrag={(tag, currPos, newPos) => this.handleDragTag(tag, currPos, newPos)} />
                  </div>
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
DaemonComponent.propTypes = {
  daemon: React.PropTypes.object,
  daemonId: React.PropTypes.string,
  sites: React.PropTypes.object,
  newDaemon: React.PropTypes.func.isRequired,
  fetchDaemon: React.PropTypes.func.isRequired,
  fetchSites: React.PropTypes.func.isRequired,
  backTo: React.PropTypes.func,
  onSave: React.PropTypes.func,
  onDelete: React.PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  return {
    daemon: state.daemon,
    daemonId: ownProps.params.id,
    sites: state.sites
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchDaemon: (id) => dispatch(DaemonThunks.fetchDaemon(id)),
    newDaemon: () => dispatch(DaemonActions.newDaemon()),
    fetchSites: () => dispatch(SitesThunks.fetchIfNeeded()),
    backTo: () => dispatch(goBack()),
    onSave: (daemon) => dispatch(DaemonThunks.saveDaemon(daemon)),
    onDelete: daemon => {
      const callback = () => dispatch(DaemonThunks.deleteDaemon(daemon.id));
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
