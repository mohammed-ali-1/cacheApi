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
      {
        key: '2',
        value: makeRandomString(20),
        ttl: new Date(new Date().getTime() + 30 * 60000).getTime(),
      },
    ]
    collection.insertMany(cacheItems)
  })

  it('Getting all items should return them all', (done) => {
    request(app)
      .get('/cache')
      .then((res) => {
        const body = res.body
        expect(body).to.contain.property('items')
        expect(body.items.length).to.equal(2)
        done()
      })
      .catch((err) => done(err))
  })
})
