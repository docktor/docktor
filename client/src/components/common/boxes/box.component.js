// React
import React from 'react';

import HeadingBox from './heading.box.component.js';

import './box.component.scss';

// Box is a form with list of lines
class Box extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { lines : props.lines || [] };
  }

  componentDidMount() {
    $('.' + this.props.boxId + ' .ui.dropdown').dropdown();
    this.refreshForm();
  }

  componentDidUpdate() {
    $('.' + this.props.boxId + ' .ui.dropdown').dropdown();
    this.refreshForm();
    this.props.onChange(this.state.lines);
  }

  refreshForm() {
    const settings = { fields:{} };
    this.state.lines.forEach((line, index) => {
      this.props.form.fields.forEach(field => {
        if (field.isRequired) {
          settings.fields[field.name + index] = 'empty';
        }
      });
    });
    $('.' + this.props.boxId + '.ui.form').form(settings);
    $('.' + this.props.boxId + '.ui.form').find('.error').removeClass('error').find('.prompt').remove();
  }

  onAddLine(event) {
    event.preventDefault();
    const state = { lines: [...this.state.lines] };
    const line = {};
    this.props.form.fields.forEach(field => {
      line[field.name] = '';
    });
    state.lines.push(line);
    this.setState(state);
  }

  onRemoveLine(event, index) {
    event.preventDefault();
    const state = { lines: [...this.state.lines] };
    state.lines.splice(index, 1);
    this.setState(state);
  }

  onChangeLine(event, index, property) {
    event.preventDefault();
    const state = { lines: [...this.state.lines] };
    state.lines[index][property] = event.target.value;
    this.setState(state);
  }

  isFormValid() {
    $('.' + this.props.boxId + '.ui.form').form('validate form');
    return $('.' + this.props.boxId + '.ui.form').form('is valid');
  }

  renderDropdown(line, index, field, popup) {
    return (
      <div key={field.name + index} className={field.sizeClass + ' field' + (field.isRequired ? ' required' : '')}>
        <label className='hidden'>{field.label}</label>
        <select title={popup} value={line[field.name] || ''} className='ui fluid dropdown'
            onChange={(event) => this.onChangeLine(event, index, field.name)} data-validate={field.name + index}>
          <option value='' disabled>{field.placeholder}</option>
          {field.options.map(option => {
            return (<option key={'option-' + option.value} value={option.value}>{option.name}</option>);
          })}
        </select>
      </div>
    );
  }

  renderTextArea(line, index, field, popup) {
    return (
      <div key={field.name + index} className={field.sizeClass + ' field' + (field.isRequired ? ' required' : '')}>
        <label className='hidden'>{field.label}</label>
        <textarea title={popup} rows={field.rows} value={line[field.name]} placeholder={field.placeholder} autoComplete='off'
          onChange={(event) => this.onChangeLine(event, index, field.name)} data-validate={field.name + index} />
      </div>
    );
  }

  renderField(line, index, field, popup) {
    return (
      <div key={field.name + index} className={field.sizeClass + ' field' + (field.isRequired ? ' required' : '')}>
        <label className='hidden'>{field.label}</label>
        <input title={popup} type={field.type || 'text'} value={line[field.name]} placeholder={field.placeholder} autoComplete='off'
          onChange={(event) => this.onChangeLine(event, index, field.name)} data-validate={field.name + index} />
      </div>
    );
  }

  renderLine(boxId, line, index) {
    const form = this.props.form;
    const popup = this.props.form.getTitle(line);
    return (
      <div key={boxId + index} className='fields'>
        {form.fields.map(field => {
          if (field.type === 'select') {
            return this.renderDropdown(line, index, field, popup);
          } else if (field.type === 'textarea') {
            return this.renderTextArea(line, index, field, popup);
          } else {
            return this.renderField(line, index, field, popup);
          }
        })}
        <div className='button field'>
          <button className='ui red icon button' onClick={(event) => this.onRemoveLine(event, index)}>
            <i className='trash icon'></i>
          </button>
        </div>
      </div>
    );
  }


  render() {
    const boxId = this.props.boxId;
    const title = this.props.title;
    const icon = this.props.icon;
    const form = this.props.form;
    return (
      <HeadingBox className={boxId + ' box-component ui form'} icon={icon} title={title}>
        {this.props.children || ''}
        {
          this.state.lines.length ?
            <div className='fields header'>
              {form.fields.map(field => {
                return (
                  <div key={'header-' + field.name} className={field.sizeClass + ' field' + (field.isRequired ? ' required' : '')}>
                    <label>{field.label}</label>
                  </div>
                );
              })}
              <div className='one wide field'>
                <label></label>
              </div>
            </div>
          :
            ''
        }
        {this.state.lines.map((line, index) => {
          return this.renderLine(boxId, line, index);
        })}
        <div className='ui green small right folder open icon button' onClick={(event) => this.onAddLine(event)}><i className='plus icon'></i>{'Add ' + title}</div>
      </HeadingBox>
    );
  }
};

Box.propTypes = {
  boxId: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  icon: React.PropTypes.string.isRequired,
  lines: React.PropTypes.array.isRequired,
  form: React.PropTypes.object.isRequired,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ]),
  onChange: React.PropTypes.func.isRequired
};

export default Box;
