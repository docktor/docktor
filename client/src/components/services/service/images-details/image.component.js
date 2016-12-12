// React
import React from 'react';
import classNames from 'classnames';

// Components
import ParametersBox from '../../../common/boxes/parameters.box.component.js';
import PortsBox from '../../../common/boxes/ports.box.component.js';
import VolumesBox from '../../../common/boxes/volumes.box.component.js';
import VariablesBox from '../../../common/boxes/variables.box.component.js';


// Style
import './image.component.scss';

// Image
class ImageDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = { openedImages : [], images: [] };
  }

  componentWillMount() {
    this.setState({ images: this.props.images });
  }

  onEdit(index) {
    const state = { openedImages: [ ...this.state.openedImages ] };
    state.openedImages[index] = !state.openedImages[index];
    this.setState(state);
  }

  onCopy(index) {
    const image = this.state.images[index] && JSON.parse(JSON.stringify(this.state.images[index]));
    image.id += 1;
    image.name += '_copy';
    const state = { images: [ ...this.state.images ] };
    state.images.push(image);
    this.setState(state);
    this.props.scrollbars.scrollToBottom();
  }

  onRemove(index) {
    this.state.images.splice(index, 1);
    const state = { images: this.state.images };
    this.setState(state);
  }

  renderImage(image, index) {
    const buttonToggle = classNames(
      'ui toggle compact button',
      { ['active']: this.state.openedImages[index] }
    );
    return (
      <div key={image.id} className='image-detail layout vertical justified'>
        <div className='layout horizontal justified'>
          <div className='flex ui fluid left corner labeled input'>
            <input type='text' name='name' defaultValue={image.name} placeholder='A unique image name' autoComplete='off' />
            <div className='ui left corner label' title='Image Name'>
              <i className='file outline icon'/>
            </div>
          </div>
          <div className='flex layout horizontal end-justified'>
            <button className={buttonToggle} onClick={() => this.onEdit(index)}>
              <i className='edit icon'/>Edit
            </button>
            <button className='ui compact button' onClick={() => this.onCopy(index)}>
              <i className='copy icon'/>Copy
            </button>
            <button className='ui compact red button' onClick={() => this.onRemove(index)}>
              <i className='trash icon'/>Remove
            </button>
          </div>
        </div>
        {this.state.openedImages[index] &&
          <div className='flex'>
            <ParametersBox allowEmpty stacked parameters={image.parameters || []}>
              <p>Example of name parameter : CpuShares, CpuSet, Memory, MemorySwap, etc...</p>
            </ParametersBox>
            <PortsBox allowEmpty stacked ports={image.ports || []}>
              <p>docker [...] -p externalPort:internalPort</p>
            </PortsBox>
            <VariablesBox allowEmpty stacked variables={image.variables || []}>
              <p>docker [...] -e variableName=variableValue</p>
            </VariablesBox>
            <VolumesBox allowEmpty stacked volumes={image.volumes || []}>
              <p>docker [...] -v defaultValue:internalVolume</p>
            </VolumesBox>
          </div>
        }
      </div>
    );
  }

  render() {
    const images = this.state.images;
    return (
      <div className='docker images padded layout vertical'>
          {images && images.map((image, index) => {
            return this.renderImage(image, index);
          })}
      </div>
    );
  }
}

ImageDetails.propTypes = {
  images: React.PropTypes.array,
  scrollbars: React.PropTypes.object
};

export default ImageDetails;
