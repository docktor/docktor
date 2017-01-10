// React
import React from 'react';
import { Link } from 'react-router';
import { Card, Button } from 'semantic-ui-react';

// Style
import './container.card.component.scss';

// ContainerCard Component
class ContainerCard extends React.Component {
  render() {
    const { container, daemons } = this.props;
    const daemon = daemons.find(daemon => container.daemonId === daemon.value) || { 'name': 'Unknown' };
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
ContainerCard.propTypes = { container: React.PropTypes.object, daemons: React.PropTypes.array };

export default ContainerCard;
