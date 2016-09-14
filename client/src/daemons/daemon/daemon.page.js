// React
import React from 'react';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { WithContext as ReactTags } from 'react-tag-input';

// Thunks/Actions
import { fetchDaemon } from './daemon.thunks.js';
import { fetchSitesIfNeeded } from '../../sites/sites.thunks.js';

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

  componentWillMount() {
    const daemonId = this.props.daemonId;
    this.props.fetchSites();
    if (daemonId && daemonId !== '') {
      // Fetch when known daemon
      this.props.fetchDaemon(daemonId);
    } else {
      // New daemon
    }

  }

  componentDidUpdate() {
    $('#sites-dropdown').dropdown();
    $('#protocol-dropdown').dropdown();
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

  onSave(event) {
    event.preventDefault();
    const volumesBox = this.refs.volumes;
    const variablesBox = this.refs.variables;
    console.log(volumesBox.isFormValid());
    console.log(volumesBox.state.volumes);
    console.log(variablesBox.isFormValid());
    console.log(variablesBox.state.variables);
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
          <input type='hidden' name='site' ref='site' value={defaultSite}/>
          <i className='dropdown icon'></i>
          <div className='default text'>Select Site</div>
          <div className='menu'>
            {items.map(site => {
              return (
                <div className='item' key={site.id} data-value={site.id}>{site.title}</div>
              );
            })}
          </div>
        </div>
        );
      }
  }

  renderCertificates(item, chosenProtocol) {
      if (item.protocol === 'https' || chosenProtocol === 'https') {
        return(
        <div className='three fields'>
          <div className='field'>
            <label>CA</label>
            <textarea rows='10' ref='ca' name='ca' defaultValue={item.ca} placeholder='The Certification Authority key Pem file' autoComplete='off'/>
          </div>
          <div className='field'>
            <label>Cert</label>
            <textarea rows='10'  ref='cert' name='cert' defaultValue={item.cert} placeholder='The certificate Pem file' autoComplete='off'/>
          </div>
          <div className='field'>
            <label>Key</label>
            <textarea rows='10'  ref='key' name='key' defaultValue={item.key} placeholder='The private key file' autoComplete='off'/>
          </div>
        </div>
      );
    } else {
      <div></div>;
    }
  }

  render() {
    const { item, isFetching, didInvalidate } = this.props.daemon;
    const sites = this.props.sites;
    const chosenProtocol = this.state.chosenProtocol;
    return (
      <div className='flex layout vertical start-justified'>
        <Scrollbars className='flex ui dimmable'>
           <div className='flex layout horizontal around-justified'>
                {((isFetching, didInvalidate) => {
                  if (isFetching) {
                    return (
                        <div className='ui active inverted dimmer'>
                          <div className='ui text loader'>Fetching</div>
                        </div>
                    );
                  } else if (didInvalidate) {
                    return (
                      <div>No daemon</div>
                    );
                  } else {
                      return (
                        <div className='flex layout vertical start-justified daemon-form daemon'>
                            <h1><a onClick={()=> this.props.backTo()}><i className='arrow left icon'></i></a>{item.name}</h1>
                            <form className='ui form'>
                              <div className='two fields'>
                                <div className='field required'>
                                  <label>
                                    Name
                                  </label>
                                  <input type='text' ref='name' name='name' defaultValue={item.name} placeholder='A unique name' autoComplete='off' />
                                </div>
                                <div className='field'>
                                  <label>Description</label>
                                  <textarea rows='4' ref='description' name='description' defaultValue={item.description} placeholder='A description of the daemon' autoComplete='off'/>
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
                                    Default data volume
                                  </label>
                                  <input type='text' ref='volume' name='volume' placeholder='volume' defaultValue={item.volume} autoComplete='off'/>
                                </div>
                              </div>

                              <div className='five fields'>
                                <div className='two wide field'>
                                  <div className='large ui label'>cAdvisor</div>
                                </div>
                                <div className='fourteen wide field'>
                                  <label>cAdvisor Api Url</label>
                                  <input type='text' ref='cadvisorApi' name='cadvisorApi' placeholder='cAdvisor Api Url' defaultValue={item.cadvisorApi} autoComplete='off'/>
                                </div>
                              </div>

                              <div className='five fields'>
                                <div className='two wide field'>
                                  <div className='large ui label'>Docker</div>
                                </div>
                                <div className='two wide field required'>
                                  <label>Protocol</label>
                                  <select id='protocol-dropdown' name='protocol' defaultValue={item.protocol} ref='protocol' className='ui fluid dropdown'  onChange={(event) => this.onChangeProtocol(event)}>
                                    <option value=''>Select protocol</option>
                                    <option value='http'>HTTP</option>
                                    <option value='https'>HTTPS</option>
                                  </select>
                                </div>
                                <div className='six wide field required'>
                                  <label>Hostname</label>
                                  <input type='text' ref='host' name='host' placeholder='Hostname or IP' defaultValue={item.host} autoComplete='off'/>
                                </div>
                                <div className='three wide field required'>
                                  <label>Port</label>
                                  <input type='number' ref='port' name='port' placeholder='Port' defaultValue={item.port} autoComplete='off'/>
                                </div>
                                <div className='three wide field required'>
                                  <label>Timeout</label>
                                  <input type='number' ref='timeout' name='timeout' placeholder='Timeout' defaultValue={item.timeout} autoComplete='off'/>
                                </div>
                              </div>

                              {this.renderCertificates(item, chosenProtocol)}

                            </form>
                            <VolumesBox volumes={item.volumes} ref='volumes'>
                              <p>These volumes are used to have common volumes mapping on all services deployed on this daemon. You can add / remove / modify volumes mapping when you deploy a new service on a group.</p>
                            </VolumesBox>
                            <VariablesBox volumes={item.variables} ref='variables'>
                              <p>These variables are used to have common variables environment into all services deployed on this daemon (Proxy, LDAP,...). You can add / remove / modify variables when you deploy a new service on a group.</p>
                            </VariablesBox>
                            <div className='tags'>
                              <div className='large ui label'>Tags</div>
                              <ReactTags tags={this.state.tags}
                                handleDelete={(i) => this.handleDeleteTag(i)}
                                handleAddition={(tag) => this.handleAddTag(tag)}
                                handleDrag={(tag, currPos, newPos) => this.handleDragTag(tag, currPos, newPos)} />
                            </div>
                            <div className='flex button-form'>
                              <a className='ui fluid button' onClick={(event) => this.onSave(event)}>Save</a>
                            </div>
                          </div>

                      );
                  }
                })(isFetching, didInvalidate)}
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
  fetchDaemon: React.PropTypes.func.isRequired,
  fetchSites: React.PropTypes.func.isRequired,
  backTo: React.PropTypes.func
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
    fetchDaemon : (id) => {dispatch(fetchDaemon(id));},
    fetchSites : () => {dispatch(fetchSitesIfNeeded());},
    backTo : () => {dispatch(goBack());}
  };
};

// Redux container to Sites component
const DaemonPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(DaemonComponent);

export default DaemonPage;
