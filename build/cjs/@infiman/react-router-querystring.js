'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _bindInstanceProperty = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/instance/bind'));
var React = _interopDefault(require('react'));
var _Object$create = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/object/create'));
var _Object$assign = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/object/assign'));
var _JSON$stringify = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/json/stringify'));
var _includesInstanceProperty = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/instance/includes'));
var _filterInstanceProperty = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/instance/filter'));
var _flatMapInstanceProperty = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/instance/flat-map'));
var _forEachInstanceProperty = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/instance/for-each'));
var _Object$keys = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/object/keys'));
var _reduceInstanceProperty = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/instance/reduce'));
var _Symbol = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/symbol'));
var _Array$isArray = _interopDefault(require('@babel/runtime-corejs3/core-js-stable/array/is-array'));
var memoize = _interopDefault(require('fast-memoize'));

const parsePathname = pathname => {
  {
    if (typeof pathname !== 'string') {
      throw new Error(`pathname param is not valid. Expected: string! Received: ${Object.prototype.toString.call(pathname)}.`);
    }
  }

  const [dirty, ...splitPathname] = pathname.split('/');

  {
    if (dirty || !splitPathname.length) {
      throw new Error(`pathname param is not valid. Expected: '/'! Received: ${pathname}.`);
    }
  }

  if (!splitPathname[0]) {
    splitPathname[0] = '/';
  }

  return splitPathname;
};

const isPlainObject = maybeObject => maybeObject && typeof maybeObject === 'object' && (typeof maybeObject.constructor !== 'function' || maybeObject.constructor.name === 'Object');

const merge = (target, patch, merger) => {
  {
    if (!isPlainObject(target)) {
      throw new Error(`target param is not valid. Expecting: object! Received: ${Object.prototype.toString.call(target)}.`);
    }
  }

  const patches = _Array$isArray(patch) ? patch : [patch];
  let merged = target;

  _forEachInstanceProperty(patches).call(patches, currentPatch => {
    if (!isPlainObject(currentPatch)) {
      return;
    }

    const keysToPatch = _Object$keys(currentPatch);

    _forEachInstanceProperty(keysToPatch).call(keysToPatch, keyToPatch => {
      const hasValue = Object.hasOwnProperty.call(target, keyToPatch);
      const oldValue = target[keyToPatch];
      const newValue = currentPatch[keyToPatch];
      const mergedValue = merger ? merger(oldValue, newValue, keyToPatch) : newValue;

      if (!hasValue || mergedValue !== oldValue) {
        if (merged === target) {
          merged = _Object$assign({}, target);
        }

        merged[keyToPatch] = mergedValue;
      }
    });
  });

  return merged;
};
const mergeDeep = (target, patch, merger) => {
  return merge(target, patch, (oldValue, newValue, key) => {
    if (isPlainObject(oldValue) && isPlainObject(newValue)) {
      return mergeDeep(oldValue, newValue, merger);
    }

    return merger ? merger(oldValue, newValue, key) : newValue;
  });
};

const addStrategyMerger = (oldValue, newValue) => {
  if (_Array$isArray(oldValue) && _Array$isArray(newValue)) {
    return [...oldValue, ...newValue];
  }

  return newValue;
};

const removeStrategyMerger = (oldValue, newValue) => {
  if (_Array$isArray(oldValue) && _Array$isArray(newValue)) {
    return _filterInstanceProperty(oldValue).call(oldValue, (item, i) => !_includesInstanceProperty(newValue).call(newValue, item));
  }

  return newValue;
};

const mutateQueryParams = strategy => memoize((queryParams, params) => mergeDeep(queryParams, params, strategy));
const addQueryParams = mutateQueryParams(addStrategyMerger);
const removeQueryParams = mutateQueryParams(removeStrategyMerger);

const getPlainObject = () => ({});

