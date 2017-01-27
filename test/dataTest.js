var assert = require('assert')
var data = require('../')
var templates = require('jsreport-templates')
var jsreport = require('jsreport-core')

describe('data', function () {
  var reporter

  beforeEach(function () {
    reporter = jsreport()
    reporter.use(templates())
    reporter.use(data())

    return reporter.init()
  })

  it('should find and use data based on shortid', function () {
    var dataItem = {
      name: 'test',
      dataJson: JSON.stringify({a: 'xx'}) + ''
    }

    return reporter.documentStore.collection('data').insert(dataItem).then(function (data) {
      var request = {
        reporter: reporter,
        logger: reporter.logger,
        template: {content: 'html', data: {shortid: data.shortid}},
        options: {recipe: 'html'}
      }

      return reporter.data.handleBeforeRender(request, {}).then(function () {
        assert.equal(request.data.a, JSON.parse(dataItem.dataJson).a)
      })
    })
  })

  it('should find and use data based on name', function () {
    var dataItem = {
      name: 'test',
      dataJson: JSON.stringify({a: 'xx'}) + ''
    }

    return reporter.documentStore.collection('data').insert(dataItem).then(function (data) {
      var request = {
        reporter: reporter,
        logger: reporter.logger,
        template: {content: 'html', data: {name: 'test'}},
        options: {recipe: 'html'}
      }

      return reporter.data.handleBeforeRender(request, {}).then(function () {
        assert.equal(request.data.a, JSON.parse(dataItem.dataJson).a)
      })
    })
  })

  it('should callback error when missing data', function () {
    var request = {
      reporter: reporter,
      logger: reporter.logger,
      template: {content: 'html', data: {shortid: 'MnI0b0QwNXBhZHlRSXBhRg=='}},
      options: {recipe: 'html'}
    }

    return reporter.data.handleBeforeRender(request, {}).catch(function (err) {
      assert.notEqual(null, err)
    })
  })

  it('should ignore extension when no data specified', function () {
    var request = {
      reporter: reporter,
      logger: reporter.logger,
      template: {content: 'html', dataItemId: null},
      options: {recipe: 'html'}
    }

    return reporter.data.handleBeforeRender(request, {})
  })
})
