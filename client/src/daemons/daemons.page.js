// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import DebounceInput from 'react-debounce-input';

// Components
import DaemonCard from './daemon.card.component.js';
import Sites from '../sites/sites.component.js';

// Thunks / Actions
import SitesThunks from '../sites/sites.thunks.js';
import DaemonsThunks from './daemons.thunks.js';
import DaemonsActions from './daemons.actions.js';

// Selectors
import { getFilteredDaemons } from './daemons.selectors.js';

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
    const filterValue = this.props.filterValue;
    const changeFilter = this.props.changeFilter;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal justified daemons-bar'>
          <div className='ui left corner labeled icon input flex' >
            <div className='ui left corner label'><i className='search icon'></i></div>
            <i className='remove link icon' onClick={() => changeFilter('')}></i>
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              placeholder='Search...'
              onChange={(event) => changeFilter(event.target.value)}
              value={filterValue}/>
          </div>
          <div className='flex-2 layout horizontal end-justified'>
            <Link className='ui teal labeled icon button' to={'/daemons/new'}>
              <i className='plus icon'></i>New Daemon
            </Link>
          </div>
        </div>
        <div className='flex layout horizontal around-justified'>
          <div className='flex layout vertical start-justified sites'>
            <Sites/>
          </div>
          <Scrollbars className='flex-2 ui dimmable'>
            {fetching ?
              <div className='flex ui active inverted dimmer'>
                <div className='ui text loader'>Fetching</div>
              </div>
              : ''
            }
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
  filterValue: React.PropTypes.string,
  fetchSite: React.PropTypes.func.isRequired,
  fetchDaemons: React.PropTypes.func.isRequired,
  changeFilter: React.PropTypes.func,
};

// Function to map state to container props
const mapStateToDaemonsProps = (state) => {
  const filterValue = state.daemons.filterValue || '';
  const sites = state.sites.items;
  const daemons = getFilteredDaemons(state.daemons.items, sites, filterValue);
  const isFetching = state.daemons.isFetching || state.daemons.isFetching;
  return { filterValue, sites, daemons, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToDaemonsProps = (dispatch) => {
  return {
    fetchSite: () => dispatch(SitesThunks.fetchIfNeeded()),
    fetchDaemons: () => dispatch(DaemonsThunks.fetchIfNeeded()),
    changeFilter: (filterValue) => dispatch(DaemonsActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const DaemonsPage = connect(
  mapStateToDaemonsProps,
  mapDispatchToDaemonsProps
)(Daemons);

export default DaemonsPage;
