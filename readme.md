# cachify-mongo || memoize-to-mongo

A simple utility function that transparently caches slow async calls to Mongo.

### API:

```javascript
const collection = getDbCollection() // A MongoDB Collection
const cachify = require("cachify-mongo")(collection)
const myAsyncFunction = require("...") // Any function that returns a promise

const cachedFunction = cachify(myAsyncFunction)
const myCustomCachedFn = cachify(myAsyncFunction, {
  expires: 60, // seconds
  keyFn: (a) => "something:" + a.id, // a fn that returns a string - must be unique
})

```
This module is especially useful for caching API calls.
