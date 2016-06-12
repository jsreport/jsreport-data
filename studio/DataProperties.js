import React, { Component } from 'react'

export default class Properties extends Component {
  static selectDataItems (entities) {
    return Object.keys(entities).filter((k) => entities[k].__entitySet === 'data').map((k) => entities[k])
  }

  static title (entity, entities) {
    if (!entity.data || !entity.data.shortid) {
      return 'data'
    }

    const foundItems = Properties.selectDataItems(entities).filter((e) => entity.data.shortid === e.shortid)

    if (!foundItems.length) {
      return 'data'
    }

    return 'sample data: ' + foundItems[0].name
  }

  render () {
    const { entity, entities, onChange } = this.props
    const dataItems = Properties.selectDataItems(entities)

    return (
      <div className='properties-section'>
        <div className='form-group'>
          <select
            value={entity.data ? entity.data.shortid : ''}
            onChange={(v) => onChange({_id: entity._id, data: v.target.value !== 'empty' ? { shortid: v.target.value } : null})}>
            <option key='empty' value='empty'>- not selected -</option>
            {dataItems.map((e) => <option key={e.shortid} value={e.shortid}>{e.name}</option>)}
          </select>
        </div>
      </div>
    )
  }
}

