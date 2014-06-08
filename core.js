/**
 * Core.js v0.0.7
 * http://core.zloirock.ru
 * © 2014 Denis Pushkarev
 * Available under MIT license
 */
!function(global, framework, undefined){
'use strict';
/*****************************
 * Module : core
 *****************************/

// Shortcuts for property names
var OBJECT         = 'Object'
  , FUNCTION       = 'Function'
  , ARRAY          = 'Array'
  , STRING         = 'String'
  , NUMBER         = 'Number'
  , REGEXP         = 'RegExp'
  , MAP            = 'Map'
  , SET            = 'Set'
  , WEAKMAP        = 'WeakMap'
  , WEAKSET        = 'WeakSet'
  , PROMISE        = 'Promise'
  , ARGUMENTS      = 'Arguments'
  , PROCESS        = 'process'
  , PROTOTYPE      = 'prototype'
  , CONSTRUCTOR    = 'constructor'
  , FOR_EACH       = 'forEach'
  , CREATE_ELEMENT = 'createElement'
  // Aliases global objects and prototypes
  , Function       = global[FUNCTION]
  , Object         = global[OBJECT]
  , Array          = global[ARRAY]
  , String         = global[STRING]
  , Number         = global[NUMBER]
  , RegExp         = global[REGEXP]
  , Map            = global[MAP]
  , Set            = global[SET]
  , WeakMap        = global[WEAKMAP]
  , WeakSet        = global[WEAKSET]
  , Promise        = global[PROMISE]
  , Math           = global.Math
  , TypeError      = global.TypeError
  , setTimeout     = global.setTimeout
  , clearTimeout   = global.clearTimeout
  , setInterval    = global.setInterval
  , setImmediate   = global.setImmediate
  , clearImmediate = global.clearImmediate
  , process        = global[PROCESS]
  , document       = global.document
  , Infinity       = 1 / 0
  , $Array         = Array[PROTOTYPE]
  , $Object        = Object[PROTOTYPE]
  , $Function      = Function[PROTOTYPE]
  , Export         = {};
  
// 7.2.3 SameValue(x, y)
var same = Object.is || function(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}
// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var nativeRegExp = /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/;
function isNative(it){
  return nativeRegExp.test(it);
}
var toString = $Object.toString
  , TOSTRINGTAG;
function setToStringTag(constructor, tag, stat){
  if(TOSTRINGTAG && constructor)hidden(stat ? constructor : constructor[PROTOTYPE], TOSTRINGTAG, tag);
}
// Object internal [[Class]]
function classof(it){
  if(it == undefined)return it === undefined ? 'Undefined' : 'Null';
  var cof = toString.call(it).slice(8, -1);
  return TOSTRINGTAG && cof == OBJECT && it[TOSTRINGTAG] ? it[TOSTRINGTAG] : cof;
}

// Function:
var apply = $Function.apply
  , call  = $Function.call
  , path  = framework ? global : Export;
Export._ = path._ = path._ || {};
// Partial apply
function part(/*...args*/){
  var length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return partial(this, args, length, holder, _, false);
}
// Simple context binding
function ctx(fn, that){
  assertFunction(fn);
  return function(/*...args*/){
    return fn.apply(that, arguments);
  }
}
// Internal partial application & context binding
function partial(fn, argsPart, lengthPart, holder, _, bind, context){
  assertFunction(fn);
  return function(/*...args*/){
    var that   = bind ? context : this
      , length = arguments.length
      , i = 0, j = 0, args;
    if(!holder && length == 0)return fn.apply(that, argsPart);
    args = argsPart.slice();
    if(holder)for(;lengthPart > i; i++)if(args[i] === _)args[i] = arguments[j++];
    while(length > j)args.push(arguments[j++]);
    return fn.apply(that, args);
  }
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , hasOwnProperty   = $Object.hasOwnProperty
  , isEnumerable     = $Object.propertyIsEnumerable
  , __PROTO__        = '__proto__' in $Object
  , DESCRIPTORS      = true
  // Dummy, fix for not array-like ES3 string in es5.js
  , ES5Object        = Object;
function has(object, key){
  return hasOwnProperty.call(object, key);
}
// 19.1.2.1 Object.assign ( target, source, ... )
var assign = Object.assign || function(target, source){
  var T = Object(target)
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function getValues(object){
  var O      = ES5Object(object)
    , keys   = getKeys(object)
    , length = keys.length
    , i      = 0
    , result = Array(length);
  while(length > i)result[i] = O[keys[i++]];
  return result;
}
// Simple structured cloning
function clone(it, stack1, stack2){
  var cof     = classof(it)
    , isArray = cof == ARRAY
    , index, result, i, l, k;
  if(isArray || cof == OBJECT){
    index = indexOf.call(stack1, it);
    if(~index)return stack2[index];
    stack1.push(it);
    stack2.push(result = isArray ? Array(l = it.length) : create(getPrototypeOf(it)));
    if(isArray){
      for(i = 0; l > i;)if(has(it, i))result[i] = clone(it[i++], stack1, stack2);
    } else for(k in it)if(has(it, k))result[k] = clone(it[k], stack1, stack2);
    return result;
  }
  return it;
}
function $clone(){
  return clone(this, [], []);
}

// Array:
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = $Array.push
  , unshift = $Array.unshift
  , slice   = $Array.slice
  , indexOf = $Array.indexOf
  , forEach = $Array[FOR_EACH];
// Simple reduce to object
function transform(mapfn, target /* = [] */){
  assertFunction(mapfn);
  var memo = target == undefined ? [] : Object(target)
    , self = ES5Object(this)
    , l    = toLength(self.length)
    , i    = 0;
  for(;l > i; i++)if(i in self && mapfn(memo, self[i], i, this) === false)break;
  return memo;
}
function newGeneric(A, B){
  return new (isFunction(A) ? A : B);
}

// Math:
var ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , pow    = Math.pow
  , random = Math.random
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991
// 7.1.4 ToInteger
var toInteger = Number.toInteger || function(it){
  var n = +it;
  return n != n ? 0 : n != 0 && n != Infinity && n != -Infinity ? (n > 0 ? floor : ceil)(n) : n;
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}

// Assertion & errors:
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, _msg){
  if(!condition){
    var msg = _msg
      , i   = 2;
    while(arguments.length > i)msg += ' ' + arguments[i++];
    throw TypeError(msg);
  }
}
function assertFunction(it){
  assert(isFunction(it), it, 'is not a function!');
}
function assertObject(it){
  assert(isObject(it), it, 'is not an object!');
  return it;
}
function assertInstance(it, constructor, name){
  assert(it instanceof constructor, name, ": please use the 'new' operator!");
}

var symbolUniq = 0;
function symbol(key){
  return '@@' + key + '_' + (++symbolUniq + random()).toString(36);
}
function descriptor(bitmap, value){
  return {
    enumerable  : !!(bitmap & 1),
    configurable: !!(bitmap & 2),
    writable    : !!(bitmap & 4),
    value       : value
  }
}
function hidden(object, key, value){
  return defineProperty(object, key, descriptor(6, value));
}

var ITERATOR, forOf, isIterable, getIterator, objectIterators, COLLECTION_KEYS, SHIM_MAP, SHIM_SET; // define in over modules

var GLOBAL = 1
  , STATIC = 2
  , PROTO  = 4;
function $define(type, name, source, forced /* = false */){
  var key, own, prop
    , isGlobal = type & GLOBAL
    , isStatic = type & STATIC
    , isProto  = type & PROTO
    , target   = isGlobal ? global : isStatic ? global[name] : (global[name] || $Object)[PROTOTYPE]
    , exports  = isGlobal ? Export : Export[name] || (Export[name] = {});
  if(isGlobal){
    forced = source;
    source = name;
  }
  for(key in source)if(has(source, key)){
    own  = !forced && target && has(target, key) && (!isFunction(target[key]) || isNative(target[key]));
    prop = own ? target[key] : source[key];
    // export to `C`
    if(exports[key] != prop)exports[key] = isProto && isFunction(prop) ? ctx(call, prop) : prop;
    // if build as framework, extend global objects
    framework && target && !own && (isGlobal || delete target[key])
      && defineProperty(target, key, descriptor(6 + !isProto, source[key]));
  }
}
function $defineTimer(key, fn){
  if(framework)global[key] = fn;
  Export[key] = global[key] != fn ? fn : ctx(fn, global);
}
// Wrap to prevent obstruction of the global constructors, when build as library
function wrapGlobalConstructor(Base){
  if(framework || !isNative(Base))return Base;
  function F(param){
    // used on constructors that takes 1 argument
    return this instanceof Base ? new Base(param) : Base(param);
  }
  F[PROTOTYPE] = Base[PROTOTYPE];
  return F;
}
// Export
var isNode = classof(process) == PROCESS;
if(isNode)module.exports = Export;
if(!isNode || framework)global.C = Export;

/*****************************
 * Module : es5
 *****************************/

/**
 * ECMAScript 5 shim
 * http://es5.github.io/
 * Alternatives:
 * https://github.com/es-shims/es5-shim
 * https://github.com/ddrcode/ddr-ecma5
 * http://augmentjs.com/
 * https://github.com/inexorabletash/polyfill/blob/master/es5.js
 */
!function(){
  var Empty              = Function()
    , _classof           = classof
    , whitespace         = '[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]'
    , trimRegExp         = RegExp('^' + whitespace + '+|' + whitespace + '+$', 'g')
    // for fix IE 8- don't enum bug https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    , hiddenNames1       = array('toString,toLocaleString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,constructor')
    , hiddenNames2       = hiddenNames1.concat(['length'])
    , hiddenNames1Length = hiddenNames1.length
    , $PROTO             = symbol(PROTOTYPE)
    // Create object with null prototype
    , createDict         = __PROTO__
      ? function(){
          return {__proto__: null};
        }
      : function(){
          // Thrash, waste and sodomy
          var iframe = document[CREATE_ELEMENT]('iframe')
            , i      = hiddenNames1Length
            , body   = document.body || document.documentElement
            , iframeDocument;
          iframe.style.display = 'none';
          body.appendChild(iframe);
          iframe.src = 'javascript:';
          iframeDocument = iframe.contentWindow.document || iframe.contentDocument || iframe.document;
          iframeDocument.open();
          iframeDocument.write('<script>document.F=Object</script>');
          iframeDocument.close();
          createDict = iframeDocument.F;
          while(i--)delete createDict[PROTOTYPE][hiddenNames1[i]];
          return createDict();
        }
    , createGetKeys = function(names, length){
        return function(_O){
          var O      = ES5Object(_O)
            , i      = 0
            , result = []
            , key;
          for(key in O)(key !== $PROTO) && has(O, key) && result.push(key);
          // hidden names for Object.getOwnPropertyNames & don't enum bug fix for Object.keys
          while(length > i)has(O, key = names[i++]) && !~indexOf.call(result, key) && result.push(key);
          return result;
        }
      };
  // The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
  try {
    defineProperty({}, 0, $Object);
  } catch(e){
    DESCRIPTORS = false;
    getOwnDescriptor = function(O, P){
      if(has(O, P))return descriptor(6 + isEnumerable.call(O, P), O[P]);
    };
    defineProperty = function(O, P, Attributes){
      if('value' in Attributes)assertObject(O)[P] = Attributes.value;
      return O;
    };
    defineProperties = function(O, Properties){
      assertObject(O);
      var keys   = getKeys(Properties)
        , length = keys.length
        , i = 0
        , P, Attributes;
      while(length > i){
        P          = keys[i++];
        Attributes = Properties[P];
        if('value' in Attributes)O[P] = Attributes.value;
      }
      return O;
    }
  }
  $define(STATIC, OBJECT, {
    // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: getOwnDescriptor,
    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
    defineProperty: defineProperty,
    // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties) 
    defineProperties: defineProperties
  }, !DESCRIPTORS);
  $define(STATIC, OBJECT, {
    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O) 
    getPrototypeOf: getPrototypeOf = getPrototypeOf || function(O){
      if(has(O, $PROTO))return O[$PROTO];
      var proto;
      if('__proto__' in O)proto = O.__proto__;
      else if(CONSTRUCTOR in O)proto = O[CONSTRUCTOR][PROTOTYPE];
      else proto = $Object;
      return O !== proto && 'toString' in O ? proto : null;
    },
    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: getNames = getNames || createGetKeys(hiddenNames2, hiddenNames2.length),
    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
    create: create = create || function(O, /*?*/Properties){
      if(O === null)return Properties ? defineProperties(createDict(), Properties) : createDict();
      Empty[PROTOTYPE] = assertObject(O);
      var result = new Empty();
      Empty[PROTOTYPE] = null;
      if(Properties)defineProperties(result, Properties);
      // add __proto__ for Object.getPrototypeOf shim
      __PROTO__ || result[CONSTRUCTOR][PROTOTYPE] === O || (result[$PROTO] = O);
      return result;
    },
    // 19.1.2.14 / 15.2.3.14 Object.keys(O)
    keys: getKeys = getKeys || createGetKeys(hiddenNames1, hiddenNames1Length)
  });
  
  // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg [, arg1 [, arg2, …]]) 
  $define(PROTO, FUNCTION, {
    bind: function(scope /*, args... */){
      var fn   = this
        , args = slice.call(arguments, 1);
      assertFunction(fn);
      function bound(/* args... */){
        var _args = args.concat(slice.call(arguments))
          , result, that;
        if(this instanceof fn)return isObject(result = apply.call(that = create(fn[PROTOTYPE]), scope, _args)) ? result : that;
        return apply.call(fn, scope, _args);
      }
      bound[PROTOTYPE] = undefined;
      return bound;
    }
  });
  
  // fix for not array-like ES3 string
  function arrayMethodFix(fn){
    return function(){
      return fn.apply(ES5Object(this), arguments);
    }
  }
  if(!(0 in Object('q') && 'q'[0] == 'q')){
    ES5Object = function(it){
      return _classof(it) == STRING ? it.split('') : Object(it);
    }
    slice = arrayMethodFix(slice);
  }
  $define(PROTO, ARRAY, {
    slice: slice,
    join: arrayMethodFix($Array.join)
  }, ES5Object != Object);
  
  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
  $define(STATIC, ARRAY, {isArray: function(arg){
    return _classof(arg) == ARRAY
  }});
  $define(PROTO, ARRAY, {
    // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
    indexOf: indexOf = indexOf || function(searchElement, fromIndex /* = 0 */){
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = fromIndex | 0;
      if(0 > i)i = toLength(length + i);
      for(;length > i; i++)if(i in self && self[i] === searchElement)return i;
      return -1;
    },
    // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
    lastIndexOf: function(searchElement, fromIndex /* = @[*-1] */){
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = length - 1;
      if(arguments.length > 1)i = min(i, fromIndex | 0);
      if(0 > i)i = toLength(length + i);
      for(;i >= 0; i--)if(i in self && self[i] === searchElement)return i;
      return -1;
    },
    // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
    every: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self && !callbackfn.call(thisArg, self[i], i, this))return false;
      }
      return true;
    },
    // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
    some: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self && callbackfn.call(thisArg, self[i], i, this))return true;
      }
      return false;
    },
    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
    forEach: forEach = forEach || function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++)i in self && callbackfn.call(thisArg, self[i], i, this);
    },
    // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
    map: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var result = Array(toLength(this.length));
      forEach.call(this, function(val, key, that){
        result[key] = callbackfn.call(thisArg, val, key, that);
      });
      return result;
    },
    // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
    filter: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var result = [];
      forEach.call(this, function(val){
        callbackfn.apply(thisArg, arguments) && result.push(val);
      });
      return result;
    },
    // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
    reduce: function(callbackfn, memo /* = @.0 */){
      assertFunction(callbackfn);
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = 0;
      if(2 > arguments.length)for(;;){
        if(i in self){
          memo = self[i++];
          break;
        }
        assert(length > ++i, REDUCE_ERROR);
      }
      for(;length > i; i++)if(i in self)memo = callbackfn(memo, self[i], i, this);
      return memo;
    },
    // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
    reduceRight: function(callbackfn, memo /* = @[*-1] */){
      assertFunction(callbackfn);
      var self = ES5Object(this)
        , i    = toLength(self.length) - 1;
      if(2 > arguments.length)for(;;){
        if(i in self){
          memo = self[i--];
          break;
        }
        assert(0 <= --i, REDUCE_ERROR);
      }
      for(;i >= 0; i--)if(i in self)memo = callbackfn(memo, self[i], i, this);
      return memo;
    }
  });
  
  // 21.1.3.25 / 15.5.4.20 String.prototype.trim()
  $define(PROTO, STRING, {trim: function(){
    return String(this).replace(trimRegExp, '');
  }});
  
  // 20.3.3.1 / 15.9.4.4 Date.now()
  $define(STATIC, 'Date', {now: function(){
    return +new Date;
  }});
  
  if(isFunction(trimRegExp))isFunction = function(it){
    return _classof(it) == FUNCTION;
  }
  if(_classof(function(){return arguments}()) == OBJECT)classof =  function(it){
    var cof = _classof(it);
    return cof != OBJECT || !isFunction(it.callee) ? cof : ARGUMENTS;
  }
}();

