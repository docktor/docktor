// React
import React from 'react';
import classNames from 'classnames';
import UUID from 'uuid-js';

// Components
import ImageDetails from './image.detail.js';

// Style
import './image.tab.scss';


// Image
class ImageTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = { images: props.images || [] };
    this._images = [];
  }

  componentWillMount() {
    this.setState({ images: this.props.images });
  }

  onAdd() {
    const image = {};
    image.name = 'new_image';
    const state = { images: [ ...this.getImages() ] };
    state.images.push(image);
    this.setState(state);
    this.props.scrollbars.scrollToBottom();
  }

  onCopy(index) {
    const image = this.state.images[index] && JSON.parse(JSON.stringify(this.state.images[index]));
    delete image.id;
    delete image.created;
    image.name += '_copy';
    const state = { images: [ ...this.getImages() ] };
    state.images.push(image);
    this.setState(state);
    this.props.scrollbars.scrollToBottom();
  }

  onRemove(index) {
    const images = this.getImages();
    images.splice(index, 1);
    const state = { images };
    this.setState(state);
  }

  isFormValid() {
    let formValid = true;
    this._images.forEach(imageRef => {
      formValid = imageRef && formValid && imageRef.isFormValid();
    });
    return formValid;
  }

  getImages() {
    let images = [];
    this._images.forEach(imageRef => imageRef && images.push(imageRef.getImage()));
    return images;
  }

  render() {
    const images = this.state.images;
    return (
      <div className='docker images padded layout vertical'>
          {images && images.map((image, index) => {
            return (
              <ImageDetails
                key={UUID.create(4).hex}
                image={image}
                onCopy={() => this.onCopy(index)}
                onRemove={() => this.onRemove(index)}
                ref={(img) => this._images[index] = img}
              />
            );
          })}
          <div className='image-detail new layout horizontal justified'>
            <div className='ui green small labeled icon button' onClick={() => this.onAdd()}><i className='plus icon'></i>Add Image</div>
          </div>
      </div>
    );
  }
}

ImageTab.propTypes = {
  images: React.PropTypes.array,
  scrollbars: React.PropTypes.object
};

export default ImageTab;
