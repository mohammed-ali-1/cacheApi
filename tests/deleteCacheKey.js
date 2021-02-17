process.env.NODE_ENV = 'test'

const expect = require('chai').expect
const request = require('supertest')

const app = require('../app')
const { connect } = require('./mockDb')
const { makeRandomString } = require('../helpers')

describe('GET /cache/:cacheKey', () => {
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

  it('Deleting a cache item using key should return 200', (done) => {
    request(app)
      .delete('/cache/1')
      .then((res) => {
        const statusCode = res.status
        expect(statusCode).to.equal(200)
        done()
      })
      .catch((err) => done(err))
  })

  it('Deleting a deleted cache item using should return 404', (done) => {
    request(app)
      .delete('/cache/1')
      .then((res) => {
        const statusCode = res.status
        expect(statusCode).to.equal(404)
        done()
      })
      .catch((err) => done(err))
  })
})
