const { makeRandomString } = require('./helpers')
const { connect } = require('./db')

const cacheLimitCount = process.env.CACHE_LIMIT || 5
const defaultTtl = process.env.DEAFAULT_TTL || 30 //in minutes

const handleGetCacheKey = async (req, res) => {
  const cacheKey = req.params.cacheKey
  const query = { key: cacheKey }
  collection = await connect('cacheApi', 'cache')

  try {
    const cacheItem = await collection.findOne(query)
    //The key is not found in the cache:
    if (cacheItem === null) {
      console.log('Cache miss')
      const value = makeRandomString(24)

      //Before inserting, make sure the number of limited items is not exceeded
      const cacheItemsCount = await collection.countDocuments({})
      if (cacheItemsCount === cacheLimitCount) {
        //Get the oldest cache item and overwrite it
        const oldestItem = await collection.find().sort({ ttl: 1 }).limit(1).toArray()
        await collection.updateOne(
          { _id: oldestItem[0]['_id'] },
          {
            $set: {
              ttl: new Date(new Date().getTime() + defaultTtl * 60000).getTime(),
              key: cacheKey,
              value: value,
            },
          }
        )
      } else {
        collection.insertOne({
          key: cacheKey,
          value,
          ttl: new Date(new Date().getTime() + defaultTtl * 60000).getTime(),
        })
      }

      return res.status(200).json({ value })
    }

    //The key is found
    console.log('Cache hit')

    //The TTL is exceeded
    if (new Date().getTime() > cacheItem.ttl) {
      //Generate a new random value
      const newValue = makeRandomString(20)

      await collection.updateOne(
        { key: cacheKey },
        {
          $set: {
            ttl: new Date(new Date().getTime() + defaultTtl * 60000).getTime(),
            value: newValue,
          },
        }
      )

      return res.status(200).json({ value: newValue })
    }

    //Update the TTL of the hit cache item
    await collection.updateOne(
      { key: cacheKey },
      {
        $set: {
          ttl: new Date(new Date().getTime() + defaultTtl * 60000).getTime(),
        },
      }
    )

    return res.status(200).json({ value: cacheItem['value'] })
  } catch (error) {
    console.log(error)
    return res.status(500).end()
  }
}

const handleGetAllItems = async (req, res) => {
  collection = await connect('cacheApi', 'cache')

  try {
    const allItems = await collection.find({}).toArray()
    return res.status(200).json(allItems)
  } catch (error) {
    console.log(error)
    return res.status(500).end()
  }
}

const handleDeleteAllItems = async (req, res) => {
  collection = await connect('cacheApi', 'cache')

  try {
    const result = await collection.deleteMany({})
    if (result.deletedCount === 0) {
      return res.status(404).end()
    } else {
      return res.status(200).end()
    }
  } catch (error) {
    console.log(error)
    return res.status(500).end()
  }
}

const handleDeleteCacheKey = async (req, res) => {
  collection = await connect('cacheApi', 'cache')

  const cacheKey = req.params.cacheKey
  try {
    const result = await collection.deleteOne({ key: cacheKey })
    if (result.deletedCount === 0) {
      return res.status(404).end()
    } else {
      return res.status(200).end()
    }
  } catch (error) {
    console.log(error)
    return res.status(500).end()
  }
}

const handlePostCache = async (req, res) => {
  collection = await connect('cacheApi', 'cache')

  const cacheKey = req.body.key
  let value = req.body.value
  let ttl = req.body.ttl

  if (typeof cacheKey === 'undefined') {
    return res.status(400).json({ errorMessage: "The 'key' body parameter is required" })
  }

  if (typeof value === 'undefined') {
    value = makeRandomString(20)
  }

  if (typeof ttl === 'undefined') {
    ttl = defaultTtl
  }

  //Before inserting, make sure the number of limited items is not exceeded
  let cacheItemsCount
  try {
    cacheItemsCount = await collection.countDocuments({})
  } catch (error) {
    console.log(error)
    return res.status(500).end()
  }

  if (cacheItemsCount === cacheLimitCount) {
    //Get the oldest cache item and overwrite it
    try {
      const oldestItem = await collection.find().sort({ ttl: 1 }).limit(1).toArray()
      await collection.updateOne(
        { _id: oldestItem[0]['_id'] },
        {
          $set: {
            ttl: new Date(new Date().getTime() + ttl * 60000).getTime(),
            key: cacheKey,
            value: value,
          },
        }
      )
    } catch (error) {
      console.log(error)
      return res.status(500).end()
    }
  } else {
    const query = { key: cacheKey }
    const update = { $set: { value, ttl: new Date(new Date().getTime() + ttl * 60000).getTime() } }
    const options = { upsert: true }

    try {
      await collection.updateOne(query, update, options)
      return res.status(200).end()
    } catch (error) {
      console.log(error)
      return res.status(500).end()
    }
  }
}

module.exports = {
  handleGetCacheKey,
  handleGetAllItems,
  handleDeleteAllItems,
  handleDeleteCacheKey,
  handlePostCache,
}