const update = (target, path, updater) => {
  {
    if (!isPlainObject(target)) {
      throw new Error(`target param is not valid. Expecting: object! Received: ${Object.prototype.toString.call(target)}.`);
    }

    if (typeof path !== 'string') {
      throw new Error(`path param is not valid. Expecting: string! Received: ${Object.prototype.toString.call(path)}.`);
    }

    if (typeof updater !== 'function') {
      throw new Error(`updater param is not valid. Expecting: function! Received: ${Object.prototype.toString.call(updater)}.`);
    }
  }

  const hasValue = Object.prototype.hasOwnProperty.call(target, path);
  const oldValue = target[path];
  const updatedValue = updater(oldValue, path, {
    tail: true
  });

  if (!hasValue || oldValue !== updatedValue) {
    return _Object$assign({}, target, {
      [path]: updatedValue
    });
  }

  return target;
};
const updateDeep = (target, path, updater, missingNodeResolver) => {
  {
    if (!isPlainObject(target)) {
      throw new Error(`target param is not valid. Expecting: object! Received: ${Object.prototype.toString.call(target)}.`);
    }

    if (!_Array$isArray(path)) {
      throw new Error(`path param is not valid. Expecting: array! Received: ${Object.prototype.toString.call(path)}.`);
    }

    if (typeof updater !== 'function') {
      throw new Error(`updater param is not valid. Expecting: function! Received: ${Object.prototype.toString.call(updater)}.`);
    }
  }

  let resolveMissingNode = missingNodeResolver || getPlainObject;

  let updated = _Object$assign({}, target);

  let currentNode = updated;
  let previousNode;

  for (let i = 0, length = path.length; i < length; i++) {
    if (i === length - 1) {
      if (previousNode) {
        const updatedNode = update(currentNode, path[i], updater);

        if (currentNode === updatedNode) {
          return target;
        }

        previousNode[path[i - 1]] = updatedNode;
      } else {
        return update(target, path[i], updater);
      }
    } else {
      const oldOrMissingNode = currentNode[path[i]] ? currentNode[path[i]] : resolveMissingNode(path[i]);
      const updatedNode = updater(oldOrMissingNode, path[i], {
        tail: false
      });
      currentNode[path[i]] = _Object$assign({}, updatedNode);
      previousNode = currentNode;
      currentNode = currentNode[path[i]];
    }
  }

  return updated;
};

const WILDCARD_SCOPE = '*';
const QUERYSTRING_CACHE_STATE_KEY = '@@__QUERYSTRING_CACHE_STATE_OBJECT__@@';
const NESTED_KEY = 'nested';
const PERSISTED_KEY = 'persisted';
const SHADOW_KEY = _Symbol('shadow');

const createKey = () => Math.random().toString(36).substr(2, 7);

const createPartialCache = partialCache => ({
  [NESTED_KEY]: {},
  [PERSISTED_KEY]: {},
  [SHADOW_KEY]: {},
  ...partialCache
});

const createStateObject = ({
  mutations,
  ...rest
} = {}) => ({
  [QUERYSTRING_CACHE_STATE_KEY]: { ...rest,
    key: createKey(),
    mutations: mutations || []
  }
});

const pickBranchFromCache = (cache, [path, ...restPath] = [], destination = []) => {
  if (path) {
    const partialWildcardCache = cache[WILDCARD_SCOPE];
    const partialCache = cache[path];

    if (partialWildcardCache && partialWildcardCache.mutated) {
      destination.push(partialWildcardCache);
    }

    if (partialCache && partialCache.mutated) {
      destination.push(partialCache);
    }

    return partialCache ? pickBranchFromCache(partialCache[NESTED_KEY], restPath, destination) : destination;
  } else {
    return destination;
  }
};

const flushNestedPartialCaches = (partialCache, rootPaths = []) => {
  return _reduceInstanceProperty(rootPaths).call(rootPaths, (destination, key) => {
    return { ...destination,
      [key]: { ...partialCache[key],
        [SHADOW_KEY]: {},
        [NESTED_KEY]: flushNestedPartialCaches(partialCache[key][NESTED_KEY], _Object$keys(partialCache[key][NESTED_KEY]))
      }
    };
  }, { ...partialCache
  });
};

