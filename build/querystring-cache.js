'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var memoize = _interopDefault(require('fast-memoize'));

const addQueryParams = memoize((queryParams, params) =>
  Object.keys(params || {}).reduce(
    (destination, key) => {
      const target = destination[key];
      const patch = params[key];
      const payload = {};

      if (Array.isArray(patch) && Array.isArray(target)) {
        payload[key] = [...target, ...patch];
      } else if (
        patch &&
        typeof patch === 'object' &&
        target &&
        typeof target === 'object'
      ) {
        payload[key] = addQueryParams(target, patch);
      } else if (typeof patch !== 'undefined') {
        payload[key] = patch;
      } else {
        payload[key] = target;
      }

      return {
        ...destination,
        ...payload
      }
    },
    { ...(queryParams || {}) }
  )
);

const removeQueryParams = memoize((queryParams, params) =>
  Object.keys(params || {}).reduce(
    (destination, key) => {
      const target = queryParams[key];
      const patch = params[key];
      const payload = {};

      if (Array.isArray(patch) && Array.isArray(target)) {
        payload[key] = target.filter((item, i) => !patch.includes(item));
      } else if (
        patch &&
        typeof patch === 'object' &&
        target &&
        typeof target === 'object'
      ) {
        payload[key] = removeQueryParams(target, patch);
      } else if (typeof patch === 'undefined') {
        delete destination[key];
      }

      return {
        ...destination,
        ...payload
      }
    },
    { ...(queryParams || {}) }
  )
);

const STATE_CACHE_KEY = '__queryParamsCacheStateObject__';
const ROOT_SCOPE = '/';
const ROOT_WILDCARD = '*';
const PERSISTED_KEY = 'persisted';
const SHADOW_KEY = Symbol('shadow');

const parsePathname = memoize(pathname => {
  const [, ...splitPathname] = pathname.split('/');

  if (splitPathname.length) {
    if (!splitPathname[0]) {
      splitPathname[0] = ROOT_SCOPE;
    }

    return splitPathname
  }

  return ROOT_WILDCARD
});

const mergeLocationIntoCache = (cache, [path, ...restPath], location) => {
  const occurrence = Object.keys(cache).find(key => key === path);

  if (path) {
    if (!occurrence) {
      cache[path] = {
        nested: {},
        [PERSISTED_KEY]: {},
        [SHADOW_KEY]: {}
      };
    }

    const partialCache = cache[occurrence || path];

    if (!restPath.length) {
      const stateObject = location.state[STATE_CACHE_KEY];
      const strategy = stateObject.persist ? PERSISTED_KEY : SHADOW_KEY;

      partialCache.location = location;

      if (stateObject.mutation.remove) {
        partialCache[strategy] = removeQueryParams(
          partialCache[strategy],
          stateObject.mutation.remove
        );
      }

      if (stateObject.mutation.add) {
        partialCache[strategy] = addQueryParams(
          partialCache[strategy],
          stateObject.mutation.add
        );
      }

      Object.keys(partialCache.nested).forEach(key =>
        flushPartialCache(partialCache.nested[key], { recursive: true })
      );
    }

    Object.assign(
      partialCache.nested,
      mergeLocationIntoCache(partialCache.nested, restPath, location)
    );
  }
};

const pickBranchFromCache = (cache, [path, ...restPath], destination = []) => {
  const partialCache = cache[path];

  if (path && cache[path]) {
    if (partialCache.location) {
      destination.push(partialCache);
    }

    return pickBranchFromCache(partialCache.nested, restPath, destination)
  }

  return destination
};

const flushPartialCache = (partialCache, options = {}) => {
  if (options.recursive) {
    if (partialCache.nested) {
      partialCache[SHADOW_KEY] = {};

      Object.keys(partialCache.nested).forEach(key =>
        flushPartialCache(partialCache.nested[key], options)
      );
    }
  } else {
    partialCache[SHADOW_KEY] = {};
  }
};

const queryStore = {
  add (location) {
    const stateObject = location.state[STATE_CACHE_KEY];

    if (!stateObject) {
      return this
    }

    const parsedPathname = parsePathname(stateObject.scope);

    mergeLocationIntoCache(this.cache, parsedPathname, location);

    Object.keys(this.cache)
      .filter(key => key !== parsedPathname[0])
      .forEach(key => flushPartialCache(this.cache[key], { recursive: true }));

    return this
  },
  clear () {
    Object.keys(this.cache).forEach(key => delete this.cache[key]);

    return this
  },
  resolveQueryString (scope, { add, remove } = {}) {
    const parsedPathname = parsePathname(scope);
    const branch = pickBranchFromCache(this.cache, parsedPathname);
    let queryParams = branch.reduce(
      (destination, partialCache) =>
        addQueryParams(destination, {
          ...partialCache[SHADOW_KEY],
          ...partialCache[PERSISTED_KEY]
        }),
      {}
    );

    if (remove) {
      queryParams = removeQueryParams(queryParams, remove);
    }

    if (add) {
      queryParams = addQueryParams(queryParams, add);
    }

    return this.stringifyQueryParams(queryParams)
  }
};

const createStateObject = payload => ({
  [STATE_CACHE_KEY]: {
    persist: false,
    scope: ROOT_SCOPE,
    mutation: {},
    ...payload
  }
});

let store;
const createQueryStore = ({
  parseQueryString,
  stringifyQueryParams
} = {}) => {
  if (!store) {
    store = Object.create(
      {
        ...queryStore,
        createStateObject,
        parseQueryString,
        stringifyQueryParams
      },
      {
        cache: {
          value: {}
        }
      }
    );
  }

  return store
};

exports.addQueryParams = addQueryParams;
exports.createQueryStore = createQueryStore;
exports.removeQueryParams = removeQueryParams;
