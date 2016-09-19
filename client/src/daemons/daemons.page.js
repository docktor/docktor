// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';

// Components
import DaemonCard from './daemon.card.component.js';
import Sites from '../sites/sites.component.js';

// Thunks / Actions
import SitesThunks from '../sites/sites.thunks.js';
import DaemonsThunks from './daemons.thunks.js';
import DaemonsActions from './daemons.actions.js';

// Selectors
import { getFilteredDaemons } from '../daemons/daemons.selectors.js';

// Style
import './daemons.page.scss';

// Daemons Component
class Daemons extends React.Component {

  componentWillMount() {
    this.props.fetchSite();
    this.props.fetchDaemons();
  }

  render() {
    const sites = this.props.sites;
    const daemons = this.props.daemons;
    const fetching = this.props.isFetching;
    const changeFilter = this.props.changeFilter;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal center-center daemons-bar'>
          <div className='ui icon input'>
            <i className='search icon'></i>
            <input type='text' placeholder='Search...' onChange={(event) => changeFilter(event.target.value)}/>
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
                    <div className='flex ui active inverted dimmer'>
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
  daemons: React.PropTypes.array,
  isFetching: React.PropTypes.bool,
  fetchSite: React.PropTypes.func.isRequired,
  fetchDaemons: React.PropTypes.func.isRequired,
  changeFilter: React.PropTypes.func,
};

// Function to map state to container props
const mapStateToDaemonsProps = (state) => {
  return {
    sites: state.sites.items,
    daemons: getFilteredDaemons(state.daemons.items, state.sites.items, state.daemons.filter),
    isFetching: state.daemons.isFetching || state.daemons.isFetching
   };
};

// Function to map dispatch to container props
const mapDispatchToDaemonsProps = (dispatch) => {
  return {
    fetchSite: () => dispatch(SitesThunks.fetchIfNeeded()),
    fetchDaemons: () => dispatch(DaemonsThunks.fetchIfNeeded()),
    changeFilter: (filter) => dispatch(DaemonsActions.changeFilter(filter))
  };
};

// Redux container to Sites component
const DaemonsPage = connect(
  mapStateToDaemonsProps,
  mapDispatchToDaemonsProps
)(Daemons);

export default DaemonsPage;