const queryStore = {
  get cache() {
    return this.history[this.currentHistoryKey];
  },

  set cache(value) {
    this.history[this.currentHistoryKey] = value;
  },

  add({
    pathname = '',
    state
  }) {
    // eslint-disable-next-line standard/computed-property-even-spacing
    const {
      key,
      mutations,
      foreign,
      respect,
      match
    } = state[QUERYSTRING_CACHE_STATE_KEY];

    if (Object.prototype.hasOwnProperty.call(this.history, key)) {
      this.currentHistoryKey = key;
      return this;
    }

    let newCache = this.cache;

    _forEachInstanceProperty(mutations).call(mutations, ({
      scope,
      persist,
      add,
      remove
    }) => {
      var _context;

      newCache = updateDeep(newCache, _flatMapInstanceProperty(_context = parsePathname(scope || pathname)).call(_context, (path, i, {
        length
      }) => i < length - 1 ? [path, NESTED_KEY] : path), (oldValue, path, {
        tail
      }) => {
        if (!tail) {
          if (foreign && !respect && path !== NESTED_KEY) {
            return createPartialCache({
              path,
              [NESTED_KEY]: oldValue[NESTED_KEY]
            });
          }

          return oldValue;
        } else {
          const partialCache = oldValue || createPartialCache({
            path,
            mutated: true
          });

          if (foreign) {
            return { ...partialCache,
              [PERSISTED_KEY]: respect ? partialCache[PERSISTED_KEY] : {},
              [SHADOW_KEY]: respect ? add : {},
              [NESTED_KEY]: flushNestedPartialCaches(partialCache[NESTED_KEY], _Object$keys(partialCache[NESTED_KEY]))
            };
          } else {
            const strategy = persist ? PERSISTED_KEY : SHADOW_KEY;
            let newStrategyValue = partialCache[strategy];

            if (remove) {
              newStrategyValue = this.removeQueryParams(newStrategyValue, remove);
            }

            if (add) {
              newStrategyValue = this.addQueryParams(newStrategyValue, add);
            }

            return { ...partialCache,
              [strategy]: newStrategyValue,
              [NESTED_KEY]: match ? partialCache[NESTED_KEY] : flushNestedPartialCaches(partialCache[NESTED_KEY], _Object$keys(partialCache[NESTED_KEY]))
            };
          }
        }
      }, path => path === NESTED_KEY ? {} : createPartialCache({
        path
      }));
    });

    if (!match) {
      var _context2;

      newCache = flushNestedPartialCaches(newCache, _filterInstanceProperty(_context2 = _Object$keys(newCache)).call(_context2, key => {
        var _context3;

        return !_includesInstanceProperty(_context3 = [WILDCARD_SCOPE, parsePathname(pathname)[0]]).call(_context3, key);
      }));
    }

    this.currentHistoryKey = key;
    this.cache = newCache;
    return this;
  },

  resolveQueryString(scope = '', mutations = []) {
    const branch = pickBranchFromCache(this.cache, parsePathname(scope));

    let queryParams = _reduceInstanceProperty(branch).call(branch, (destination, partialCache) => this.addQueryParams(destination, { ...partialCache[SHADOW_KEY],
      ...partialCache[PERSISTED_KEY]
    }), {});

    _forEachInstanceProperty(mutations).call(mutations, ({
      add,
      remove
    }) => {
      if (remove) {
        queryParams = this.removeQueryParams(queryParams, remove);
      }

      if (add) {
        queryParams = this.addQueryParams(queryParams, add);
      }
    });

    return this.stringifyQueryParams(queryParams);
  },

  clear() {
    this.history = {};
    this.currentHistoryKey = createKey();
    this.cache = {};
    return this;
  },

  toString() {
    return _JSON$stringify(this.cache);
  }

};
let store;
const createQueryStore = ({
  initialCache,
  parseQueryString,
  stringifyQueryParams,
  addQueryParams: addQueryParams$1,
  removeQueryParams: removeQueryParams$1
} = {}) => {
  {
    if (typeof parseQueryString !== 'function') {
      throw new Error(`parseQueryString param is not valid. Expecting: function! Received: ${Object.prototype.toString.call(parseQueryString)}.`);
    }

    if (typeof stringifyQueryParams !== 'function') {
      throw new Error(`stringifyQueryParams param is not valid. Expecting: function! Received: ${Object.prototype.toString.call(stringifyQueryParams)}.`);
    }
  }

  if (!store) {
    const currentHistoryKey = createKey();
    store = _Object$assign(_Object$create(_Object$assign(queryStore, {
      createStateObject,
      parseQueryString,
      stringifyQueryParams,
      addQueryParams: addQueryParams$1 || addQueryParams,
      removeQueryParams: removeQueryParams$1 || removeQueryParams
    })), {
      currentHistoryKey,
      history: {
        [currentHistoryKey]: initialCache || {}
      }
    });
  }

  return store;
};

const QueryContext = React.createContext({});

const resolvePath = (queryStore, {
  pathname,
  mutations,
  hash,
  state = {}
}, {
  stringify
}) => {
  const search = queryStore.resolveQueryString(pathname, mutations);
  const justState = { ...state,
    ...queryStore.createStateObject({
      mutations,
      ...state[QUERYSTRING_CACHE_STATE_KEY]
    })
  };
  return stringify ? {
    path: `${pathname}${search}${hash}`,
    state: justState
  } : {
    pathname,
    search,
    hash,
    state: justState
  };
};

