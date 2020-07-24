import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { TextEditor } from 'jsreport-studio'

export default class DataEditor extends Component {
  render () {
    const { entity, onUpdate } = this.props

    return (
      <TextEditor
        name={entity._id}
        mode='json'
        value={entity.dataJson || ''}
        onUpdate={(v) => onUpdate(Object.assign({}, entity, { dataJson: v }))}
      />
    )
  }
}

DataEditor.propTypes = {
  entity: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
}