/*****************************
 * Module : global
 *****************************/

$define(GLOBAL, {global: global});

/*****************************
 * Module : es6_symbol
 *****************************/

/**
 * ECMAScript 6 Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 * Alternatives:
 * http://webreflection.blogspot.com.au/2013/03/simulating-es6-symbols-in-es5.html
 * https://github.com/seanmonstar/symbol
 */
!function(Symbol, SYMBOL, TAG, SymbolRegistry, FFITERATOR, $ITERATOR, $TOSTRINGTAG){
  // 19.4.1 The Symbol Constructor
  if(!isNative(Symbol)){
    Symbol = function(description){
      if(!(this instanceof Symbol))return new Symbol(description);
      var tag = symbol(description);
      defineProperty($Object, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      hidden(this, TAG, tag);
    }
    Symbol[PROTOTYPE].toString = function(){
      return this[TAG];
    }
  }
  $define(GLOBAL, {Symbol: wrapGlobalConstructor(Symbol)}, 1);
  $define(STATIC, SYMBOL, {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      var k = '' + key;
      return has(SymbolRegistry, k) ? SymbolRegistry[k] : SymbolRegistry[k] = Symbol(k);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR = $ITERATOR in Symbol ? Symbol[$ITERATOR] : FFITERATOR in $Array ? FFITERATOR : symbol(SYMBOL + '.' + $ITERATOR),
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: function(sym){
      for(var key in SymbolRegistry)if(SymbolRegistry[key] === sym)return key;
    },
    // 19.4.2.10 Symbol.toStringTag
    toStringTag: TOSTRINGTAG = $TOSTRINGTAG in Symbol ? Symbol[$TOSTRINGTAG] : Symbol(SYMBOL + '.' + $TOSTRINGTAG)
  });
  setToStringTag(Symbol, SYMBOL);
}(global.Symbol, 'Symbol', symbol('tag'), {}, '@@iterator', 'iterator', 'toStringTag');

/*****************************
 * Module : es6
 *****************************/

/**
 * ECMAScript 6 shim
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:proposals
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/inexorabletash/polyfill/blob/master/es6.md
 */
!function(isFinite){
  // 20.2.2.28 Math.sign(x)
  function sign(it){
    var n = +it;
    return n == 0 || n != n ? n : n < 0 ? -1 : 1;
  }
  $define(STATIC, OBJECT, {
    // 19.1.3.1 Object.assign(target, source)
    // The assign function is used to copy the values of all of the enumerable
    // own properties from a source object to a target object.
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: same
  });
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  __PROTO__ && (function(set){
    var buggy;
    try { set({}, $Array) }
    catch(e){ buggy = true }
    $define(STATIC, OBJECT, {
      setPrototypeOf: function(O, proto){
        assertObject(O);
        assert(isObject(proto) || proto === null, "Can't set", proto, 'as prototype');
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      }
    });
  })(ctx(call, getOwnDescriptor($Object, '__proto__').set));
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: function(it){
      return isFinite(it) && floor(it) === it;
    },
    // 20.1.2.4 Number.isNaN(number)
    isNaN: function(number){
      return typeof number == 'number' && number != number;
    },
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
  var isInteger = Number.isInteger
    , abs       = Math.abs
    , exp       = Math.exp
    , log       = Math.log
    , sqrt      = Math.sqrt;
  function asinh(x){
    var n = +x;
    return !isFinite(n) || n === 0 ? n : n < 0 ? -asinh(-n) : log(n + sqrt(n * n + 1));
  }
  $define(STATIC, 'Math', {
    // 20.2.2.3 Math.acosh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
    acosh: function(x){
      return log(x + sqrt(x * x - 1));
    },
    // 20.2.2.5 Math.asinh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
    atanh: function(x){
      return x === 0 ? x : 0.5 * log((1 + x) / (1 - x));
    },
    // 20.2.2.9 Math.cbrt(x)
    // Returns an implementation-dependent approximation to the cube root of x.
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1/3);
    },
    // 20.2.2.11 Math.clz32 (x)
    clz32: function(x){
      var n = x >>> 0;
      return n ? 32 - n.toString(2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    // Returns an implementation-dependent approximation to the hyperbolic cosine of x.
    cosh: function(x){
      return (exp(x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    // Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
    expm1: function(x){
      return same(x, -0) ? -0 : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
    },
    // 20.2.2.16 Math.fround(x)
    // TODO
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    // Returns an implementation-dependent approximation of the square root
    // of the sum of squares of its arguments.
    hypot: function(value1, value2){
      var sum    = 0
        , length = arguments.length
        , value;
      while(length--){
        value = +arguments[length];
        if(value == Infinity || value == -Infinity)return Infinity;
        sum += value * value;
      }
      return sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var xh = (x >>> 0x10) & 0xffff
        , xl = x & 0xffff
        , yh = (y >>> 0x10) & 0xffff
        , yl = y & 0xffff;
      return xl * yl + (((xh * yl + xl * yh) << 0x10) >>> 0) | 0;
    },
    // 20.2.2.20 Math.log1p(x)
    // Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
    // The result is computed in a way that is accurate even when the value of x is close to zero.
    log1p: function(x){
      return (x > -1e-8 && x < 1e-8) ? (x - x * x / 2) : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    // Returns an implementation-dependent approximation to the base 10 logarithm of x.
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    // Returns an implementation-dependent approximation to the base 2 logarithm of x.
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    // Returns the sign of the x, indicating whether x is positive, negative or zero.
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    // Returns an implementation-dependent approximation to the hyperbolic sine of x.
    sinh: function(x){
      var n = +x;
      return n == -Infinity || n == 0 ? n : (exp(n) - exp(-n)) / 2;
    },
    // 20.2.2.33 Math.tanh(x)
    // Returns an implementation-dependent approximation to the hyperbolic tangent of x.
    tanh: function(x){
      return isFinite(x = +x) ? x == 0 ? x : (exp(x) - exp(-x)) / (exp(x) + exp(-x)) : sign(x);
    },
    // 20.2.2.34 Math.trunc(x)
    // Returns the integral part of the number x, removing any fractional digits.
    // If x is already an integer, the result is x.
    trunc: function(x){
      var n = +x;
      return n == 0 ? n : (n > 0 ? floor : ceil)(n);
    }
  });
  // 20.2.1.9 Math [ @@toStringTag ]
  setToStringTag(Math, 'Math', 1);
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  // TODO
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  // TODO
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    // TODO
    // 21.1.3.6 String.prototype.contains(searchString, position = 0)
    contains: function(searchString, position /* = 0 */){
      return !!~String(this).indexOf(searchString, position);
    },
    // 21.1.3.7 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString, endPosition /* = @length */){
      var length = this.length
        , search = '' + searchString;
      endPosition = toLength(min(endPosition === undefined ? length : endPosition, length));
      return String(this).slice(endPosition - search.length, endPosition) === search;
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var n = toInteger(count);
      assert(0 <= n, "Count can't be negative");
      return Array(n + 1).join(this);
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString, position /* = 0 */){
      var search = '' + searchString
        , pos    = toLength(min(position, this.length));
      return String(this).slice(pos, pos + search.length) === search;
    }
  });
  $define(STATIC, ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
      if(mapfn !== undefined)assertFunction(mapfn);
      var O      = ES5Object(arrayLike)
        , result = newGeneric(this, Array)
        , i = 0, length;
      if(forOf && isIterable(O))forOf(O, function(value){
        push.call(result, mapfn ? mapfn.call(thisArg, value, i++) : value);
      });
      else for(length = toLength(O.length); i < length; i++)push.call(result, mapfn ? mapfn.call(thisArg, O[i], i) : O[i]);
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/*...args*/){
      var i = 0, length = arguments.length
        , result = newGeneric(this, Array);
      while(i < length)push.call(result, arguments[i++]);
      return result;
    }
  });
  function findIndex(predicate, thisArg /* = undefind */){
    assertFunction(predicate);
    var O      = Object(this)
      , self   = ES5Object(O)
      , length = toLength(self.length)
      , i = 0;
    for(; i < length; i++){
      if(i in self && predicate.call(thisArg, self[i], i, O))return i;
    }
    return -1;
  }
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    // TODO
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value, start /* = 0 */, end /* = @length */){
      var length = toLength(this.length)
        , s      = toInteger(start)
        , e;
      if(0 > s)s = length + s;
      e = end == undefined ? length : toInteger(end);
      while(e > s)this[s++] = value;
      return this;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: function(predicate, thisArg /* = undefind */){
      var index = findIndex.call(this, predicate, thisArg);
      if(~index)return ES5Object(this)[index];
    },
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: findIndex
  });
  // 24.3.3 JSON [ @@toStringTag ]
  setToStringTag(global.JSON, 'JSON', 1);
}(isFinite);

