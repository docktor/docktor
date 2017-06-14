// React
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router-dom';
import { Input, Button, Dimmer, Loader, Label, Icon } from 'semantic-ui-react';
import DebounceInput from 'react-debounce-input';

// Components
import DaemonCard from './daemon/daemon.card.component';
import Sites from './sites/sites.component';

// Thunks / Actions
import SitesThunks from '../../modules/sites/sites.thunks';
import DaemonsThunks from '../../modules/daemons/daemons.thunks';
import DaemonsActions from '../../modules/daemons/daemons.actions';

// Selectors
import { getFilteredDaemons } from '../../modules/daemons/daemons.selectors';

// Style
import './daemons.page.scss';

// Daemons Component
class Daemons extends React.Component {

  componentWillMount = () => {
    this.props.fetchSite();
    this.props.fetchDaemons();
  }

  render = () => {
    const { sites, daemons, isFetching, filterValue, changeFilter } = this.props;
    return (
      <div className='flex layout vertical start-justified daemons-page'>
        <div className='layout horizontal justified daemons-bar'>
          <Input icon labelPosition='left corner' className='flex'>
            <Label corner='left' icon='search' />
            <DebounceInput
              placeholder='Search...'
              minLength={1}
              debounceTimeout={300}
              onChange={(event) => changeFilter(event.target.value)}
              value={filterValue}
            />
            <Icon link name='remove' onClick={() => changeFilter('')}/>
          </Input>
          <div className='flex-2 layout horizontal end-justified'>
            <Button as={Link} color='teal' content='New Daemon' labelPosition='left' icon='plus' to={'/daemons/new'} />
          </div>
        </div>
        <div className='flex layout horizontal around-justified'>
          <div className='flex layout vertical start-justified sites'>
            <Sites/>
          </div>
          <Scrollbars autoHide className='flex-2 ui dimmable'>
            {isFetching && <Dimmer active><Loader size='large' content='Fetching'/></Dimmer>}
            <div className='flex layout horizontal center-center wrap daemons-list'>
              {daemons.map(daemon => <DaemonCard daemon={daemon} site={sites[daemon.site]} key={daemon.id} />)}
            </div>
          </Scrollbars>
        </div>
      </div>
    );
  }
}
Daemons.propTypes = {
  sites: PropTypes.object,
  daemons: PropTypes.array,
  isFetching: PropTypes.bool,
  filterValue: PropTypes.string,
  fetchSite: PropTypes.func.isRequired,
  fetchDaemons: PropTypes.func.isRequired,
  changeFilter: PropTypes.func,
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
    fetchSite: () => dispatch(SitesThunks.fetchAll()),
    fetchDaemons: () => dispatch(DaemonsThunks.fetchAll()),
    changeFilter: (filterValue) => dispatch(DaemonsActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const DaemonsPage = connect(
  mapStateToDaemonsProps,
  mapDispatchToDaemonsProps
)(Daemons);

export default DaemonsPage;