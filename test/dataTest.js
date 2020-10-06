require('should')
const data = require('../')
const templates = require('jsreport-templates')
const handlebars = require('jsreport-handlebars')
const jsreport = require('jsreport-core')
const Request = jsreport.Request

describe('data', () => {
  let reporter

  beforeEach(() => {
    reporter = jsreport()
    reporter.use(templates())
    reporter.use(handlebars())
    reporter.use(data())

    return reporter.init()
  })

  afterEach(() => {
    if (reporter) {
      return reporter.close()
    }
  })

  it('should accept null as data', async () => {
    const request = {
      template: { content: 'content', data: null, engine: 'handlebars', recipe: 'html' },
      options: { recipe: 'html' }
    }

    const res = await reporter.render(request)
    res.content.toString().should.be.eql('content')
  })

  it('should find and use data ref based on shortid', async () => {
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

  it('should find and use data ref based on name', async () => {
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

  it('should callback error when data ref does not exists', async () => {
    const request = Request({
      template: { content: 'html', data: { shortid: 'MnI0b0QwNXBhZHlRSXBhRg==' } },
      options: { recipe: 'html' }
    })

    try {
      await reporter.data.handleBeforeRender(request, {})
      throw new Error('Should fail')
    } catch (e) {
      e.message.should.not.be.eql('Should fail')
    }
  })

  it('should ignore extension when no data ref specified', async () => {
    const request = Request({
      template: { content: 'html', dataItemId: null },
      options: { recipe: 'html' }
    })

    await reporter.data.handleBeforeRender(request, {})

    request.data.should.be.eql({})
  })

  it('should ignore extension on child request when data is specificed on parent', async () => {
    const dataItem = {
      name: 'test',
      dataJson: JSON.stringify({ b: 'xx' })
    }

    await reporter.documentStore.collection('data').insert(dataItem)

    const parent = Request({
      context: {
        logs: []
      },
      template: { content: '{{a}}', engine: 'handlebars', recipe: 'html' },
      data: { a: 'a' }
    })

    const res = await reporter.render({
      template: { content: '{{a}}-{{b}}', data: { name: 'test' }, engine: 'handlebars', recipe: 'html' }
    }, parent)

    res.content.toString().should.be.eql('a-')
  })

  it('should ignore extension on child request when data is specified on child', async () => {
    const dataItem = {
      name: 'test',
      dataJson: JSON.stringify({ b: 'xx' })
    }

    await reporter.documentStore.collection('data').insert(dataItem)

    const parent = Request({
      context: {
        logs: []
      },
      template: { content: '{{a}}', engine: 'handlebars', recipe: 'html' }
    })

    const res = await reporter.render({
      template: { content: '{{a}}-{{b}}', data: { name: 'test' }, engine: 'handlebars', recipe: 'html' },
      data: { a: 'a', b: 'b' }
    }, parent)

    res.content.toString().should.be.eql('a-b')
  })

  it('should ignore extension on child request when data is specified on parent and child', async () => {
    const dataItem = {
      name: 'test',
      dataJson: JSON.stringify({ b: 'xx' })
    }

    await reporter.documentStore.collection('data').insert(dataItem)

    const parent = Request({
      context: {
        logs: []
      },
      template: { content: '{{a}}', engine: 'handlebars', recipe: 'html' },
      data: { a: 'a' }
    })

    const res = await reporter.render({
      template: { content: '{{a}}-{{b}}', data: { name: 'test' }, engine: 'handlebars', recipe: 'html' },
      data: { b: 'b' }
    }, parent)

    res.content.toString().should.be.eql('a-b')
  })

  it('should find and use data ref on child request when data is not specified on parent', async () => {
    const dataItem = {
      name: 'test',
      dataJson: JSON.stringify({ b: 'xx' })
    }

    await reporter.documentStore.collection('data').insert(dataItem)

    const parent = Request({
      context: {
        logs: []
      },
      template: { content: '{{a}}', engine: 'handlebars', recipe: 'html' }
    })

    const res = await reporter.render({
      template: { content: '{{b}}', data: { name: 'test' }, engine: 'handlebars', recipe: 'html' }
    }, parent)

    res.content.toString().should.be.eql('xx')
  })

  it('should ignore extension on child request if parent find and use data ref', async () => {
    const dataItem = {
      name: 'test',
      dataJson: JSON.stringify({ a: 'xx' })
    }

    const dataItem2 = {
      name: 'test2',
      dataJson: JSON.stringify({ b: 'bb' })
    }

    await reporter.documentStore.collection('data').insert(dataItem)
    await reporter.documentStore.collection('data').insert(dataItem2)

    const parent = Request({
      context: {
        logs: []
      },
      template: { content: '{{a}}', data: { name: 'test' }, engine: 'handlebars', recipe: 'html' }
    })

    await reporter.data.handleBeforeRender(parent, {})

    const res = await reporter.render({
      template: { content: '{{a}}-{{b}}', data: { name: 'test2' }, engine: 'handlebars', recipe: 'html' }
    }, parent)

    res.content.toString().should.be.eql('xx-')
  })

  it('should merge data on child request if parent find and use data ref and data is specified on child', async () => {
    const dataItem = {
      name: 'test',
      dataJson: JSON.stringify({ a: 'xx' })
    }

    await reporter.documentStore.collection('data').insert(dataItem)

    const parent = Request({
      context: {
        logs: []
      },
      template: { content: '{{a}}', data: { name: 'test' }, engine: 'handlebars', recipe: 'html' }
    })

    await reporter.data.handleBeforeRender(parent, {})

    const res = await reporter.render({
      template: { content: '{{a}}-{{b}}', engine: 'handlebars', recipe: 'html' },
      data: { b: 'bb' }
    }, parent)

    res.content.toString().should.be.eql('xx-bb')
  })
})