/*****************************
 * Module : immediate
 *****************************/

/**
 * setImmediate
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * http://nodejs.org/api/timers.html#timers_setimmediate_callback_arg
 * Alternatives:
 * https://github.com/NobleJS/setImmediate
 * https://github.com/calvinmetcalf/immediate
 */
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || !function(postMessage, MessageChannel,
    ONREADYSTATECHANGE, IMMEDIATE_PREFIX, counter, queue, defer, channel){
  setImmediate = function(fn){
    var id   = IMMEDIATE_PREFIX + ++counter
      , args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[id] = function(){
      (isFunction(fn) ? fn : Function(fn)).apply(undefined, args);
    }
    defer(id);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[IMMEDIATE_PREFIX + id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(isNode){
    defer = function(id){
      process.nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel();
    channel.port1.onmessage = listner;
    defer = ctx(channel.port2.postMessage, channel.port2);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      var el = document[CREATE_ELEMENT]('script');
      el[ONREADYSTATECHANGE] = function(){
        el.parentNode.removeChild(el);
        run(id);
      }
      document.documentElement.appendChild(el);
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(part.call(run, id), 0);
    }
  }
}(global.postMessage, global.MessageChannel, 'onreadystatechange', symbol('immediate'), 0, {});
$defineTimer('setImmediate', setImmediate);
$defineTimer('clearImmediate', clearImmediate);

/*****************************
 * Module : es6_promise
 *****************************/

/**
 * ES6 Promises
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
 * https://github.com/domenic/promises-unwrapping
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * http://caniuse.com/promises
 * Based on:
 * https://github.com/jakearchibald/ES6-Promises
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 */
!function(Promise, $Promise){
  isFunction(Promise)
  && isFunction(Promise.resolve) && isFunction(Promise.reject) && isFunction(Promise.all) && isFunction(Promise.race)
  && (function(promise){
    return Promise.resolve(promise) === promise;
  })(new Promise(Function()))
  || !function(SUBSCRIBERS, STATE, DETAIL, SEALED, FULFILLED, REJECTED, PENDING){
    // microtask or, if not possible, macrotask
    var asap =
      isNode ? process.nextTick :
      Promise && isFunction(Promise.resolve) ? function(fn){ $Promise.resolve().then(fn); } :
      setImmediate;
    // 25.4.3 The Promise Constructor
    Promise = function(executor){
      var promise       = this
        , rejectPromise = part.call(handle, promise, REJECTED);
      assertInstance(promise, Promise, PROMISE);
      assertFunction(executor);
      promise[SUBSCRIBERS] = [];
      try {
        executor(part.call(resolve, promise), rejectPromise);
      } catch(e){
        rejectPromise(e);
      }
    }
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    Promise[PROTOTYPE]['catch'] = function(onRejected){
      return this.then(undefined, onRejected);
    },
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    Promise[PROTOTYPE].then = function(onFulfilled, onRejected){
      var promise     = this
        , thenPromise = new Promise(Function())
        , args        = [onFulfilled, onRejected]; 
      if(promise[STATE])asap(function(){
        invokeCallback(promise[STATE], thenPromise, args[promise[STATE] - 1], promise[DETAIL]);
      });
      else promise[SUBSCRIBERS].push(thenPromise, onFulfilled, onRejected);
      return thenPromise;
    }
    // 25.4.4.1 Promise.all(iterable)
    Promise.all = function(iterable){
      var C      = this
        , values = [];
      return new C(function(resolve, reject){
        forOf.call(values, iterable, push);
        var remaining = values.length
          , results   = Array(remaining);
        if(remaining)forEach.call(values, function(promise, index){
          C.resolve(promise).then(function(value){
            results[index] = value;
            --remaining || resolve(results);
          }, reject);
        });
        else resolve(results);
      });
    }
    // 25.4.4.4 Promise.race(iterable)
    Promise.race = function(iterable){
      var C = this;
      return new C(function(resolve, reject){
        forOf(iterable, function(promise){
          C.resolve(promise).then(resolve, reject)
        });
      });
    }
    // 25.4.4.5 Promise.reject(r)
    Promise.reject = function(r){
      return new this(function(resolve, reject){
        reject(r);
      });
    }
    // 25.4.4.6 Promise.resolve(x)
    Promise.resolve = function(x){
      return isObject(x) && getPrototypeOf(x) === this[PROTOTYPE] ? x : new this(function(resolve, reject){
        resolve(x);
      });
    }
    function invokeCallback(settled, promise, callback, detail){
      var hasCallback = isFunction(callback)
        , value, succeeded, failed;
      if(hasCallback){
        try {
          value     = callback(detail);
          succeeded = 1;
        } catch(e){
          failed = 1;
          value  = e;
        }
      } else {
        value = detail;
        succeeded = 1;
      }
      if(handleThenable(promise, value))return;
      else if(hasCallback && succeeded)resolve(promise, value);
      else if(failed)handle(promise, REJECTED, value);
      else if(settled == FULFILLED)resolve(promise, value);
      else if(settled == REJECTED)handle(promise, REJECTED, value);
    }
    function handleThenable(promise, value){
      var resolved;
      try {
        assert(promise !== value, "A promises callback can't return that same promise.");
        if(value && isFunction(value.then)){
          value.then(function(val){
            if(resolved)return true;
            resolved = true;
            if(value !== val)resolve(promise, val);
            else handle(promise, FULFILLED, val);
          }, function(val){
            if(resolved)return true;
            resolved = true;
            handle(promise, REJECTED, val);
          });
          return 1;
        }
      } catch(error){
        if(!resolved)handle(promise, REJECTED, error);
        return 1;
      }
    }
    function resolve(promise, value){
      if(promise === value || !handleThenable(promise, value))handle(promise, FULFILLED, value);
    }
    function handle(promise, state, reason){
      if(promise[STATE] === PENDING){
        promise[STATE]  = SEALED;
        promise[DETAIL] = reason;
        asap(function(){
          promise[STATE] = state;
          for(var subscribers = promise[SUBSCRIBERS], i = 0; i < subscribers.length; i += 3){
            invokeCallback(state, subscribers[i], subscribers[i + state], promise[DETAIL]);
          }
          promise[SUBSCRIBERS] = undefined;
        });
      }
    }
  }(symbol('subscribers'), symbol('state'), symbol('detail'), 0, 1, 2);
  setToStringTag(Promise, PROMISE)
  $define(GLOBAL, {Promise: Promise}, 1);
}(Promise, Promise);

/*****************************
 * Module : es6_collections
 *****************************/

/**
 * ECMAScript 6 collection polyfill
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/Benvie/harmony-collections
 * https://github.com/eriwen/es6-map-shim
 * https://github.com/EliSnow/Blitz-Collections
 * https://github.com/montagejs/collections
 * https://github.com/Polymer/WeakMap/blob/master/weakmap.js
 */
!function(){
  var KEYS     = COLLECTION_KEYS = symbol('keys')
    , VALUES   = symbol('values')
    , STOREID  = symbol('storeId')
    , WEAKDATA = symbol('weakData')
    , WEAKID   = symbol('weakId')
    , SIZE     = DESCRIPTORS ? symbol('size') : 'size'
    , uid = 0
    , wid = 0
    , tmp = {}
    , sizeGetter = {size: {get: function(){
        return this[SIZE];
      }}};
  function initCollection(that, iterable, isSet){
    if(iterable != undefined)forOf && forOf.call(that, iterable, isSet ? that.add : that.set, !isSet);
    return that;
  }
  function createCollectionConstructor(name, isSet){
    function F(iterable){
      assertInstance(this, F, name);
      this.clear();
      initCollection(this, iterable, isSet);
    }
    return F;
  }
  function fixCollection(Base, name, isSet){
    var collection   = new Base([isSet ? tmp : [tmp, 1]])
      , initFromIter = collection.has(tmp)
      , key = isSet ? 'add' : 'set'
      , fn;
    // fix .add & .set for chaining
    if(framework && collection[key](tmp, 1) !== collection){
      fn = collection[key];
      hidden(Base[PROTOTYPE], key, function(){
        fn.apply(this, arguments);
        return this;
      });
    }
    if(initFromIter)return wrapGlobalConstructor(Base);
    // wrap to init collections from iterable
    function F(iterable){
      assertInstance(this, F, name);
      return initCollection(new Base, iterable, isSet);
    }
    F[PROTOTYPE] = Base[PROTOTYPE];
    return F;
  }
  
  function fastKey(it, create){
    // return it with 'S' prefix if it's string or with 'P' prefix for over primitives
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // if it hasn't object id - add next
    if(!has(it, STOREID)){
      if(create)defineProperty(it, STOREID, {value: ++uid});
      else return '';
    }
    // return object id with 'O' prefix
    return 'O' + it[STOREID];
  }

  function collectionMethods($VALUES){
    return {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function(){
        hidden(this, KEYS, create(null));
        if($VALUES == VALUES)hidden(this, VALUES, create(null));
        hidden(this, SIZE, 0);
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var index    = fastKey(key)
          , keys     = this[KEYS]
          , contains = index in keys;
        if(contains){
          delete keys[index];
          if($VALUES == VALUES)delete this[VALUES][index];
          this[SIZE]--;
        }
        return contains;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function(callbackfn, thisArg /* = undefined */){
        assertFunction(callbackfn);
        var values = this[$VALUES]
          , keys   = this[KEYS]
          , names  = getKeys(keys)
          , length = names.length
          , i = 0
          , index;
        while(length > i){
          index = names[i++];
          callbackfn.call(thisArg, values[index], keys[index], this);
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function(key){
        return fastKey(key) in this[KEYS];
      }
    }
  }
  
  // 23.1 Map Objects
  if(!isFunction(Map) || !has(Map[PROTOTYPE], 'forEach')){
    SHIM_MAP = true;
    Map = createCollectionConstructor(MAP);
    assign(Map[PROTOTYPE], collectionMethods(VALUES), {
      // 23.1.3.6 Map.prototype.get(key)
      get: function(key){
        return this[VALUES][fastKey(key)];
      },
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function(key, value){
        var index  = fastKey(key, 1)
          , values = this[VALUES];
        if(!(index in values)){
          this[KEYS][index] = key;
          this[SIZE]++;
        }
        values[index] = value;
        return this;
      }
    });
    // 23.1.3.10 get Map.prototype.size
    defineProperties(Map[PROTOTYPE], sizeGetter);
  } else Map = fixCollection(Map, MAP);
  
  // 23.2 Set Objects
  if(!isFunction(Set) || !has(Set[PROTOTYPE], 'forEach')){
    SHIM_SET = true;
    Set = createCollectionConstructor(SET, 1);
    assign(Set[PROTOTYPE], collectionMethods(KEYS), {
      // 23.2.3.1 Set.prototype.add(value)
      add: function(value){
        var index  = fastKey(value, 1)
          , values = this[KEYS];
        if(!(index in values)){
          values[index] = value;
          this[SIZE]++;
        }
        return this;
      }
    });
    // 23.2.3.9 get Set.prototype.size
    defineProperties(Set[PROTOTYPE], sizeGetter);
  } else Set = fixCollection(Set, SET, 1);
  
  function getWeakData(it){
    return (has(it, WEAKDATA) ? it : defineProperty(it, WEAKDATA, {value: {}}))[WEAKDATA];
  }
  function weakCollectionHas(key){
    return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
  }
  var weakCollectionMethods = {
    // 23.3.3.1 WeakMap.prototype.clear()
    // 23.4.3.2 WeakSet.prototype.clear()
    clear: function(){
      hidden(this, WEAKID, wid++);
    },
    // 23.3.3.3 WeakMap.prototype.delete(key)
    // 23.4.3.4 WeakSet.prototype.delete(value)
    'delete': function(key){
      return weakCollectionHas.call(this, key) && delete key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.5 WeakMap.prototype.has(key)
    // 23.4.3.5 WeakSet.prototype.has(value)
    has: weakCollectionHas
  };
  
  // 23.3 WeakMap Objects
  if(!isFunction(WeakMap) || !has(WeakMap[PROTOTYPE], 'clear')){
    WeakMap = createCollectionConstructor(WEAKMAP);
    assign(WeakMap[PROTOTYPE], assign({
      // 23.3.3.4 WeakMap.prototype.get(key)
      get: function(key){
        return isObject(key) && has(key, WEAKDATA) ? key[WEAKDATA][this[WEAKID]] : undefined;
      },
      // 23.3.3.6 WeakMap.prototype.set(key, value)
      set: function(key, value){
        getWeakData(assertObject(key))[this[WEAKID]] = value;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakMap = fixCollection(WeakMap, WEAKMAP);
  
  // 23.4 WeakSet Objects
  if(!isFunction(WeakSet)){
    WeakSet = createCollectionConstructor(WEAKSET, 1);
    assign(WeakSet[PROTOTYPE], assign({
      // 23.4.3.1 WeakSet.prototype.add(value)
      add: function(value){
        getWeakData(assertObject(value))[this[WEAKID]] = true;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakSet = fixCollection(WeakSet, WEAKSET, 1);
  
  setToStringTag(Map, MAP);
  setToStringTag(Set, SET);
  setToStringTag(WeakMap, WEAKMAP);
  setToStringTag(WeakSet, WEAKSET);
    
  $define(GLOBAL, {
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet
  }, 1);
}();

/*****************************
 * Module : es6_iterators
 *****************************/

!function(KEY, VALUE, ITERATED, KIND, INDEX, KEYS, Iterators, returnThis, mapForEach, setForEach){
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorClass(Constructor, NAME, Base, next, DEFAULT){
    Constructor[PROTOTYPE] = {};
    // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
    // 23.1.5.2.1 %MapIteratorPrototype%.next()
    // 23.2.5.2.1 %SetIteratorPrototype%.next()
    hidden(Constructor[PROTOTYPE], 'next', next);
    // 22.1.5.2.2 %ArrayIteratorPrototype%[@@iterator]()
    // 23.1.5.2.2 %MapIteratorPrototype%[@@iterator]()
    // 23.2.5.2.2 %SetIteratorPrototype%[@@iterator]()
    hidden(Constructor[PROTOTYPE], ITERATOR, returnThis);
    // 22.1.5.2.3 %ArrayIteratorPrototype%[@@toStringTag]
    // 23.1.5.2.3 %MapIteratorPrototype%[@@toStringTag]
    // 23.2.5.2.3 %SetIteratorPrototype%[@@toStringTag]
    setToStringTag(Constructor, NAME + ' Iterator');
    if(NAME != OBJECT){
      $define(PROTO, NAME, {
        // 22.1.3.4 Array.prototype.entries()
        // 23.1.3.4 Map.prototype.entries()
        // 23.2.3.5 Set.prototype.entries()
        entries: createIteratorFactory(Constructor, KEY+VALUE),
        // 22.1.3.13 Array.prototype.keys()
        // 23.1.3.8 Map.prototype.keys()
        // 23.2.3.8 Set.prototype.keys()
        keys:    createIteratorFactory(Constructor, KEY),
        // 22.1.3.29 Array.prototype.values()
        // 23.1.3.11 Map.prototype.values()
        // 23.2.3.10 Set.prototype.values()
        values:  createIteratorFactory(Constructor, VALUE)
      });
      // 22.1.3.30 Array.prototype[@@iterator]()
      // 23.1.3.12 Map.prototype[@@iterator]()
      // 23.2.3.11 Set.prototype[@@iterator]()
      defineIterator(Base[PROTOTYPE], NAME, createIteratorFactory(Constructor, DEFAULT));
    }
  }
  function createIteratorFactory(Constructor, kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  function defineIterator(object, NAME, value){
    Iterators[NAME] = value;
    if(framework && !has(object, ITERATOR))hidden(object, ITERATOR, value);
  }
  
  // 22.1.5.1 CreateArrayIterator Abstract Operation
  function ArrayIterator(iterated, kind){
    hidden(this, ITERATED, ES5Object(iterated));
    hidden(this, KIND,     kind);
    hidden(this, INDEX,    0);
  }
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  createIteratorClass(ArrayIterator, ARRAY, Array, function(){
    var iterated = this[ITERATED]
      , index    = this[INDEX]++
      , kind     = this[KIND];
    if(index >= iterated.length)return createIterResultObject(undefined, 1);
    if(kind == KEY)             return createIterResultObject(index, 0);
    if(kind == VALUE)           return createIterResultObject(iterated[index], 0);
                                return createIterResultObject([index, iterated[index]], 0);
  }, VALUE);
  
  // 21.1.3.27 String.prototype[@@iterator]() - SHAM, TODO
  defineIterator(String[PROTOTYPE], STRING, Iterators[ARRAY]);
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  // Old v8 fix
  Iterators[ARRAY + ' Iterator'] = returnThis;
  
  // 23.1.5.1 CreateMapIterator Abstract Operation
  function MapIterator(iterated, kind){
    var that = this, keys;
    if(SHIM_MAP)keys = getValues(iterated[COLLECTION_KEYS]);
    else mapForEach.call(iterated, function(val, key){
      this.push(key);
    }, keys = []);
    hidden(that, ITERATED, iterated);
    hidden(that, KIND,     kind);
    hidden(that, INDEX,    0);
    hidden(that, KEYS,     keys);
  }
  // 23.1.5.2.1 %MapIteratorPrototype%.next()
  createIteratorClass(MapIterator, MAP, Map, function(){
    var that     = this
      , iterated = that[ITERATED]
      , keys     = that[KEYS]
      , index    = that[INDEX]++
      , kind     = that[KIND]
      , key;
    if(index >= keys.length)return createIterResultObject(undefined, 1);
    key = keys[index];
    if(kind == KEY)         return createIterResultObject(key, 0);
    if(kind == VALUE)       return createIterResultObject(iterated.get(key), 0);
                            return createIterResultObject([key, iterated.get(key)], 0);
  }, KEY+VALUE);
  
  // 23.2.5.1 CreateSetIterator Abstract Operation
  function SetIterator(iterated, kind){
    var keys;
    if(SHIM_SET)keys = getValues(iterated[COLLECTION_KEYS]);
    else setForEach.call(iterated, function(val){
      this.push(val);
    }, keys = []);
    hidden(this, KIND,  kind);
    hidden(this, INDEX, 0);
    hidden(this, KEYS,  keys);
  }
  // 23.2.5.2.1 %SetIteratorPrototype%.next()
  createIteratorClass(SetIterator, SET, Set, function(){
    var keys  = this[KEYS]
      , index = this[INDEX]++
      , key;
    if(index >= keys.length)   return createIterResultObject(undefined, 1);
    key = keys[index];
    if(this[KIND] != KEY+VALUE)return createIterResultObject(key, 0);
                               return createIterResultObject([key, key], 0);
  }, VALUE);
  
  function ObjectIterator(iterated, kind){
    hidden(this, ITERATED, iterated);
    hidden(this, KEYS,     getKeys(iterated));
    hidden(this, INDEX,    0);
    hidden(this, KIND,     kind);
  }
  createIteratorClass(ObjectIterator, OBJECT, Object, function(){
    var that   = this
      , index  = that[INDEX]++
      , object = that[ITERATED]
      , keys   = that[KEYS]
      , kind   = that[KIND]
      , key;
    if(index >= keys.length)return createIterResultObject(undefined, 1);
    key = keys[index];
    if(kind == KEY)         return createIterResultObject(key, 0);
    if(kind == VALUE)       return createIterResultObject(object[key], 0);
                            return createIterResultObject([key, object[key]], 0);
  });
  
  function createObjectIteratorFactory(kind){
    return function(it){
      return new ObjectIterator(it, kind);
    }
  }
  objectIterators = {
    keys:    createObjectIteratorFactory(KEY),
    values:  createObjectIteratorFactory(VALUE),
    entries: createObjectIteratorFactory(KEY+VALUE)
  }
  
  C.isIterable = isIterable = function(it){
    return it != undefined && ITERATOR in it ? true : has(Iterators, classof(it));
  }
  C.getIterator = getIterator = function(it){
    return assertObject((it[ITERATOR] || Iterators[classof(it)]).call(it));
  }
  C.forOf = forOf = function(it, fn, entries){
    var that     = this === Export ? undefined : this
      , iterator = getIterator(it)
      , step, value;
    while(!(step = iterator.next()).done){
      value = step.value;
      if((entries ? fn.call(that, value[0], value[1]) : fn.call(that, value)) === false)return;
    }
  }
}(1, 2, symbol('iterated'), symbol('kind'), symbol('index'), symbol('keys'), {}, Function('return this'), Map[PROTOTYPE][FOR_EACH], Set[PROTOTYPE][FOR_EACH]);

/*****************************
 * Module : dict
 *****************************/

!function(){
  function Dict(iterable){
    var dict = create(null);
    if(iterable != undefined){
      if(isIterable(iterable))forOf(iterable, function(key, value){
        dict[key] = value;
      }, 1);
      else assign(dict, iterable);
    }
    return dict;
  }
  Dict[PROTOTYPE] = null;
  function findKey(object, fn, that /* = undefined */){
    assertFunction(fn);
    var O      = ES5Object(object)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , key;
    while(length > i){
      if(fn.call(that, O[key = keys[i++]], key, object))return key;
    }
  }
  assign(Dict, objectIterators, {
    /**
     * Object enumumerabe
     * Alternatives:
     * http://underscorejs.org/ _.{...enumerable}
     * http://sugarjs.com/api/Object/enumerable Object.{...enumerable}
     * http://mootools.net/docs/core/Types/Object Object.{...enumerable}
     * http://api.jquery.com/category/utilities/ $.{...enumerable}
     * http://docs.angularjs.org/api/ng/function angular.{...enumerable}
     */
    every: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i){
        if(!fn.call(that, O[key = keys[i++]], key, object))return false;
      }
      return true;
    },
    filter: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , result = newGeneric(this, Dict)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = keys[i++]], key, object))result[key] = O[key];
      }
      return result;
    },
    find: function(object, fn, that /* = undefined */){
      var index = findKey(object, fn, that);
      return index === undefined ? undefined : ES5Object(object)[index];
    },
    findKey: findKey,
    forEach: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)fn.call(that, O[key = keys[i++]], key, object);
    },
    keyOf: function(object, searchElement){
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)if(O[key = keys[i++]] === searchElement)return key;
    },
    map: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , result = newGeneric(this, Dict)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i){
        result[key = keys[i++]] = fn.call(that, O[key], key, object);
      }
      return result;
    },
    reduce: function(object, fn, init /* = undefined */, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , i      = 0
        , length = keys.length
        , memo   = init
        , key;
      if(arguments.length < 3){
        assert(length > i, REDUCE_ERROR);
        memo = O[keys[i++]];
      }
      while(length > i){
        memo = fn.call(that, memo, O[key = keys[i++]], key, object);
      }
      return memo;
    },
    some: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = keys[i++]], key, object))return true;
      }
      return false;
    },
    transform: function(object, mapfn, target /* = new @ */){
      assertFunction(mapfn);
      var memo = target == undefined ? newGeneric(this, Dict) : Object(target)
        , O    = ES5Object(object)
        , keys = getKeys(O)
        , l    = keys.length
        , i    = 0
        , key;
      while(l > i)if(mapfn(memo, O[key = keys[i++]], key, object) === false)break;
      return memo;
    },
    contains: function(object, searchElement){
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)if(same(O[key = keys[i++]], searchElement))return true;
      return false;
    },
    clone: ctx(call, $clone),
    // Has / get / set own property
    has: has,
    get: function(object, key){
      if(has(object, key))return object[key];
    },
    set: function(object, key, value){
      return defineProperty(object, key, descriptor(7, value));
    },
    isDict: function(it){
      return getPrototypeOf(it) == Dict[PROTOTYPE];
    }
  });
  $define(GLOBAL, {Dict: Dict});
}();

