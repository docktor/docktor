// React
import React from 'react';
import classNames from 'classnames';
import UUID from 'uuid-js';

// Components
import ParametersBox from '../../../common/boxes/parameters.box.component.js';
import PortsBox from '../../../common/boxes/ports.box.component.js';
import VolumesBox from '../../../common/boxes/volumes.box.component.js';
import VariablesBox from '../../../common/boxes/variables.box.component.js';


// Style
import './image.detail.scss';

// Image
class ImageDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      error: false,
      image: { ...props.image }
    };
  }

  componentWillMount() {
    this.setState({ image: this.props.image });
  }

  onToggle() {
    this.setState({ opened: !this.state.opened });
  }

  onEdit(event) {
    this.setState({ image: { name: event.target.value } });
  }

  isFormValid() {
    const parametersBox = this.refs.parameters;
    const portsBox = this.refs.ports;
    const variablesBox = this.refs.variables;
    const volumesBox = this.refs.volumes;
    // isFormValid validate the form and return the status so all the forms must be validated before doing anything
    const formValid = parametersBox.isFormValid() & portsBox.isFormValid() & variablesBox.isFormValid() & volumesBox.isFormValid();
    const nameIsValid = this.state.image.name;
    this.setState({ error: !nameIsValid });
    return formValid && !!nameIsValid;
  }

  getImage() {
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

  render() {
    const image = this.state.image;
    const opened = this.state.opened;

    const buttonToggle = classNames(
      'ui toggle compact button',
      { active: opened }
    );

    const boxes = classNames(
      'flex images-boxes',
      { hidden: !opened }
    );

    const input = classNames(
      'flex ui fluid left corner labeled input',
      { error: this.state.error }
    );

    return (
      <div className='image-detail layout vertical justified'>
        <div className='layout horizontal justified'>
          <div className={input}>
            <input type='text' name='name' value={image.name} onChange={(event) => this.onEdit(event)} placeholder='A unique image name' autoComplete='off' />
            <div className='ui left corner label' title='Image Name'>
              <i className='file outline icon'/>
            </div>
          </div>
          <div className='flex layout horizontal end-justified'>
            <button className={buttonToggle} onClick={() => this.onToggle()}>
              <i className='edit icon'/>Edit
            </button>
            <button className='ui compact button' onClick={() => this.props.onCopy()}>
              <i className='copy icon'/>Copy
            </button>
            <button className='ui compact red button' onClick={() => this.props.onRemove()}>
              <i className='trash icon'/>Remove
            </button>
          </div>
        </div>
        <div className={boxes}>
          <ParametersBox allowEmpty stacked parameters={image.parameters || []} ref='parameters' boxId={UUID.create(4).hex}>
            <p>Example of name parameter : CpuShares, CpuSet, Memory, MemorySwap, etc...</p>
          </ParametersBox>
          <PortsBox allowEmpty stacked ports={image.ports || []} ref='ports' boxId={UUID.create(4).hex}>
            <p>docker [...] -p externalPort:internalPort</p>
          </PortsBox>
          <VariablesBox allowEmpty stacked variables={image.variables || []} ref='variables' boxId={UUID.create(4).hex}>
            <p>docker [...] -e variableName=variableValue</p>
          </VariablesBox>
          <VolumesBox allowEmpty stacked volumes={image.volumes || []} ref='volumes' boxId={UUID.create(4).hex}>
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
