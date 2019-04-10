'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var qs = _interopDefault(require('qs'));
var memoize = _interopDefault(require('fast-memoize'));

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

const pickBranchFromCache = (cache, [path, ...restPath], destination = []) => {
  if (path && cache[path]) {
    if (cache[path].location) {
      destination.push(cache[path]);
    }

    return pickBranchFromCache(cache[path].nested, restPath, destination)
  }

  return destination
};

const queryStore = {
  add (location) {
    const [, ...parsedPath] = location.pathname.split('/');

    mergeLocationIntoCache(this.cache, parsedPath, location);

    return this
  },
  clear () {
    Object.keys(this.cache).forEach(key => delete this.cache[key]);

    return this
  },
  resolveQueryString (pathname, { add, remove } = {}) {
    const [, ...parsedTo] = pathname.split('/');
    const branch = pickBranchFromCache(this.cache, parsedTo);
    let queryParams = branch.reduce(
      (destination, { location: { search } }) => ({
        ...destination,
        ...this.parseQueryString(search)
      }),
      {}
    );

    if (add) {
      queryParams = addQueryParams(queryParams, add);
    }

    if (remove) {
      queryParams = removeQueryParams(queryParams, remove);
    }

    return this.stringifyQueryParams(queryParams)
  }
};
let store;

const createQueryStore = ({
  parseQueryString: parseQueryString$1 = parseQueryString,
  stringifyQueryParams: stringifyQueryParams$1 = stringifyQueryParams
} = {}) => {
  if (!store) {
    store = Object.create(
      { ...queryStore, parseQueryString: parseQueryString$1, stringifyQueryParams: stringifyQueryParams$1 },
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
exports.parseQueryString = parseQueryString;
exports.removeQueryParams = removeQueryParams;
exports.stringifyQueryParams = stringifyQueryParams;
