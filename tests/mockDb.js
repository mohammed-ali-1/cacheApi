const mongodb = require('mongo-mock')
const MongoClient = mongodb.MongoClient
const mongoDbUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/cacheApi'
mongodb.max_delay = 0 //you can choose to NOT pretend to be async (default is 400ms)

async function connect(dbName, collectionName) {
  const collection = await MongoClient.connect(mongoDbUrl).then((client) => {
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    return collection
  })

  return collection
}

module.exports = {
  connect,
}