const Query = ({
  options,
  history,
  children,
  replace,
  respect
}) => {
  {
    if (!isPlainObject(options)) {
      throw new Error(`options prop is not valid. Expecting: object! Received: ${Object.prototype.toString.call(options)}.`);
    }

    if (!isPlainObject(history)) {
      throw new Error(`history prop is not valid. Expecting: object! Received: ${Object.prototype.toString.call(history)}.`);
    }

    if (typeof history.listen !== 'function' || typeof history.replace !== 'function' || !isPlainObject(history.location)) {
      throw new Error(`history prop is not valid. Expecting: history.listen: function, history.replace: function, history.location: object! Received: history.listen: ${Object.prototype.toString.call(history.listen)}, history.replace: ${Object.prototype.toString.call(history.replace)}, history.location: ${Object.prototype.toString.call(history.location)}.`);
    }

    if (replace && !respect) {
      console.warn("There won't be much to replace if you are not respecting foreign query params. Consider using replace with respect!");
    }
  }

  const context = React.useMemo(() => {
    const queryStore = createQueryStore(options);
    return {
      history,
      queryStore,
      resolvePath: _bindInstanceProperty(resolvePath).call(resolvePath, null, queryStore)
    };
  }, [history, options]);
  const [, setUpdate] = React.useState(null);
  React.useEffect(() => history.listen(({
    pathname,
    search,
    hash,
    state
  }) => {
    let needReplace = false;
    let justState = { ...state
    };

    if (!justState[QUERYSTRING_CACHE_STATE_KEY]) {
      const add = context.queryStore.parseQueryString(search);
      justState = { ...context.queryStore.createStateObject({
          respect,
          foreign: true,
          mutations: [{
            add
          }]
        })
      };
      needReplace = replace || false;
    }

    if (!justState[QUERYSTRING_CACHE_STATE_KEY].replaced) {
      context.queryStore.add({
        pathname,
        state: justState
      });
    }

    if (needReplace) {
      const {
        path,
        state
      } = context.resolvePath({
        pathname,
        hash,
        state: {
          [QUERYSTRING_CACHE_STATE_KEY]: {
            replaced: true
          }
        }
      }, {
        stringify: true
      });
      history.replace(path, state);
    } else {
      setUpdate(justState);
    }
  }), [context, history, replace, respect]);
  return React.createElement(QueryContext.Provider, {
    value: { ...context
    }
  }, children);
};

const QueryLink = ({
  children,
  pathname,
  hash,
  state,
  mutations,
  stringify,
  ...props
}) => {
  const {
    resolvePath
  } = React.useContext(QueryContext);
  return children({ ...props,
    path: resolvePath({
      pathname,
      hash,
      mutations,
      state
    }, {
      stringify
    })
  });
};

let matchedScopes = [];
const QueryParams = ({
  children,
  scope,
  params
}) => {
  {
    if (typeof scope !== 'string') {
      throw new Error(`scope prop is not valid. Expecting: string! Received: ${Object.prototype.toString.call(scope)}.`);
    }

    if (!_Array$isArray(params)) {
      throw new Error(`params prop is not valid. Expecting: array! Received: ${Object.prototype.toString.call(params)}.`);
    }
  }

  const {
    history,
    queryStore
  } = React.useContext(QueryContext);

  if (!_includesInstanceProperty(matchedScopes).call(matchedScopes, scope)) {
    matchedScopes.push(scope);

    if (params.length && history.location.search) {
      var _context;

      const queryParams = queryStore.parseQueryString(history.location.search);

      const ownQueryParams = _reduceInstanceProperty(_context = _Object$keys(queryParams)).call(_context, (destination, param) => _includesInstanceProperty(params).call(params, param) ? { ...destination,
        [param]: queryParams[param]
      } : destination, {});

      queryStore.add({
        pathname: scope,
        state: { ...queryStore.createStateObject({
            match: true,
            mutations: [{
              add: ownQueryParams
            }]
          })
        }
      });
    }
  }

  return children;
};

exports.Query = Query;
exports.QueryContext = QueryContext;
exports.QueryLink = QueryLink;
exports.QueryParams = QueryParams;
exports.mutateQueryParams = mutateQueryParams;
