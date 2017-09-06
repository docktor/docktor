// React
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Button } from 'semantic-ui-react';

// Style
import './container.card.component.scss';

// ContainerCard Component
class ContainerCard extends React.Component {

  // Get the daemon where container is deployed
  getDaemon() {
    const container = this.props.container;
    const daemons = this.props.daemons || { items:[] };
    const daemon = daemons.items[container.daemonId] || { 'name': 'Unknown' };

    return daemon;
  }

  render() {
    const container = this.props.container;
    const daemon = this.getDaemon();
    const statusMessage = `Container is up on daemon '${daemon.name}'`;
    return (
      <div className='container'>
        <Card>
          <Card.Content>
            <Card.Header>
              <Link className='header' to={'containers/' + container.id} title={container.serviceTitle}>
                {container.serviceTitle}
              </Link>
            </Card.Header>
            <div title={statusMessage} className={'ui top right attached disabled label green'}>
              <i className='refresh icon' />UP
            </div>
            <div className='meta'>{container.name}</div>
            <div className='description'>{container.image}</div>
          </Card.Content>
          <Button.Group attached='bottom' size='small'>
            <Button disabled icon='stop' content='Stop'/>
            <Button disabled icon='play' content='Start'/>
            <Button disabled icon='repeat' content='Restart'/>
            <Button disabled icon='cloud upload' content='Deploy'/>
          </Button.Group>
        </Card>
      </div>
    );
  }
}
ContainerCard.propTypes = {
  container: PropTypes.object.isRequired,
  daemons: PropTypes.object.isRequired
};

export default ContainerCard;
