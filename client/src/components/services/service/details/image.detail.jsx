// React
import React from 'react';
import { Button, Input } from 'semantic-ui-react';
import classNames from 'classnames';

// Components
import ParametersBox from '../../../common/boxes/parameters.box.component';
import PortsBox from '../../../common/boxes/ports.box.component';
import VolumesBox from '../../../common/boxes/volumes.box.component';
import VariablesBox from '../../../common/boxes/variables.box.component';


// Style
import './image.detail.scss';

// Image
class ImageDetails extends React.Component {

  state = { opened: false, error: false, image: {} }

  componentWillMount = () => {
    this.setState({ image: this.props.image });
  }

  onToggle = () => {
    this.setState((prevState) => {return { opened: !prevState.opened };});
  }

  onEdit = (e, { value }) => {
    this.setState({ image: { name: value }, error: false });
  }

  isFormValid = () => {
    const parametersBox = this.refs.parameters;
    const portsBox = this.refs.ports;
    const variablesBox = this.refs.variables;
    const volumesBox = this.refs.volumes;
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    const formValid = parametersBox.isFormValid() & portsBox.isFormValid() & variablesBox.isFormValid() & volumesBox.isFormValid();
    const nameIsValid = this.state.image.name;
    this.setState({ error: !nameIsValid });
    return formValid && Boolean(nameIsValid);
  }

  getImage = () => {
    const parametersBox = this.refs.parameters;
    const portsBox = this.refs.ports;
    const variablesBox = this.refs.variables;
    const volumesBox = this.refs.volumes;
    const image = { ...this.state.image };
    image.parameters = parametersBox.state.parameters;
    image.ports = portsBox.state.ports;
    image.variables = variablesBox.state.variables;
    image.volumes = volumesBox.state.volumes;
    return image;
  }

  render = () => {
    const { image, opened, error } = this.state;

    const boxes = classNames(
      'flex images-boxes',
      { hidden: !opened }
    );

    return (
      <div className='image-detail layout vertical justified'>
        <div className='layout horizontal justified'>
          <Input error={error} value={image.name} onChange={this.onEdit} className='flex'
            label={{ icon: 'file outline', title: 'Image Name' }} labelPosition='left corner'
            placeholder='A unique image name' autoComplete='off'
          />
          <div className='flex layout horizontal end-justified'>
            <Button icon='edit' compact toggle active={opened} onClick={this.onToggle} content='Edit' />
            <Button icon='copy' compact onClick={this.props.onCopy} content='Copy' />
            <Button icon='trash' compact color='red' onClick={this.props.onRemove} content='Remove' />
          </div>
        </div>
        <div className={boxes}>
          <ParametersBox allowEmpty stacked parameters={image.parameters || []} ref='parameters'>
            <p>Example of name parameter : CpuShares, CpuSet, Memory, MemorySwap, etc...</p>
          </ParametersBox>
          <PortsBox allowEmpty stacked ports={image.ports || []} ref='ports'>
            <p>docker [...] -p externalPort:internalPort</p>
          </PortsBox>
          <VariablesBox allowEmpty stacked variables={image.variables || []} ref='variables'>
            <p>docker [...] -e variableName=variableValue</p>
          </VariablesBox>
          <VolumesBox allowEmpty stacked volumes={image.volumes || []} ref='volumes'>
            <p>docker [...] -v defaultValue:internalVolume</p>
          </VolumesBox>
        </div>
      </div>
    );
  }
}

ImageDetails.propTypes = {
  image: React.PropTypes.object,
  onCopy: React.PropTypes.func,
  onRemove: React.PropTypes.func,
};

export default ImageDetails;
