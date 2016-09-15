// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';

// Components
import DaemonCard from './daemon.card.component.js';
import Sites from '../sites/sites.component.js';

// Thunks
import SitesThunks from '../sites/sites.thunks.js';
import DaemonsThunks from '../daemons/daemons.thunks.js';

// Style
import './daemons.page.scss';

// Daemons Component
class Daemons extends React.Component {

  componentWillMount() {
    this.props.fetchSite();
    this.props.fetchDaemons();
  }

  render() {
    const sites = this.props.sites.items;
    const daemons = Object.values(this.props.daemons.items);
    const fetching = this.props.daemons.isFetching;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal center-center daemons-bar'>
          <div className='ui icon input'>
            <i className='search icon'></i>
            <input type='text' placeholder='Search...'/>
          </div>
          <div className='flex'></div>
          <div className='ui teal labeled icon button'>
            <i className='plus icon'></i>New Daemon
          </div>
        </div>
        <div className='flex layout horizontal around-justified'>
          <div className='flex layout vertical start-justified sites'>
            <Sites/>
          </div>
          <Scrollbars className='flex-2 ui dimmable'>
            {(fetching => {
              if (fetching) {
                return (
                    <div className='ui active inverted dimmer'>
                      <div className='ui text loader'>Fetching</div>
                    </div>
                );
              }
            })(fetching)}
              <div className='flex layout horizontal center-center wrap daemons-list'>
                {daemons.map(daemon => {
                  return (
                    <DaemonCard daemon={daemon} site={sites[daemon.site]} key={daemon.id} />
                  );
                })}
              </div>
          </Scrollbars>
        </div>
      </div>
    );
  }
}
Daemons.propTypes = {
  sites: React.PropTypes.object,
  daemons: React.PropTypes.object,
  fetchSite: React.PropTypes.func.isRequired,
  fetchDaemons: React.PropTypes.func.isRequired,
};

// Function to map state to container props
const mapStateToDaemonsProps = (state) => {
  return { sites: state.sites, daemons: state.daemons };
};

// Function to map dispatch to container props
const mapDispatchToDaemonsProps = (dispatch) => {
  return {
    fetchSite: () =>{dispatch(SitesThunks.fetchIfNeeded());},
    fetchDaemons: () => {dispatch(DaemonsThunks.fetchIfNeeded());}
  };
};

// Redux container to Sites component
const DaemonsPage = connect(
  mapStateToDaemonsProps,
  mapDispatchToDaemonsProps
)(Daemons);

export default DaemonsPage;
