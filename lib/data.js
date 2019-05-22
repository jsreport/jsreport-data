/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * Extension which allows to specify some sample report data for designing purposes.
 */

class Data {
  constructor (reporter, definition) {
    this.reporter = reporter
    this.definition = definition

    reporter.documentStore.registerEntityType('DataItemType', {
      dataJson: { type: 'Edm.String', document: { extension: 'json' } },
      name: { type: 'Edm.String', publicKey: true }
    })

    reporter.documentStore.registerComplexType('DataItemRefType', {
      shortid: { type: 'Edm.String' }
    })

    reporter.documentStore.registerEntitySet('data', {
      entityType: 'jsreport.DataItemType',
      splitIntoDirectories: true
    })

    reporter.documentStore.model.entityTypes['TemplateType'].data = {
      // this makes the reference to accept null also when validating with json schema
      type: 'jsreport.DataItemRefType', schema: { type: 'null' }
    }

    reporter.beforeRenderListeners.insert({ after: 'templates' }, definition.name, this, this.handleBeforeRender.bind(this))
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
        throw this.reporter.createError(`Data entry not found (${(request.template.data.shortid || request.template.data.name)})`, {
          statusCode: 404
        })
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
      throw this.reporter.createError(`Failed to parse data json`, {
        weak: true,
        statusCode: 400,
        original: e
      })
    }
  }
}

module.exports = function (reporter, definition) {
  reporter.data = new Data(reporter, definition)
}
