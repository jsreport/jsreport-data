/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * Extension which allows to specify some sample report data for designing purposes.
 */
const nanoid = require('nanoid')

class Data {
  constructor (reporter, definition) {
    this.reporter = reporter
    this.definition = definition

    reporter.documentStore.registerEntityType('DataItemType', {
      _id: {type: 'Edm.String', key: true},
      dataJson: {type: 'Edm.String', document: {extension: 'json'}},
      name: {type: 'Edm.String', publicKey: true},
      creationDate: {type: 'Edm.DateTimeOffset'},
      shortid: {type: 'Edm.String'},
      modificationDate: {type: 'Edm.DateTimeOffset'}
    })

    reporter.documentStore.registerComplexType('DataItemRefType', {
      shortid: {type: 'Edm.String'}
    })

    reporter.documentStore.registerEntitySet('data', {
      entityType: 'jsreport.DataItemType',
      humanReadableKey: 'shortid',
      splitIntoDirectories: true
    })
    reporter.documentStore.model.entityTypes['TemplateType'].data = {type: 'jsreport.DataItemRefType'}

    reporter.initializeListeners.add('data', () => {
      const col = this.reporter.documentStore.collection('data')
      col.beforeUpdateListeners.add('data', (query, update) => (update.$set.modificationDate = new Date()))
      col.beforeInsertListeners.add('data', (doc) => {
        doc.shortid = doc.shortid || nanoid(7)
        doc.creationDate = new Date()
        doc.modificationDate = new Date()
      })
    })

    reporter.beforeRenderListeners.insert({after: 'templates'}, definition.name, this, this.handleBeforeRender.bind(this))
  }

  async handleBeforeRender (request, response) {
    if (request.data) {
      this.reporter.logger.debug('Inline data specified.', request)
      return
    }

    request.data = request.data || {}

    if (!request.template.data || (!request.template.data.shortid && !request.template.data.name)) {
      this.reporter.logger.debug('Data item not defined for this template.', request)
      return
    }

    const findDataItem = async () => {
      const query = {}
      if (request.template.data.shortid) {
        query.shortid = request.template.data.shortid
      }

      if (request.template.data.name) {
        query.name = request.template.data.name
      }

      const items = await this.reporter.documentStore.collection('data').find(query, request)
      if (items.length !== 1) {
        throw new Error('Data entry not found (' + (request.template.data.shortid || request.template.data.name) + ')')
      }

      this.reporter.logger.debug('Adding sample data ' + (request.template.data.name || request.template.data.shortid), request)
      return items[0]
    }

    try {
      let di = await findDataItem()
      if (!di) {
        return
      }
      di = di.dataJson || di
      request.data = JSON.parse(di)
    } catch (e) {
      e.weak = true
      throw e
    }
  }
}

module.exports = function (reporter, definition) {
  reporter.data = new Data(reporter, definition)
}
