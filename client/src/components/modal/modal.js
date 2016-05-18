// React
import React from 'react'
import { connect } from 'react-redux'

// Actions for redux container
import { closeModal } from '../../actions/modal.actions.js'

// Components
import Rodal from 'rodal'

// JS dependancies
import 'jquery'
import form from 'semantic-ui-form/form.min.js'
$.form = form

// Style
import 'semantic-ui-modal/modal.min.css'
import 'semantic-ui-button/button.min.css'
import 'semantic-ui-icon/icon.min.css'
import 'semantic-ui-form/form.min.css'
import 'semantic-ui-input/input.min.css'
import './modal.scss'

// Modal Component
class Modal extends React.Component {
    
    validate(modal, onClose) {
        return () => {
            let  settings = {
                onSuccess: () => {
                    modal.callback($('#modal-form').form('get values'))
                    onClose()
                }
            }
            settings.fields = {}
            modal.form.lines.forEach( line => {
                line.fields.forEach( field => {
                    if(field.required) {
                        settings.fields[field.name] = 'empty'
                    }
                })
            })
            $("#modal-form").form(settings)
            $('#modal-form').form('validate form')
        }
    }

    render() {
        const modal = this.props.modal
        const onClose = this.props.onClose
        return (
            <Rodal visible={modal.isVisible}
                onClose={onClose}
                showCloseButton={false}
                animation={modal.animation}>
                <div className="ui active modal">
                    <i className="close icon" onClick={onClose}></i>
                    <div className="header">{modal.title}</div>
                    <div className="content">
                        <div id="modal-form" className="ui form" ref="form">
                            {modal.form.hidden.map( input => (
                                <input key={input.name} type="hidden" name={input.name} defaultValue={input.value}/>
                            ))}
                            {modal.form.lines.map( (line, index) => (
                                <div key={index} className={line.class + " fields"}>
                                {line.fields.map(field => (
                                    <div className={(field.required ? "required" : "") + " field"} key={field.name}>
                                        <label>{field.name}</label>
                                        <div className="ui fluid input">
                                            <input type={field.type} name={field.name} placeholder={field.desc} defaultValue={field.value}/>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="actions">
                        <div className="ui black deny button" onClick={onClose}>
                            Cancel
                        </div>
                        <div className="ui positive right labeled icon button" onClick={this.validate(modal, onClose)}>
                            Validate
                            <i className="checkmark icon"></i>
                        </div>
                    </div>
                </div>
            </Rodal>
        )
    }
}

// Function to map state to container props
const mapStateToModalProps = (state) => {
    return { modal: state.modal }
}

// Function to map dispatch to container props
const mapDispatchToModalProps = (dispatch) => {
    return { onClose: () => dispatch(closeModal()) }
}

// Redux container to Sites component
const ModalContainer = connect(
    mapStateToModalProps,
    mapDispatchToModalProps
)(Modal)

export default ModalContainer