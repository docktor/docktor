// React
import React from 'react';
import { connect } from 'react-redux';

import { fetchDaemon } from './daemon.thunks.js';
import { fetchSitesIfNeeded } from '../../sites/sites.thunks.js';
import { Scrollbars } from 'react-custom-scrollbars';
import VolumesBox from '../../common/volumes.box.component.js';

import './daemon.page.scss';

// Daemon Component
class DaemonComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { chosenProtocol: null };
  }

  componentWillMount() {
    const daemonId = this.props.daemonId;
    this.props.fetchSites();
    if (typeof daemonId !== 'undefined' && daemonId !== '') {
      // Fetch when known daemon
      this.props.fetchDaemon(daemonId);
    } else {
      // New daemon
    }

  }

  componentDidUpdate() {
    console.log('didupdate');
    const vm = this;
    $('#sites-dropdown').dropdown();
    $('#protocol-dropdown').dropdown();
    $('.ui.dropdown.rights').dropdown();
  }

  onChangeProtocol(event) {
    console.log(event);
    this.setState({ chosenProtocol: event.target.value });
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
            {
              items.map(site => {
              return (
                <div className='item' key={site.id} data-value={site.id}>{site.title}</div>
              );
            })}
          </div>
        </div>
        );
      }
  }

  renderVolumes(item) {
    return item.volumes.map(volume => {
          return (
            <div className='top-row'>
              <div className='field'>
                <input type='text' name='name' defaultValue={volume.internal} placeholder='The volume inside the container' autoComplete='off'/>
              </div>
              <div className='field'>
                <input type='text' name='name' defaultValue={volume.value} placeholder='The default volume when container is created' autoComplete='off'/>
              </div>
              <div className='field'>
                <div className='ui fluid selection dropdown rights'>
                  <input type='hidden'  name='rights' value={volume.rights}/>
                  <i className='dropdown icon'></i>
                  <div className='default text'>Select rights</div>
                  <div className='menu'>
                        <div className='item' key='ro' data-value='ro'>Read-only</div>
                        <div className='item' key='rw' data-value='ro'>Read-write</div>
                  </div>
                </div>
              </div>
              <div className='field'>
                <textarea rows='2' name='description' defaultValue={volume.description} placeholder='Describe the utility of this volume' autoComplete='off'/>
              </div>
              <div className='field'>
                <button className='ui red icon button'>
                  <i className='trash icon'></i>
                </button>
              </div>
            </div>
          );
        });
  }

  renderCertificates(item, chosenProtocol) {
      if (item.protocol === 'https' || chosenProtocol === 'https') {
        return(
        <div className='top-row'>
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
                    return (<div>No daemon</div>);
                  } else {
                      return (
                        <div className='daemon-form daemon'>
                          <div className='tab-content'>
                          <div id='daemon'>
                            <h1>{item.name}</h1>
                            <form className='ui form'>
                              <div className='top-row'>
                                <div className='field'>
                                  <label>
                                    Name<span className='req'>*</span>
                                  </label>
                                  <input type='text' ref='name' name='name' defaultValue={item.name} placeholder='A unique name' autoComplete='off' />
                                </div>
                                <div className='field'>
                                  <label>Description</label>
                                  <textarea rows='4' ref='description' name='description' defaultValue={item.description} placeholder='A description of the daemon' autoComplete='off'/>
                                </div>
                              </div>
                              <div className='top-row'>
                                <div className='field'>
                                  <label>
                                    Site<span className='req'>*</span>
                                  </label>
                                  {this.renderSites(sites, item.site)}
                                </div>
                                <div className='field'>
                                  <label>
                                    Default data volume<span className='req'>*</span>
                                  </label>
                                  <input type='text' ref='volume' name='volume' placeholder='volume' defaultValue={item.volume} autoComplete='off'/>
                                </div>
                              </div>
                              <div className='top-row'>
                                <div className='field'>
                                  <div className='large ui label'>Docker daemon :</div>
                                </div>
                                <div className='field'>
                                  <label>Protocol<span className='req'>*</span></label>
                                  <select id='protocol-dropdown' name='protocol' defaultValue={item.protocol} ref='protocol' className='ui fluid dropdown'  onChange={(event) => this.onChangeProtocol(event)}>
                                    <option value=''>Select protocol</option>
                                    <option value='http'>HTTP</option>
                                    <option value='https'>HTTPS</option>
                                  </select>
                                </div>
                                <div className='field'>
                                  <label>Hostname<span className='req'>*</span></label>
                                  <input type='text' ref='host' name='host' placeholder='Hostname or IP' defaultValue={item.host} autoComplete='off'/>
                                </div>
                                <div className='field'>
                                  <label>Port<span className='req'>*</span></label>
                                  <input type='number' ref='port' name='port' placeholder='Port' defaultValue={item.port} autoComplete='off'/>
                                </div>
                                <div className='field'>
                                  <label>Timeout<span className='req'>*</span></label>
                                  <input type='number' ref='timeout' name='timeout' placeholder='Timeout' defaultValue={item.timeout} autoComplete='off'/>
                                </div>
                              </div>
                              {this.renderCertificates(item, chosenProtocol)}
                              <div className='field'>
                                <VolumesBox>
                                </VolumesBox>
                              </div>
                              <button type='submit' className='button-form button-block'>Test</button>
                            </form>
                          </div>
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
  fetchSites: React.PropTypes.func.isRequired
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
  };
};

// Redux container to Sites component
const DaemonPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(DaemonComponent);

export default DaemonPage;
