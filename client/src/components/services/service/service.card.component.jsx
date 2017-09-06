// React
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Icon } from 'semantic-ui-react';

// Dependencies
import moment from 'moment';

// Style
import './service.card.component.scss';

// ServiceCard Component
class ServiceCard extends React.Component {
  render = () => {
    const service = this.props.service;
    const nbImages = service.images.length;
    const images = nbImages > 0 ? nbImages + (nbImages > 1 ? ' images' : ' image') : 'No images';
    return (
      <Card className='service-card'>
        <Card.Content>
          <Card.Header as={Link} to={'/services/' + service.id} title={service.title} className='link'>
            <Icon name='cube' />{service.title}
          </Card.Header>
        </Card.Content>
        <Card.Content extra className='layout horizontal'>
          <Icon name='file archive outline' />
          <span className='flex'>{images}</span>
          <span><i className='calendar icon' />{moment(service.created).fromNow()}</span>
        </Card.Content>
      </Card>
    );
  }
}

ServiceCard.propTypes = { service: PropTypes.object };

export default ServiceCard;
