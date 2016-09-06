// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';

// API Fetching
import { fetchServicesIfNeeded } from './services.thunks.js';

// Components
import ServiceCard from './service.card.component.js';

// Style
import './services.page.scss';

// Services Component
class Services extends React.Component {

  componentWillMount() {
    this.props.fetchServices();
  }

  render() {
    const services = Object.values(this.props.services.items);
    const fetching = this.props.services.isFetching;
    return (
      <div className='flex layout vertical start-justified'>
        <div className='layout horizontal center-center services-bar'>
          <div className='ui icon input'>
            <i className='search icon'></i>
            <input type='text' placeholder='Search...'/>
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
  services: React.PropTypes.object,
  fetchServices: React.PropTypes.func.isRequired,
};

// Function to map state to container props
const mapStateToServicesProps = (state) => {
  return { services: state.services };
};

// Function to map dispatch to container props
const mapDispatchToServicesProps = (dispatch) => {
  return {
    fetchServices : () => {
      dispatch(fetchServicesIfNeeded());
    }
  };
};

// Redux container to Sites component
const ServicesPage = connect(
  mapStateToServicesProps,
  mapDispatchToServicesProps
)(Services);

export default ServicesPage;
