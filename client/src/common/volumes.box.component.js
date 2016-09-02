// React
import React from 'react';

import HeadingBox from './heading.box.component.js';

import './volumes.box.component.scss';

// VolumesBox listing a list of users
class VolumesBox extends React.Component {

  constructor(props) {
    super(props);
    // Set state of component from the props.
    this.state = { volumes : this.props.volumes ? this.props.volumes : [] };
  }

  renderVolume(volume, index) {
          return (
            <div className='fields' title={'-v ' + volume.value + ':' + volume.internal + ':' + volume.rights}>
              <div className='five wide field'>
                <input type='text' name='name' defaultValue={volume.value} placeholder='The default volume when container is created' autoComplete='off'/>
              </div>
              <div className='five wide field'>
                <input type='text' name='name' defaultValue={volume.internal} placeholder='The volume inside the container' autoComplete='off'/>
              </div>
              <div className='three wide field'>
                <select name='rights' defaultValue={volume.rights} ref='rights' className='ui fluid dropdown rights'  onChange={(event) => this.onChangeRights(event)}>
                  <option value=''>Select rights</option>
                  <option value='ro'>Read-only</option>
                  <option value='rw'>Read-write</option>
                </select>
              </div>
              <div className='three wide field'>
                <textarea rows='2' name='description' defaultValue={volume.description} placeholder='Describe the utility of this volume' autoComplete='off'/>
              </div>
              <div className='one wide field'>
                <button className='ui red icon button'>
                  <i className='trash icon'></i>
                </button>
              </div>
            </div>
          );
  }

  onAddVolume(event) {
    console.log(event);
    const volumes = this.state.volumes;
    volumes.push({
      value: '',
      internal: '',
      rights: 'rw',
      description: ''
    });
    this.setState({ volumes: volumes });
  }

  render() {
    return (
      <HeadingBox className='volume' icon='large folder open icon' title='Volumes'>
        {this.props.children ? this.props.children : <div></div>}
        <div className='fields header'>
          <div className='five wide field'>
            <label>External Volume</label>
          </div>
          <div className='five wide field'>
            <label>Internal Volume</label>
          </div>
          <div className='three wide field'>
            <label>Rights</label>
          </div>
          <div className='three wide field'>
            <label>Description</label>
          </div>
          <div className='one wide field'>
            <label></label>
          </div>
        </div>
        {
          this.state.volumes.map((volume, index) => {
              return (
                this.renderVolume(volume, index)
              );
        })}
        <div className='ui green small right folder open icon button' onClick={(event) => this.onAddVolume(event)}> <i className='plus icon'></i>Add volume</div>
      </HeadingBox>
    );
  }
};
VolumesBox.propTypes = {
  volumes: React.PropTypes.array,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default VolumesBox;
