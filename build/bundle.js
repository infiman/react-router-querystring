'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var qs = _interopDefault(require('qs'));
var memoize = _interopDefault(require('fast-memoize'));

const mergeLocationIntoCache = (cache, [path, ...restPath], location) => {
  const occurrence = Object.keys(cache).find(key => key === path);

  if (path) {
    if (!occurrence) {
      cache[path] = {
        nested: {}
      };
    }

    if (!restPath.length) {
      cache[path].location = location;
    }

    Object.assign(
      cache[occurrence || path].nested,
      mergeLocationIntoCache(
        cache[occurrence || path].nested,
        restPath,
        location
      )
    );
  }
};

const queryStore = {
  add (path, location) {
    const [, ...parsedPath] = path.split('/');

    mergeLocationIntoCache(this.cache, parsedPath, location);

    return this
  },
  clear () {
    Object.keys(this.cache).forEach(key => delete this.cache[key]);

    return this
  },
  resolveQueryString (to) {
    console.log(this, to);
    console.warn('NOT IMPLEMENTED YET!');
  }
};
let store;

const createQueryStore = () => {
  if (!store) {
    store = Object.create(queryStore, {
      cache: {
        value: {}
      }
    });
  }

  return store
};

const QS_CONFIG = {
  arrayFormat: 'brackets',
  addQueryPrefix: true,
  ignoreQueryPrefix: true,
  interpretNumericEntities: true
};

const parseQueryString = memoize((queryString, options) =>
  qs.parse(queryString, options || QS_CONFIG)
);

const stringifyQueryParams = memoize((queryParams, options) =>
  qs.stringify(queryParams, options || QS_CONFIG)
);

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

exports.addQueryParams = addQueryParams;
exports.createQueryStore = createQueryStore;
exports.parseQueryString = parseQueryString;
exports.removeQueryParams = removeQueryParams;
exports.stringifyQueryParams = stringifyQueryParams;
