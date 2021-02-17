const MongoClient = require('mongodb').MongoClient

let db
let collection
const mongoDbUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/cacheApi'

MongoClient.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10 })
  .then((client) => {
    db = client.db('cacheApi')
    collection = db.collection('cache')
  })
  .catch((error) => console.error(error))
