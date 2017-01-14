const R = require("ramda")

const DEFAULT_EXPIRY = 30 // seconds
const NO_RESULT = Symbol("@cachify.NO_RESULT")

const whenNoResult = R.when(R.equals(NO_RESULT))

const ensureIndexes = (collection) => {
  collection.createIndex({expireAt: 1}, {expireAfterSeconds: 0})
  collection.createIndex({key: 1}, {unique: true})
}

const getCached = (collection, key) => {
  return collection.findOne({key})
  .then(R.unless(R.identity, R.always(NO_RESULT)))
}

const getAndCache = (collection, fn, args, key, expiry) => {
  return fn(...args)
  .then((result) => {
    const expireAt = new Date(Date.now() + expiry)
    collection.insertOne({key, result, expireAt})
    return result
  })
}

const cachify = (collection) => {
  ensureIndexes(collection)
  return (asyncFn, options = {}) => {
    const keyFn = options.keyFn || R.identity
    const expiry = (options.expires || DEFAULT_EXPIRY) * 1000
    return function cachifedFn(...args) {
      let key
      try {
        key = keyFn(...args)
      } catch (e) {
        return Promise.reject(e)
      }
      return getCached(collection, key)
      .then(whenNoResult(() => getAndCache(collection, asyncFn, args, key, expiry)))
    }
  }
}

module.exports = cachify
