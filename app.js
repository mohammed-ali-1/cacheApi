const express = require('express')
const bodyParser = require('body-parser')
const {
  handleDeleteAllItems,
  handleDeleteCacheKey,
  handleGetAllItems,
  handleGetCacheKey,
  handlePostCache,
} = require('./handlers')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/cache/:cacheKey', handleGetCacheKey)
app.delete('/cache/:cacheKey', handleDeleteCacheKey)
app.get('/cache', handleGetAllItems)
app.post('/cache', handlePostCache)
app.delete('/cache', handleDeleteAllItems)

module.exports = app
