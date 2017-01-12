// React
import React from 'react';
import { Table, Label, Button } from 'semantic-ui-react';
import sortBy from 'lodash.sortby';

import ContainerCard from './container.card.component';

// ContainersView Component
class ContainersView extends React.Component {

  renderAsGrid(containers, daemons) {
    return  containers.map(container => {
      return (<ContainerCard key={container.id} daemons={daemons} container={container} />);
    });
  }

  renderAsList(containers) {
    return (
      <Table fixed celled compact='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width='three'>Service</Table.HeaderCell>
            <Table.HeaderCell width='three'>Name</Table.HeaderCell>
            <Table.HeaderCell width='eight'>Tags</Table.HeaderCell>
            <Table.HeaderCell width='two' textAlign='center'>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {containers.map(container => {
            {/* const service = services.items[container.serviceId] || { tags : [] };*/}
            return (
            <Table.Row key={container.id}>
              <Table.Cell>{container.serviceTitle.toUpperCase()}</Table.Cell>
              <Table.Cell>{container.name}</Table.Cell>
              <Table.Cell>
                <Label.Group>
                {container.tags && container.tags.map(t => {
                  const tag = tags.items[t];
                  return <Label key={tag.name.slug}>{tag.name.raw}</Label>;
                })}
                </Label.Group>
              </Table.Cell>
              <Table.Cell textAlign='center'>
                <Button compact size='tiny' color='green' content='UP' labelPosition='right' icon='refresh' />
              </Table.Cell>
            </Table.Row>
            );
          })
          }
        </Table.Body>
      </Table>
    );
  }

  render = () => {
    const { containers, daemons } = this.props;
    const { display, groupBy } = this.props;
    const sortedContainers = sortBy(containers, [ c => c.serviceTitle.toLowerCase(), c => c.name.toLowerCase()]);
    return (<div className='flex layout center-justified horizontal wrap'>
      {display === 'grid' && this.renderAsGrid(sortedContainers, daemons)}
      {display === 'list' && this.renderAsList(sortedContainers)}
    </div>);
  }
}
ContainersView.propTypes = {
  containers: React.PropTypes.array.isRequired,
  daemons: React.PropTypes.array.isRequired,
  display: React.PropTypes.string.isRequired,
  groupBy: React.PropTypes.object,
  services: React.PropTypes.object
};

export default ContainersView;
