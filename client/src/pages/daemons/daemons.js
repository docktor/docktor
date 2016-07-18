// React
import React from 'react';
import { connect } from 'react-redux';

// Components
import DaemonCard from '../../components/daemon-card/daemon-card.js';
import Sites from '../../components/sites/sites.js';

// Style
import './daemons.scss';

//Site Component using react-leaflet
class Daemons extends React.Component {

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
            <div className='flex'/>
          </div>
          <div className='flex-2 layout horizontal center-center wrap daemons-list'>
            {(fetching => {
              if (fetching) {
                return (
                  <div className='ui dimmable dimmed'>
                    <div className='ui active inverted dimmer'>
                      <div className='ui text loader'>Fetching</div>
                    </div>
                  </div>
                );
              }
            })(fetching)}
            {daemons.map(daemon => {
              return (
                <DaemonCard daemon={daemon} site={sites[daemon.Site]} key={daemon.ID} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
Daemons.propTypes = { sites: React.PropTypes.object, daemons: React.PropTypes.object };

// Function to map state to container props
const mapStateToDaemonsProps = (state) => {
  return { sites: state.sites, daemons: state.daemons };
};

// Function to map dispatch to container props
const mapDispatchToDaemonsProps = (dispatch) => {
  return {};
};

// Redux container to Sites component
const DaemonsPage = connect(
  mapStateToDaemonsProps,
  mapDispatchToDaemonsProps
)(Daemons);

export default DaemonsPage;
