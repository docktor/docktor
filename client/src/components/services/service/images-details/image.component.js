// React
import React from 'react';
import classNames from 'classnames';

// Components
import VolumesBox from '../../../common/volumes.box.component.js';
import VariablesBox from '../../../common/variables.box.component.js';


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

  onOpenEdit(index) {
    event.preventDefault();
    const state = { openedImages: [ ...this.state.openedImages ] };
    state.openedImages[index] = !state.openedImages[index];
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
            <button className={buttonToggle} onClick={() => this.onOpenEdit(index)}>
              <i className='edit icon'/>Edit
            </button>
            <button className='ui compact button'>
              <i className='copy icon'/>Copy
            </button>
            <button className='ui compact red button'>
              <i className='trash icon'/>Remove
            </button>
          </div>
        </div>
        {this.state.openedImages[index] &&
          <div className='flex'>
            <VolumesBox allowEmpty stacked volumes={image.volumes || []}>
              <p>docker [...] -v defaultValue:internalVolume</p>
            </VolumesBox>
            <VariablesBox allowEmpty stacked variables={image.variables || []}>
              <p>docker [...] -e variableName=variableValue</p>
            </VariablesBox>
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
  images: React.PropTypes.array
};

export default ImageDetails;
