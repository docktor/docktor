// React
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

// Actions for redux container
import ModalActions from '../../../modules/modal/modal.actions.js';

// Components
import Rodal from 'rodal';

// Style
import './modal.component.scss';

// Modal Component
class Modal extends React.Component {

  validate(modal, onClose) {
    return () => {
      let  settings = {
        onSuccess: () => {
          modal.callback($('#modal-form').form('get values'));
          onClose();
        }
      };
      settings.fields = {};
      modal.form.lines.forEach( line => {
        line.fields.forEach( field => {
          if(field.required) {
            settings.fields[field.name] = 'empty';
          }
        });
      });
      $('#modal-form').form(settings);
      $('#modal-form').form('validate form');
    };
  }

  closeModal() {
    $('#modal-form').find('.ui.error.message ul').remove();
    $('#modal-form').find('fields .error').removeClass('error').find('.prompt').remove();
    this.props.onClose();
  }

  render() {
    const modal = this.props.modal;
    const onClose = () => this.closeModal();
    const modalClasses = classNames(
      'ui',
      { active: modal.isVisible },
      'small modal'
    );
    return (
      <Rodal visible={modal.isVisible}
          onClose={onClose}
          showCloseButton={false}
          animation={modal.animation}>
        <div className={modalClasses}>
          <i className='close circle icon' onClick={onClose} />
          <div className='header'>{modal.title}</div>
          <div className='content'>
            <div id='modal-form' className='ui form' ref='form'>
              {modal.form.hidden.map( input => (
                <input key={input.name} type='hidden' name={input.name} defaultValue={input.value}/>
              ))}
              {modal.form.lines.map( (line, index) => (
                <div key={index} className={line.class + ' fields'}>
                {line.fields.map(field => (
                  <div className={(field.required ? 'required' : '') + ' field'} key={field.name}>
                    <label>{field.label ? field.label : field.name}</label>
                    <div className='ui fluid input'>
                      <input type={field.type} name={field.name} placeholder={field.desc} defaultValue={field.value}/>
                    </div>
                  </div>
                ))}
                </div>
              ))}
              <div className='ui error message' />
            </div>
          </div>
          <div className='actions'>
            <div className='ui black button' onClick={onClose}>
              Cancel
            </div>
            <div className='ui teal right labeled icon button' onClick={this.validate(modal, onClose)}>
              Validate
              <i className='checkmark icon' />
            </div>
          </div>
        </div>
      </Rodal>
    );
  }
}
Modal.propTypes = { modal: React.PropTypes.object, onClose:React.PropTypes.func };

// Function to map state to container props
const mapStateToModalProps = (state) => {
  return { modal: state.modal };
};

// Function to map dispatch to container props
const mapDispatchToModalProps = (dispatch) => {
  return { onClose: () => dispatch(ModalActions.closeModal()) };
};

// Redux container to Sites component
const ModalContainer = connect(
    mapStateToModalProps,
    mapDispatchToModalProps
)(Modal);

export default ModalContainer;
