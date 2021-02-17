process.env.NODE_ENV = 'test'

const expect = require('chai').expect
const request = require('supertest')

const app = require('../app')

describe('GET /cache/:cacheKey', () => {
  it('Getting a non existent cache key creates a new one', (done) => {
    request(app)
      .get('/cache/1')
      .then((res) => {
        const body = res.body
        expect(body).to.contain.property('value')
        done()
      })
      .catch((err) => done(err))
  })

  it('Getting an existent cache key', (done) => {
    request(app)
      .get('/cache/1')
      .then((res) => {
        const body = res.body
        expect(body).to.contain.property('value')
        done()
      })
      .catch((err) => done(err))
  })
})
