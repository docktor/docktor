// React
import React from 'react';
import { Button } from 'semantic-ui-react';

// Components
import ImageDetails from './image.detail';

// Style
import './image.tab.scss';


// Image
class ImageTab extends React.Component {

  state = { images: [] }
  images = []

  componentWillMount = () => {
    this.setState({ images: this.props.images });
  }

  onAdd = () => {
    const image = {};
    image.name = 'new_image';
    const state = { images: [ ...this.getImages() ] };
    state.images.push(image);
    this.setState(state);
    this.props.scrollbars && this.props.scrollbars.scrollToBottom();
  }

  onCopy = (index) => {
    const image = this.state.images[index] && JSON.parse(JSON.stringify(this.state.images[index]));
    delete image.id;
    delete image.created;
    image.name += '_copy';
    const state = { images: [ ...this.getImages() ] };
    state.images.push(image);
    this.setState(state);
    this.props.scrollbars && this.props.scrollbars.scrollToBottom();
  }

  onRemove = (index) => {
    const images = this.getImages();
    images.splice(index, 1);
    const state = { images };
    this.setState(state);
  }

  isFormValid = () => {
    let formValid = true;
    this.images.forEach(imageRef => {
      if(imageRef) {
        formValid = imageRef.isFormValid() && formValid;
      }
    });
    return formValid;
  }

  getImages = () => {
    let images = [];
    this.images.forEach(imageRef => {
      if(imageRef) {
        images.push(imageRef.getImage());
      }
    });
    return images;
  }

  render = () => {
    const { images } = this.state;
    return (
      <div className='docker images padded layout vertical'>
          {images && images.map((image, index) => {
            return (
              <ImageDetails
                key={index}
                image={image}
                onCopy={() => this.onCopy(index)}
                onRemove={() => this.onRemove(index)}
                ref={(img) => this.images[index] = img}
              />
            );
          })}
          <div className='image-detail new layout horizontal justified'>
            <Button content='Add Image' icon='plus' labelPosition='left' color='green' onClick={this.onAdd} />
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
