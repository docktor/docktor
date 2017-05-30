// React
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Card, Icon, Button, Label } from 'semantic-ui-react';
import classnames from 'classnames';

// Components
import DaemonsThunks from '../../../modules/daemons/daemons.thunks';

// Style
import './daemon.card.component.scss';

// DaemonCard Component
class DaemonCard extends React.Component {

  componentWillMount = () => {
    const daemon = this.props.daemon;
    if (daemon.active) {
      this.props.fetchInfo(daemon, false);
    }
  }

  getDaemonStatusColor = (info, daemon) => {
    if (!info || !daemon.active) {
      return 'grey';
    } else if (info.status === 'UP') {
      return 'green';
    } else {
      return 'red';
    }
  }

  getDaemonStatusLabel = (info, daemon) => {
    let daemonStatusTitle = 'UNKNOWN';
    if (!daemon.active) {
      daemonStatusTitle = 'N/A';
    }
    else if (info) {
      daemonStatusTitle = info.status;
    }
    return daemonStatusTitle;
  }

  renderButtons = (nbImages, nbContainers) => {
    const { daemon, fetchInfo } = this.props;
    const { isFetching } = daemon;

    const images = nbImages > 0 ? nbImages + (nbImages > 1 ? ' images' : ' image') : 'No images';
    const containers = nbContainers > 0 ? nbContainers + (nbContainers > 1 ? ' containers' : ' container') : 'No containers';

    if (!daemon.active) {
      return (
        <Button.Group attached='bottom' size='mini' color='blue'>
          <Button disabled>This daemon is inactive</Button>
        </Button.Group>
      );
    }

    if (isFetching) {
      return (
        <Button.Group attached='bottom' size='mini' color='blue'>
          <Button loading />
        </Button.Group>
      );
    }

    return (
      <Button.Group attached='bottom' size='mini' color='blue'>
        <Button disabled>{images}</Button>
        <Button disabled>{containers}</Button>
        <Button disabled={!daemon.active} icon='refresh' onClick={() => fetchInfo(daemon, true)}/>
      </Button.Group>
    );
  }

  render = () => {
    const { daemon } = this.props;
    const { isFetching, info } = daemon;
    let site = this.props.site;
    if (!site) {
      site = { title: 'Unknown Site' };
    }

    const daemonStatusClasses = classnames({ disabled: isFetching || !daemon.active });
    const nbImages = parseInt(info && info.nbImages ? info.nbImages : '0');
    const nbContainers = parseInt(info && info.nbContainers ? info.nbContainers : '0');

    return (
      <Card className='daemon-card'>
        <Card.Content>
          <Card.Header as={Link} to={'/daemons/' + daemon.id}>
            <Icon className='server' />{daemon.name}
          </Card.Header>
          <Label attached='top right' title={info ? info.message : ''} color={this.getDaemonStatusColor(info, daemon)} className={daemonStatusClasses}>
            {this.getDaemonStatusLabel(info, daemon)}
          </Label>
          <Card.Meta>{site.title}</Card.Meta>
          <Card.Description>{daemon.description}</Card.Description>
        </Card.Content>
        {this.renderButtons(nbImages, nbContainers)}
      </Card>
    );
  }
}


DaemonCard.propTypes = {
  daemon: PropTypes.object,
  site: PropTypes.object,
  fetchInfo: PropTypes.func
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
