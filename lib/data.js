/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * Extension which allows to specify some sample report data for designing purposes.
 */

var Promise = require('bluebird')
var shortid = require('shortid')

var Data = function (reporter, definition) {
  var self = this
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
    dataJson: {type: 'Edm.String'},
    shortid: {type: 'Edm.String'}
  })

  reporter.documentStore.registerEntitySet('data', {
    entityType: 'jsreport.DataItemType',
    humanReadableKey: 'shortid',
    splitIntoDirectories: true
  })
  reporter.documentStore.model.entityTypes['TemplateType'].data = {type: 'jsreport.DataItemRefType'}

  reporter.initializeListeners.add('data', function () {
    var col = self.reporter.documentStore.collection('data')
    col.beforeUpdateListeners.add('data', function (query, update) {
      update.$set.modificationDate = new Date()
    })
    col.beforeInsertListeners.add('data', function (doc) {
      doc.shortid = doc.shortid || shortid.generate()
      doc.creationDate = new Date()
      doc.modificationDate = new Date()
    })
  })

  reporter.beforeRenderListeners.insert({after: 'templates'}, definition.name, this, Data.prototype.handleBeforeRender)
}

Data.prototype.handleBeforeRender = function (request, response) {
  if (request.data) {
    request.logger.debug('Inline data specified.')
    return
  }

  request.data = request.data || {}

  if (!request.template.data || (!request.template.data.shortid && !request.template.data.dataJson && !request.template.data.name)) {
    request.logger.debug('Data item not defined for this template.')
    return
  }

  var self = this

  function findDataItem () {
    if (request.template.data.dataJson) {
      request.logger.warn(
        'Using "template.data.dataJson" is deprecated and it will be removed in future versions, ' +
        'You should pass the data as "data" property next to "template" property in request body.\n' +
        'Ex: { template: { ...template options here...}, data: { ...your data properties here... } }'
      )
      return Promise.resolve(request.template.data)
    }

    var query = {}
    if (request.template.data.shortid) {
      query.shortid = request.template.data.shortid
    }

    if (request.template.data.name) {
      query.name = request.template.data.name
    }

    return self.reporter.documentStore.collection('data').find(query, request).then(function (items) {
      if (items.length !== 1) {
        throw new Error('Data entry not found (' + (request.template.data.shortid || request.template.data.name) + ')')
      }

      request.logger.debug('Adding sample data ' + (request.template.data.name || request.template.data.shortid))
      return items[0]
    })
  }

  return findDataItem().then(function (di) {
    if (!di) {
      return
    }

    di = di.dataJson || di
    request.data = JSON.parse(di)
  }).catch(function (e) {
    e.weak = true
    throw e
  })
}

module.exports = function (reporter, definition) {
  reporter[definition.name] = new Data(reporter, definition)
}
