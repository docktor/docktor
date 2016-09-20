// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';

// API Fetching
import ServicesThunks from './services.thunks.js';
import ServicesActions from './services.actions.js';

// Components
import ServiceCard from './service.card.component.js';

// Selectors
import { getFilteredServices } from './services.selectors.js';

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
        <div className='layout horizontal center-center services-bar'>
          <div className='ui icon input'>
            <i className='search icon'></i>
            <input type='text' placeholder='Search...' onChange={(event) => changeFilter(event.target.value)} value={filterValue}/>
          </div>
          <div className='flex'></div>
        </div>
        <Scrollbars className='flex ui dimmable'>
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
  const filterValue = state.services.filterValue;
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