/*****************************
 * Module : timers
 *****************************/

/**
 * ie9- setTimeout & setInterval additional parameters fix
 * http://www.w3.org/TR/html5/webappapis.html#timers
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#timers
 * Alternatives:
 * https://developer.mozilla.org/ru/docs/Web/API/Window.setTimeout#IE_Only_Fix
 */
!function(navigator){
  function wrap(set){
    return function(fn, time /*, ...args*/){
      return set(part.apply(isFunction(fn) ? fn : Function(fn), slice.call(arguments, 2)), time || 1);
    }
  }
  // ie9- dirty check
  if(navigator && /MSIE .\./.test(navigator.userAgent)){
    setTimeout  = wrap(setTimeout);
    setInterval = wrap(setInterval);
  }
  $defineTimer('setTimeout', setTimeout);
  $defineTimer('setInterval', setInterval);
}(global.navigator);

/*****************************
 * Module : function
 *****************************/

$define(STATIC, FUNCTION, {
  isFunction: isFunction,
  isNative: isNative
});
$define(PROTO, FUNCTION, {
  // 7.3.18 Construct (F, argumentsList)
  construct: function(args){
    assertFunction(this);
    var list     = Array.isArray(args) ? args : Array.from(args)
      , instance = create(this[PROTOTYPE])
      , result   = this.apply(instance, list);
    return isObject(result) ? result : instance;
  }
});

