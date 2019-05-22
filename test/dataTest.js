require('should')
const data = require('../')
const templates = require('jsreport-templates')
const handlebars = require('jsreport-handlebars')
const jsreport = require('jsreport-core')

describe('data', () => {
  let reporter

  beforeEach(() => {
    reporter = jsreport()
    reporter.use(templates())
    reporter.use(handlebars())
    reporter.use(data())

    return reporter.init()
  })

  it('should accept null as data', async () => {
    const request = {
      template: { content: 'content', data: null, engine: 'handlebars', recipe: 'html' },
      options: { recipe: 'html' }
    }

    const res = await reporter.render(request)
    res.content.toString().should.be.eql('content')
  })

  it('should find and use data based on shortid', async () => {
    const dataItem = {
      name: 'test',
      dataJson: JSON.stringify({ a: 'xx' })
    }

    const data = await reporter.documentStore.collection('data').insert(dataItem)
    const request = {
      template: { content: '{{a}}', data: { shortid: data.shortid }, engine: 'handlebars', recipe: 'html' },
      options: { recipe: 'html' }
    }

    const res = await reporter.render(request)
    res.content.toString().should.be.eql('xx')
  })

  it('should find and use data based on name', async () => {
    const dataItem = {
      name: 'test',
      dataJson: JSON.stringify({ a: 'xx' })
    }

    await reporter.documentStore.collection('data').insert(dataItem)
    const request = {
      template: { content: '{{a}}', data: { name: 'test' }, engine: 'handlebars', recipe: 'html' },
      options: { recipe: 'html' }
    }

    const res = await reporter.render(request)
    res.content.toString().should.be.eql('xx')
  })

  it('should callback error when missing data', async () => {
    const request = {
      template: { content: 'html', data: { shortid: 'MnI0b0QwNXBhZHlRSXBhRg==' } },
      options: { recipe: 'html' }
    }

    try {
      await reporter.data.handleBeforeRender(request, {})
      throw new Error('Should fail')
    } catch (e) {
      e.message.should.not.be.eql('Should fail')
    }
  })

  it('should ignore extension when no data specified', () => {
    const request = {
      template: { content: 'html', dataItemId: null },
      options: { recipe: 'html' }
    }

    return reporter.data.handleBeforeRender(request, {})
  })
})
