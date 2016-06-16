var assert = require('assert')
var data = require('../')
var templates = require('jsreport-templates')
var jsreport = require('jsreport-core')

describe('data', function () {
  var reporter

  beforeEach(function (done) {
    reporter = jsreport()
    reporter.use(templates())
    reporter.use(data())

    reporter.init().then(function () {
      done()
    }).fail(done)
  })

  it('should find and use data based on shortid', function (done) {
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
        done()
      })
    }).catch(done)
  })

  it('should find and use data based on name', function (done) {
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
        done()
      })
    }).catch(done)
  })

  it('should callback error when missing data', function (done) {
    var request = {
      reporter: reporter,
      logger: reporter.logger,
      template: {content: 'html', data: {shortid: 'MnI0b0QwNXBhZHlRSXBhRg=='}},
      options: {recipe: 'html'}
    }

    return reporter.data.handleBeforeRender(request, {}).fail(function (err) {
      assert.notEqual(null, err)
      done()
    })
  })

  it('should ignore extension when no data specified', function (done) {
    var request = {
      reporter: reporter,
      logger: reporter.logger,
      template: {content: 'html', dataItemId: null},
      options: {recipe: 'html'}
    }

    reporter.data.handleBeforeRender(request, {}).then(function () {
      done()
    }).catch(done)
  })
})
