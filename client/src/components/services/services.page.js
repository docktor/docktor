// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import DebounceInput from 'react-debounce-input';

// API Fetching
import ServicesThunks from '../../modules/services/services.thunks.js';
import ServicesActions from '../../modules/services/services.actions.js';

// Components
import ServiceCard from './service/service.card.component.js';

// Selectors
import { getFilteredServices } from '../../modules/services/services.selectors.js';

// Style
import './services.page.scss';

// Services Component
class Services extends React.Component {

  componentWillMount() {
    this.props.fetchServices();
  }

  render() {
    const services = this.props.services;
    const filterValue = this.props.filterValue;
    const fetching = this.props.isFetching;
    const changeFilter = this.props.changeFilter;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal justified services-bar'>
          <div className='ui left corner labeled icon input flex' >
            <div className='ui left corner label'><i className='search icon' /></div>
            <i className='remove link icon' onClick={() => changeFilter('')} />
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              placeholder='Search...'
              onChange={(event) => changeFilter(event.target.value)}
              value={filterValue}/>
          </div>
          <div className='flex-2 layout horizontal end-justified'>
            <Link className='ui teal labeled icon button' to={'/services/new'}>
              <i className='plus icon' />New Service
            </Link>
          </div>
        </div>
        <Scrollbars autoHide className='flex ui dimmable'>
          <div className='flex layout horizontal center-center services-list wrap'>
              {(fetching => {
                if (fetching) {
                  return (
                      <div className='ui active inverted dimmer'>
                        <div className='ui text loader'>Fetching</div>
                      </div>
                  );
                }
              })(fetching)}
                {services.map(service => {
                  return (
                    <ServiceCard service={service} key={service.id} />
                  );
                })}
          </div>
        </Scrollbars>
      </div>
    );
  }
}
Services.propTypes = {
  services: React.PropTypes.array,
  filterValue: React.PropTypes.string,
  isFetching: React.PropTypes.bool,
  fetchServices: React.PropTypes.func.isRequired,
  changeFilter: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToServicesProps = (state) => {
  const filterValue = state.services.filterValue || '';
  const services = getFilteredServices(state.services.items, filterValue);
  const isFetching = state.services.isFetching;
  return { filterValue, services, isFetching };
};

// Function to map dispatch to container props
const mapDispatchToServicesProps = (dispatch) => {
  return {
    fetchServices : () => {
      dispatch(ServicesThunks.fetchIfNeeded());
    },
    changeFilter: (filterValue) => dispatch(ServicesActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const ServicesPage = connect(
  mapStateToServicesProps,
  mapDispatchToServicesProps
)(Services);

export default ServicesPage;
