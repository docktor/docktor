// React
import React from 'react';

import HeadingBox from './heading.box.component.js';

import './variables.box.component.scss';

// VariablesBox is a list of docker variables
class VariablesBox extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { variables : this.props.variables || [] };
  }

  componentDidMount() {
    $('.variable .ui.dropdown.rights').dropdown();
    this.refreshForm();
  }

  componentDidUpdate() {
    $('.variable .ui.dropdown.rights').dropdown();
    this.refreshForm();
  }

  refreshForm() {
    const settings = { fields:{} };
    this.state.variables.forEach((variable, index) => {
      settings.fields['name' + index] = 'empty';
      settings.fields['value' + index] = 'empty';
    });
    $('.variable.ui.form').form(settings);
    $('.variable.ui.form').find('.error').removeClass('error').find('.prompt').remove();
  }

  onAddVariable(event) {
    event.preventDefault();
    const variables = this.state.variables;
    variables.push({
      name: '',
      value: '',
      description: ''
    });
    this.forceUpdate();
  }

  onRemoveVariable(event, index) {
    event.preventDefault();
    this.state.variables.splice(index, 1);
    this.forceUpdate();
  }

  onChangeVariable(event, index, property) {
    event.preventDefault();
    this.state.variables[index][property] = event.target.value;
    this.forceUpdate();
  }

  isFormValid() {
    $('.variable.ui.form').form('validate form');
    return $('.variable.ui.form').form('is valid');
  }

  renderVariable(variable, index) {
    const title = '-e ' + variable.name + '=' + variable.value;
    return (
      <div key={'variable' + index} className='fields'>
        <div className='five wide field required'>
          <label className='hidden'>Variable Name</label>
          <input title={title} type='text' value={variable.name} placeholder='The environment variable name' autoComplete='off'
            onChange={(event) => this.onChangeVariable(event, index, 'name')} data-validate={'name' + index} />
        </div>
        <div className='five wide field required'>
          <label className='hidden'>Variable Value</label>
          <input title={title} type='text' value={variable.value} placeholder='The environment variable value' autoComplete='off'
            onChange={(event) => this.onChangeVariable(event, index, 'value')} data-validate={'value' + index} />
        </div>
        <div className='five wide field'>
          <label className='hidden'>Description</label>
          <textarea rows='2' defaultValue={variable.description} placeholder='Describe this variable' autoComplete='off'
            onChange={(event) => this.onChangeVariable(event, index, 'description')} />
        </div>
        <div className='button field'>
          <button className='ui red icon button' onClick={(event) => this.onRemoveVariable(event, index)}>
            <i className='trash icon'></i>
          </button>
        </div>
      </div>
    );
  }


  render() {
    return (
      <HeadingBox className='variable ui form' icon='large settings icon' title='Variables'>
        {this.props.children || <div></div>}
        {(nbVariables => {
          if(nbVariables) {
            return (
              <div className='fields header'>
                <div className='five wide field required'>
                  <label>Variable Name</label>
                </div>
                <div className='five wide field required'>
                  <label>Variable Value</label>
                </div>
                <div className='five wide field'>
                  <label>Description</label>
                </div>
                <div className='one wide field'>
                  <label></label>
                </div>
              </div>
            );
          }
        })(this.state.variables.length)}
        {
          this.state.variables.map((variable, index) => {
              return (
                this.renderVariable(variable, index)
              );
        })}
        <div className='ui green small right folder open icon button' onClick={(event) => this.onAddVariable(event)}> <i className='plus icon'></i>Add variable</div>
      </HeadingBox>
    );
  }
};

VariablesBox.propTypes = {
  variables: React.PropTypes.array,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default VariablesBox;
