import React, { Component } from 'react'
import { Modal, Button, Radio, OverlayTrigger, Tooltip, Glyphicon } from 'react-bootstrap'
import Markdown from 'react-markdown'
import axios from 'axios'
import _ from 'lodash'

import { LinkDocumentationProvider } from '~/components/Util/DocumentationProvider'

import SelectActionDropdown from './SelectActionDropdown'
import ParametersTable from './ParametersTable'
import ContentPickerWidget from '~/components/Content/Select/Widget'

const style = require('./style.scss')

export default class ActionModalForm extends Component {
  state = {
    actionType: 'message',
    avActions: [],
    actionMetadata: {},
    functionInputValue: '',
    messageValue: '',
    functionParams: {}
  }

  textToItemId = text => _.get(text.match(/^say #!(.*)$/), '[1]')

  getFunctionParamsDefinition = fn => _.get(fn, 'metadata.params') || []
  findFunctionByName = (functions, name) => functions.find(fn => fn.name === name)

  componentWillReceiveProps(nextProps) {
    const { item } = nextProps

    if (this.props.show || !nextProps.show) {
      return
    }

    if (item) {
      this.setState(
        {
          actionType: item.type,
          functionInputValue: item.functionName,
          messageValue: item.message,
          functionParams: item.parameters
        },
        () => {
          const { avActions, functionInputValue } = this.state
          const paramsDefinition = this.getFunctionParamsDefinition(
            this.findFunctionByName(avActions, functionInputValue)
          )
          this.setState({
            paramsDef: paramsDefinition
          })
        }
      )
    } else {
      this.resetForm()
    }
    this.setState({ isEdit: Boolean(item) })
  }

  componentDidMount() {
    this.fetchAvailableFunctions()
  }

  fetchAvailableFunctions() {
    return axios.get(`${window.BOT_API_PATH}/actions`).then(({ data }) => {
      this.setState({ avActions: data.filter(action => !action.metadata.hidden) })
    })
  }

  onChangeType = type => () => {
    this.setState({ actionType: type })
  }

  resetForm() {
    this.setState({
      actionType: 'message',
      functionInputValue: '',
      messageValue: ''
    })
  }

  renderSectionAction() {
    const { avActions } = this.state

    const tooltip = (
      <Tooltip id="notSeeingAction">
        Actions are registered on the server-side. Read about how to register new actions by searching for
        `bp.registerActions()`.
      </Tooltip>
    )

    const tooltip2 = (
      <Tooltip id="whatIsThis">
        You can change how the Action is executed by providing it parameters. Some parameters are required, some are
        optional.
      </Tooltip>
    )

    const help = (
      <OverlayTrigger placement="bottom" overlay={tooltip}>
        <span className={style.tip}>Can&apos;t see your action?</span>
      </OverlayTrigger>
    )

    const paramsHelp = <LinkDocumentationProvider file="memory" />

    const onParamsChange = params => {
      params = _.values(params).reduce((sum, n) => {
        if (n.key === '') {
          return sum
        }
        return { ...sum, [n.key]: n.value }
      }, {})
      this.setState({ functionParams: params })
    }

    // const args = JSON.stringify(this.state.functionParams, null, 4)

    const onAvActionsChange = val => {
      if (!val) {
        return
      }

      const fn = this.findFunctionByName(avActions, val.value)
      const paramsDefinition = this.getFunctionParamsDefinition(fn)

      this.setState({
        functionInputValue: val.value,
        paramsDef: paramsDefinition,
        actionMetadata: fn.metadata || {}
      })

      // TODO Detect if default or custom arguments
      if (
        Object.keys(this.state.functionParams || {}).length > 0 &&
        !confirm('Do you want to overwrite existing parameters?')
      ) {
        return
      }

      this.setState({
        functionParams: _.fromPairs(paramsDefinition.map(param => [param.name, param.default || '']))
      })
    }

    return (
      <div>
        <h5>Action to run {help}</h5>
        <div className={style.section}>
          <SelectActionDropdown
            value={this.state.functionInputValue}
            options={avActions}
            onChange={onAvActionsChange}
          />
          {this.state.actionMetadata.title && <h4>{this.state.actionMetadata.title}</h4>}
          {this.state.actionMetadata.description && <Markdown source={this.state.actionMetadata.description} />}
        </div>
        <h5>Action parameters {paramsHelp}</h5>
        <div className={style.section}>
          <ParametersTable
            ref={el => (this.parametersTable = el)}
            onChange={onParamsChange}
            value={this.state.functionParams}
            definitions={this.state.paramsDef}
          />
        </div>
      </div>
    )
  }

  renderSectionMessage() {
    const handleChange = item => {
      this.setState({ messageValue: `say #!${item.id}` })
    }

    const tooltip = (
      <Tooltip id="howMessageWorks">
        You can type a regular message here or you can also provide a valid UMM bloc, for example &quot;#help&quot;.
      </Tooltip>
    )

    const help = (
      <OverlayTrigger placement="bottom" overlay={tooltip}>
        <i className="material-icons">help</i>
      </OverlayTrigger>
    )

    const itemId = this.textToItemId(this.state.messageValue)

    return (
      <div>
        <h5>Message {help}:</h5>
        <div className={style.section}>
          <ContentPickerWidget itemId={itemId} onChange={handleChange} placeholder="Message to send" />
        </div>
      </div>
    )
  }

  render() {
    const props = this.props
    const noop = () => {}

    const onClose = props.onClose || noop
    const onSubmit = () => {
      const handler = props.onSubmit || noop
      this.resetForm()
      handler({
        type: this.state.actionType,
        functionName: this.state.functionInputValue,
        message: this.state.messageValue,
        parameters: this.state.functionParams
      })
    }

    return (
      <Modal animation={false} show={props.show} onHide={onClose} container={document.getElementById('app')}>
        <Modal.Header closeButton>
          <Modal.Title>{this.state.isEdit ? 'Edit' : 'Add new'} action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>The bot will:</h5>
          <div className={style.section}>
            <Radio checked={this.state.actionType === 'message'} onChange={this.onChangeType('message')}>
              💬 Say something
            </Radio>
            <Radio checked={this.state.actionType === 'code'} onChange={this.onChangeType('code')}>
              ⚡ Execute code <LinkDocumentationProvider file="action" />
            </Radio>
          </div>

          {this.state.actionType === 'message' ? this.renderSectionMessage() : this.renderSectionAction()}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} bsStyle="primary">
            {this.state.isEdit ? 'Update' : 'Add'} Action (Alt+Enter)
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