/*****************************
 * Module : deferred
 *****************************/

/**
 * Alternatives:
 * http://sugarjs.com/api/Function/delay
 * http://sugarjs.com/api/Function/every
 * http://api.prototypejs.org/language/Function/prototype/delay/
 * http://api.prototypejs.org/language/Function/prototype/defer/
 * http://mootools.net/docs/core/Types/Function#Function:delay
 * http://mootools.net/docs/core/Types/Function#Function:periodical
 */
!function(ARGUMENTS, ID){
  function createDeferredFactory(set, clear){
    function Deferred(args){
      this[ID] = set.apply(global, this[ARGUMENTS] = args)
    }
    Deferred[PROTOTYPE].set = function(){
      clear(this[ID]);
      this[ID] = set.apply(global, this[ARGUMENTS]);
      return this;
    }
    Deferred[PROTOTYPE].clear = function(){
      clear(this[ID]);
      return this;
    }
    return function(/* ...args */){
      assertFunction(this);
      var args = [this], i = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return new Deferred(args);
    }
  }
  $define(PROTO, FUNCTION, {
    timeout:   createDeferredFactory(setTimeout, clearTimeout),
    interval:  createDeferredFactory(setInterval, clearInterval),
    immediate: createDeferredFactory(setImmediate, clearImmediate)
  });
}(symbol('arguments'), symbol('id'));

