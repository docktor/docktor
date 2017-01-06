// React
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Card, Icon, Button, Label } from 'semantic-ui-react';

// Components
import DaemonsThunks from '../../../modules/daemons/daemons.thunks.js';

// Style
import './daemon.card.component.scss';

// DaemonCard Component
class DaemonCard extends React.Component {

  componentWillMount = () => {
    const daemon = this.props.daemon;
    this.props.fetchInfo(daemon, false);
  }

  getColor = (info) => {
    if (!info) {
      return 'grey';
    } else if (info.status === 'UP') {
      return 'green';
    } else {
      return 'red';
    }
  }

  render = () => {
    const { daemon, fetchInfo } = this.props;
    const { isFetching, info } = daemon;
    let site = this.props.site;
    if (!site) {
      site = { title: 'Unknown Site' };
    }

    const nbImages = parseInt(info && info.nbImages ? info.nbImages : '0');
    const images = nbImages > 0 ? nbImages + (nbImages > 1 ? ' images' : ' image') : 'No images';
    const nbContainers = parseInt(info && info.nbContainers ? info.nbContainers : '0');
    const containers = nbContainers > 0 ? nbContainers + (nbContainers > 1 ? ' containers' : ' container') : 'No containers';

    return (
      <Card className='daemon-card'>
        <Card.Content>
          <Card.Header as={Link} to={'/daemons/' + daemon.id}>
            <Icon className='server' />{daemon.name}
          </Card.Header>
          <Label attached='top right' title={info ? info.message : ''} color={this.getColor(info)} className={isFetching ? ' disabled' : ''}>
            {(info ? info.status : 'UNKNOWN')}
          </Label>
          <Card.Meta>{site.title}</Card.Meta>
          <Card.Description>{daemon.description}</Card.Description>
        </Card.Content>
        {
          isFetching ?
            <Button.Group attached='bottom' size='mini' color='blue'>
              <Button loading />
            </Button.Group>
            :
            <Button.Group attached='bottom' size='mini' color='blue'>
              <Button disabled>{images}</Button>
              <Button disabled>{containers}</Button>
              <Button icon='refresh' onClick={() => fetchInfo(daemon, true)}/>
            </Button.Group>
        }
      </Card>
    );
  }
}


DaemonCard.propTypes = {
  daemon: React.PropTypes.object,
  site: React.PropTypes.object,
  fetchInfo: React.PropTypes.func
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    fetchInfo: (daemon, force) => dispatch(DaemonsThunks.fetchDaemonInfo(daemon, force))
  };
};

// Redux container
const CardDaemon = connect(
  null,
  mapDispatchToProps
)(DaemonCard);

export default CardDaemon;
