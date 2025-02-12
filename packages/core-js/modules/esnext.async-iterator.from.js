// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var getAsyncIterator = require('../internals/get-async-iterator');
var getIterator = require('../internals/get-iterator');
var getIteratorDirect = require('../internals/get-iterator-direct');
var getIteratorMethod = require('../internals/get-iterator-method');
var getMethod = require('../internals/get-method');
var wellKnownSymbol = require('../internals/well-known-symbol');
var AsyncFromSyncIterator = require('../internals/async-from-sync-iterator');
var WrapAsyncIterator = require('../internals/async-iterator-wrap');

var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

$({ target: 'AsyncIterator', stat: true, forced: true }, {
  from: function from(O) {
    var object = toObject(O);
    var usingIterator = getMethod(object, ASYNC_ITERATOR);
    var iteratorRecord;
    if (usingIterator) {
      iteratorRecord = getIteratorDirect(getAsyncIterator(object, usingIterator));
      if (isPrototypeOf(AsyncIteratorPrototype, iteratorRecord.iterator)) return iteratorRecord.iterator;
    }
    if (iteratorRecord === undefined) {
      usingIterator = getIteratorMethod(object);
      if (usingIterator) iteratorRecord = getIteratorDirect(new AsyncFromSyncIterator(
        getIteratorDirect(getIterator(object, usingIterator))
      ));
    }
    return new WrapAsyncIterator(iteratorRecord !== undefined ? iteratorRecord : getIteratorDirect(object));
  }
});
