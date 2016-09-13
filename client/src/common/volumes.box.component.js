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

  componentDidMount() {
    $('.volume .ui.dropdown.rights').dropdown();
    this.refreshForm();
  }

  componentDidUpdate() {
    $('.volume .ui.dropdown.rights').dropdown();
    this.refreshForm();
  }

  refreshForm() {
    const settings = { fields:{} };
    this.state.volumes.forEach((volume, index) => {
      settings.fields['external' + index] = 'empty';
      settings.fields['internal' + index] = 'empty';
      settings.fields['rights' + index] = 'empty';
    });
    $('.volume.ui.form').form(settings);
  }

  onAddVolume(event) {
    event.preventDefault();
    const volumes = this.state.volumes;
    volumes.push({
      value: '',
      internal: '',
      rights: 'rw',
      description: ''
    });
    this.forceUpdate();
  }

  onRemoveVolume(event, index) {
    event.preventDefault();
    this.state.volumes.splice(index, 1);
    this.forceUpdate();
  }

  onChangeVolume(event, index, property) {
    event.preventDefault();
    this.state.volumes[index][property] = event.target.value;
    this.forceUpdate();
  }

  isFormValid() {
    $('.volume.ui.form').form('validate form');
    return $('.volume.ui.form').form('is valid');
  }

  renderVolume(volume, index) {
          const title = '-v ' + volume.value + ':' + volume.internal + ':' + volume.rights;
          return (
            <div key={'volume' + index} className='fields'>
              <div className='five wide field'>
                <label className='hidden'>External Volume</label>
                <input title={title} type='text' value={volume.value} placeholder='The default volume when container is created' autoComplete='off'
                    onChange={(event) => this.onChangeVolume(event, index, 'value')} data-validate={'external' + index}/>
              </div>
              <div className='five wide field required'>
                <label className='hidden'>Internal Volume</label>
                <input title={title} type='text' value={volume.internal} placeholder='The volume inside the container' autoComplete='off'
                    onChange={(event) => this.onChangeVolume(event, index, 'internal')} data-validate={'internal' + index} />
              </div>
              <div className='three wide field required' title={title}>
                <label className='hidden'>Rights</label>
                <select value={volume.rights} className='ui fluid dropdown rights'
                    onChange={(event) => this.onChangeVolume(event, index, 'rights')} data-validate={'rights' + index} >
                  <option value=''>Select rights</option>
                  <option value='ro'>Read-only</option>
                  <option value='rw'>Read-write</option>
                </select>
              </div>
              <div className='three wide field'>
                <label className='hidden'>Description</label>
                <textarea rows='2' defaultValue={volume.description} placeholder='Describe the utility of this volume' autoComplete='off'
                  onChange={(event) => this.onChangeVolume(event, index, 'description')} />
              </div>
              <div className='button field'>
                <button className='ui red icon button' onClick={(event) => this.onRemoveVolume(event, index)}>
                  <i className='trash icon'></i>
                </button>
              </div>
            </div>
          );
  }


  render() {
    return (
      <HeadingBox className='volume ui form' icon='large folder open icon' title='Volumes'>
        {this.props.children ? this.props.children : <div></div>}
        <div className='fields header'>
          <div className='five wide field'>
            <label>External Volume</label>
          </div>
          <div className='five wide field required'>
            <label>Internal Volume</label>
          </div>
          <div className='three wide field required'>
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
