// React
import React from 'react';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router';
import { Input, Button, Dimmer, Loader, Label, Icon } from 'semantic-ui-react';
import DebounceInput from 'react-debounce-input';

// API Fetching
import ServicesThunks from '../../modules/services/services.thunks';
import ServicesActions from '../../modules/services/services.actions';

// Components
import ServiceCard from './service/service.card.component';

// Selectors
import { getFilteredServices } from '../../modules/services/services.selectors';

// Style
import './services.page.scss';

// Services Component
class Services extends React.Component {

  componentWillMount = () => {
    this.props.fetchServices();
  }

  render = () => {
    const { services, isFetching, filterValue, changeFilter } = this.props;
    return (
      <div className='flex layout vertical start-justified services-page'>
        <div className='layout horizontal justified services-bar'>
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
            <Button as={Link} color='teal' content='New Service' labelPosition='left' icon='plus' to={'/services/new'} />
          </div>
        </div>
        <Scrollbars autoHide className='flex ui dimmable'>
          <div className='flex layout horizontal center-center services-list wrap'>
              {isFetching && <Dimmer active><Loader size='large' content='Fetching'/></Dimmer>}
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