/*****************************
 * Module : binding
 *****************************/

!function(){
  $define(PROTO, FUNCTION, {
    /**
     * Partial apply.
     * Alternatives:
     * http://sugarjs.com/api/Function/fill
     * http://underscorejs.org/#partial
     * http://mootools.net/docs/core/Types/Function#Function:pass
     * http://fitzgen.github.io/wu.js/#wu-partial
     */
    part: part,
    by: function(that){
      var fn     = this
        , _      = path._
        , holder = false
        , length = arguments.length
        , woctx  = that === _
        , i      = woctx ? 0 : 1
        , indent = i
        , args;
      if(length < 2)return woctx ? ctx(call, fn) : ctx(fn, that);
      args = Array(length - indent);
      while(length > i)if((args[i - indent] = arguments[i++]) === _)holder = true;
      return partial(woctx ? call : fn, args, length, holder, _, true, woctx ? fn : that);
    },
    /**
     * fn(a, b, c, ...) -> a.fn(b, c, ...)
     * Alternatives:
     * http://api.prototypejs.org/language/Function/prototype/methodize/
     */
    methodize: function(){
      var fn = this;
      return function(/*...args*/){
        var args = [this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return apply.call(fn, undefined, args);
      }
    }
  });
  
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  function tie(key){
    var that   = this
      , _      = path._
      , holder = false
      , length = arguments.length
      , i = 1, args;
    if(length < 2)return ctx(that[key], that);
    args = Array(length - 1)
    while(length > i)if((args[i - 1] = arguments[i++]) === _)holder = true;
    return partial(that[key], args, length, holder, _, true, that);
  }

  $define(STATIC, OBJECT, {tie: Export.tie = ctx(call, tie)});
  
  var _ = symbol('tie');
  hidden(path._, 'toString', function(){
    return _;
  });
  DESCRIPTORS && hidden($Object, _, tie);
  hidden($Function, _, tie);
  hidden($Array, _, tie);
  hidden(RegExp[PROTOTYPE], _, tie);
}();

/*****************************
 * Module : object
 *****************************/

// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getOwnPropertyDescriptors(object){
  var result = create(null)
    , names  = getNames(object)
    , length = names.length
    , i      = 0
    , key;
  while(length > i)result[key = names[i++]] = getOwnDescriptor(object, key);
  return result;
}
$define(STATIC, OBJECT, {
  /**
   * Alternatives:
   * http://underscorejs.org/#has
   * http://sugarjs.com/api/Object/has
   */
  isEnumerable: ctx(call, isEnumerable),
  isPrototype: ctx(call, $Object.isPrototypeOf),
  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  getPropertyDescriptor: function(object, key){
    if(key in object)do {
      if(has(object, key))return getOwnDescriptor(object, key);
    } while(object = getPrototypeOf(object));
  },
  // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
  // ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  /**
   * Shugar for Object.create
   * Alternatives:
   * http://lodash.com/docs#create
   */
  make: function(proto, props){
    return props == undefined ? create(proto) : create(proto, getOwnPropertyDescriptors(props));
  },
  /**
   * 19.1.3.15 Object.mixin ( target, source )
   * Removed in Draft Rev 22, January 20, 2014
   * http://esdiscuss.org/topic/november-19-2013-meeting-notes#content-1
   */
  define: function(target, source){
    return defineProperties(target, getOwnPropertyDescriptors(source));
  },
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  values: getValues,
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  entries: function(object){
    var O      = ES5Object(object)
      , keys   = getKeys(object)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    while(length > i)result[i] = [key = keys[i++], O[key]];
    return result;
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#isObject
   * http://sugarjs.com/api/Object/isType
   * http://docs.angularjs.org/api/angular.isObject
   */
  isObject: isObject,
  /**
   * Alternatives:
   * http://livescript.net/#operators -> typeof!
   * http://mootools.net/docs/core/Core/Core#Core:typeOf
   * http://api.jquery.com/jQuery.type/
   */
  classof: classof,
  // Simple symbol API
  symbol: symbol,
  hidden: hidden
});

/*****************************
 * Module : array
 *****************************/

$define(PROTO, ARRAY, {
  /**
   * Alternatives:
   * http://sugarjs.com/api/Array/at
   * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
   */
  get: function(index){
    var i = toInteger(index);
    return ES5Object(this)[0 > i ? this.length + i : i];
  },
  set: function(index, value){
    var i = toInteger(index);
    this[0 > i ? this.length + i : i] = value;
    return this;
  },
  /**
   * Alternatives:
   * http://lodash.com/docs#template
   */
  transform: transform,
  clone: $clone,
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  contains: function(value){
    var O      = ES5Object(this)
      , length = O.length
      , i      = 0;
    while(length > i)if(i in O && same(value, O[i++]))return true;
    return false;
  }
});

/*****************************
 * Module : array_statics
 *****************************/

/**
 * Array static methods
 * http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
 * JavaScript 1.6
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6#Array_and_String_generics
 * Alternatives:
 * https://github.com/plusdude/array-generics
 * http://mootools.net/docs/core/Core/Core#Type:generics
 */
$define(STATIC, ARRAY, transform.call(
  // IE... getNames($Array),
  array(
    // ES3:
    'concat,join,pop,push,reverse,shift,slice,sort,splice,unshift,' +
    // ES5:
    'indexOf,lastIndexOf,every,some,forEach,map,filter,reduce,reduceRight,' +
    // ES6:
    'fill,find,findIndex,keys,values,entries,' +
    // Core.js:
    'get,set,transform,clone,contains'
  ),
  function(memo, key){
    if(key in $Array)memo[key] = ctx(call, $Array[key]);
  }, {}
));

/*****************************
 * Module : number
 *****************************/

$define(STATIC, NUMBER, {
  /**
   * Alternatives:
   * http://mootools.net/docs/core/Types/Number#Number:toInt
   */
  toInteger: toInteger
});
$define(PROTO, NUMBER, {
  /**
   * Invoke function @ times and return array of results
   * Alternatives:
   * http://underscorejs.org/#times
   * http://sugarjs.com/api/Number/times
   * http://api.prototypejs.org/language/Number/prototype/times/
   * http://mootools.net/docs/core/Types/Number#Number:times
   */
  times: function(fn /* = -> it */, that /* = undefined */){
    var number = toLength(this)
      , result = Array(number)
      , i      = 0;
    if(isFunction(fn))while(number > i)result[i] = fn.call(that, i, i++, this);
    else while(number > i)result[i] = i++;
    return result;
  },
  random: function(number /* = 0 */){
    var a = +this   || 0
      , b = +number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  }
});
$define(STATIC, 'Math', {
  /**
   * Alternatives:
   * http://underscorejs.org/#random
   * http://mootools.net/docs/core/Types/Number#Number:Number-random
   */
  randomInt: function(_a /* = 0 */, _b /* = 0 */){
    var a = toInteger(_a)
      , b = toInteger(_b)
      , m = min(a, b);
    return floor((random() * (max(a, b) + 1 - m)) + m);
  }
});
/**
 * Math functions in Number.prototype
 * Alternatives:
 * http://sugarjs.com/api/Number/math
 * http://mootools.net/docs/core/Types/Number#Number-Math
 */
$define(PROTO, NUMBER, transform.call(
  // IE... getNames(Math)
  array(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc,' +
    // Core.js
    'randomInt'
  ),
  function(memo, key){
    if(key in Math)memo[key] = (function(fn){
      return function(/*...args*/){
        // ie8- convert `this` to object -> convert it to number
        var args = [+this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return fn.apply(undefined, args);
      }
    })(Math[key])
  }, {}
));

/*****************************
 * Module : string
 *****************************/

!function(){
  var escapeHTMLDict = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;'
      }
    , unescapeHTMLDict = transform.call(getKeys(escapeHTMLDict), function(memo, key){
        memo[escapeHTMLDict[key]] = key;
      }, {})
    , RegExpEscapeHTML   = /[&<>"']/g
    , RegExpUnescapeHTML = /&(?:amp|lt|gt|quot|apos);/g;
  $define(PROTO, STRING, {
    /**
     * Alternatives:
     * http://underscorejs.org/#escape
     * http://sugarjs.com/api/String/escapeHTML
     * http://api.prototypejs.org/language/String/prototype/escapeHTML/
     */
    escapeHTML: function(){
      return String(this).replace(RegExpEscapeHTML, function(part){
        return escapeHTMLDict[part];
      });
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#unescape
     * http://sugarjs.com/api/String/unescapeHTML
     * http://api.prototypejs.org/language/String/prototype/unescapeHTML/
     */
    unescapeHTML: function(){
      return String(this).replace(RegExpUnescapeHTML, function(part){
        return unescapeHTMLDict[part];
      });
    }
  });
}();

/*****************************
 * Module : regexp
 *****************************/

!function(escape){
  /**
   * https://gist.github.com/kangax/9698100
   * Alternatives:
   * http://sugarjs.com/api/String/escapeRegExp
   * http://api.prototypejs.org/language/RegExp/escape/
   * http://mootools.net/docs/core/Types/String#String:escapeRegExp
   */
  $define(STATIC, REGEXP, {
    escape: function(it){
      return String(it).replace(escape, '\\$1');
    }
  });
}(/([\\\-[\]{}()*+?.,^$|])/g);

/*****************************
 * Module : date
 *****************************/

/**
 * Alternatives:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 * https://github.com/andyearnshaw/Intl.js
 * http://momentjs.com/
 * http://sugarjs.com/api/Date/format
 * http://mootools.net/docs/more/Types/Date#Date:format
 */
!function(formatRegExp, flexioRegExp, locales, current, SECONDS, MINUTES, HOURS, DATE, MONTH, YEAR){
  function createFormat(UTC){
    return function(template, locale /* = current */){
      var that = this
        , dict = locales[has(locales, locale) ? locale : current];
      function get(unit){
        return that[(UTC ? 'getUTC' : 'get') + unit]();
      }
      return String(template).replace(formatRegExp, function(part){
        switch(part){
          case 'ms'   : var ms = get('Milliseconds');                           // Milliseconds : 000-999
            return ms > 99 ? ms : '0' + lz(ms);
          case 's'    : return get(SECONDS);                                    // Seconds      : 0-59
          case 'ss'   : return lz(get(SECONDS));                                // Seconds      : 00-59
          case 'm'    : return get(MINUTES);                                    // Minutes      : 0-59
          case 'mm'   : return lz(get(MINUTES));                                // Minutes      : 00-59
          case 'h'    : return get(HOURS);                                      // Hours        : 0-23
          case 'hh'   : return lz(get(HOURS));                                  // Hours        : 00-23
          case 'D'    : return get(DATE)                                        // Date         : 1-31
          case 'DD'   : return lz(get(DATE));                                   // Date         : 01-31
          case 'W'    : return dict.W[get('Day')];                              // Day          : Понедельник
          case 'N'    : return get(MONTH) + 1;                                  // Month        : 1-12
          case 'NN'   : return lz(get(MONTH) + 1);                              // Month        : 01-12
          case 'M'    : return dict.M[get(MONTH)];                              // Month        : Январь
          case 'MM'   : return dict.MM[get(MONTH)];                             // Month        : Января
          case 'YY'   : return lz(get(YEAR) % 100);                             // Year         : 14
          case 'YYYY' : return get(YEAR);                                       // Year         : 2014
        } return part;
      });
    }
  }
  function lz(num){
    return num > 9 ? num : '0' + num;
  }
  function addLocale(lang, locale){
    function split(index){
      return transform.call(array(locale.months), function(memo, it){
        memo.push(it.replace(flexioRegExp, '$' + index));
      });
    }
    locales[lang] = {
      W : array(locale.weekdays),
      MM: split(1),
      M : split(2)
    };
    return Date;
  }
  $define(STATIC, DATE, {
    locale: function(locale){
      return has(locales, locale) ? current = locale : current;
    },
    addLocale: addLocale
  });
  $define(PROTO, DATE, {
    format:    createFormat(0),
    formatUTC: createFormat(1)
  });
  addLocale(current, {
    weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    months:   'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    months:   'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
  });
}(/\b\w{1,4}\b/g, /:(.*)\|(.*)$/, {}, 'en', 'Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear');

/*****************************
 * Module : console
 *****************************/

/**
 * https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
 * https://developer.mozilla.org/en-US/docs/Web/API/console
 * Alternatives:
 * https://github.com/paulmillr/console-polyfill
 * https://github.com/theshock/console-cap
 */
!function(console){
  var $console = transform.call(
    array('assert,count,clear,debug,dir,dirxml,error,exception,' +
      'group,groupCollapsed,groupEnd,info,log,table,trace,warn,' +
      'markTimeline,profile,profileEnd,time,timeEnd,timeStamp'),
    function(memo, key){
      memo[key] = function(){
        if(enabled && console[key])return apply.call(console[key], console, arguments);
      };
    },
    {
      enable: function(){
        enabled = true;
      },
      disable: function(){
        enabled = false;
      }
    }
  ), enabled = true;
  try {
    framework && delete global.console;
  } catch(e){}
  $define(GLOBAL, {console: assign($console.log, $console)}, 1);
}(global.console || {});
}(typeof window != 'undefined' ? window : global, true);