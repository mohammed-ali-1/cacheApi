process.env.NODE_ENV = 'test'

const expect = require('chai').expect
const request = require('supertest')

const app = require('../app')
const { connect } = require('./mockDb')
const { makeRandomString } = require('../helpers')

describe('GET /cache', () => {
  before(async () => {
    const collection = await connect('cacheApi', 'cache')
    const cacheItems = [
      {
        key: '1',
        value: makeRandomString(20),
        ttl: new Date(new Date().getTime() + 30 * 60000).getTime(),
      },
    ]
    collection.insertMany(cacheItems)
  })

  it('POST-ing an existing item should update it', (done) => {
    request(app)
      .post('/cache')
      .send({
        key: '1',
        value: 'HelloWorld',
      })
      .then((res) => {
        const statusCode = res.status
        expect(statusCode).to.equal(200)
        done()
      })
      .catch((err) => done(err))
  })

  it('POST-ing a new item should create it', (done) => {
    request(app)
      .post('/cache')
      .send({
        key: '10',
        value: 'HelloWorld',
      })
      .then((res) => {
        const statusCode = res.status
        expect(statusCode).to.equal(200)
        done()
      })
      .catch((err) => done(err))
  })

  it('POST-ing without key should fail', (done) => {
    request(app)
      .post('/cache')
      .send({
        value: 'HelloWorld',
      })
      .then((res) => {
        const statusCode = res.status
        expect(statusCode).to.equal(400)
        done()
      })
      .catch((err) => done(err))
  })
})
