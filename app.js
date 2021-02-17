const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

let db
let collection
const mongoDbUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/cacheApi'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
MongoClient.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10 })
  .then((client) => {
    db = client.db('cacheApi')
    collection = db.collection('cache')
  })
  .catch((error) => console.error(error))

const handleGetCacheKey = async (req, res) => {
  const cacheKey = req.params.cacheKey
  const query = { key: cacheKey }

  try {
    const cacheItem = await collection.findOne(query)
    //The key is not found in the cache:
    if (cacheItem === null) {
      console.log('Cache miss')
      const value = makeRandomString(24)

      //Before inserting, make sure the number of limited items is not exceeded
      const cacheItemsCount = await collection.countDocuments({})
      if (cacheItemsCount > cacheLimitCount) {
        //Get the oldest cache item and overwrite it
        const oldestItem = await collection.find().sort({ ttl: 1 }).limit(1).toArray()[0]
        await collection.updateOne(
          { _id: oldestItem._id },
          {
            $set: {
              ttl: new Date(new Date().getTime() + defaultTtl * 60000),
              key: cacheKey,
              value: value,
            },
          }
        )
      } else {
        collection.insertOne({
          key: cacheKey,
          value,
          ttl: new Date(new Date().getTime() + defaultTtl * 60000),
        })
      }

      return res.status(200).json({ value })
    }

    //The key is found
    console.log('Cache hit')

    //Update the TTL of the hit cache item
    await collection.updateOne(
      { key: cacheKey },
      {
        $set: {
          ttl: new Date(new Date().getTime() + defaultTtl * 60000),
        },
      }
    )

    return res.status(200).json(cacheItem)
  } catch (error) {
    console.log(error)
    return res.status(500).end()
  }
}

const handleDeleteCacheKey = async (req, res) => {}

app.get('/cache/:cacheKey', handleGetCacheKey)

app.delete('/cache/:cacheKey', handleDeleteCacheKey)

app.get('/cache', (req, res) => {})
app.post('/cache', (req, res) => {})
app.delete('/cache', (req, res) => {})

module.exports = app
