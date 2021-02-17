const MongoClient = require('mongodb').MongoClient
const mongoDbUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/cacheApi'

async function connect(dbName, collectionName) {
  const collection = await MongoClient.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10,
  }).then((client) => {
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    return collection
  })

  return collection
}

module.exports = {
  connect,
}
