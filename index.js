/**
 * @param allowScopes {(string|Array<string>)} - Allowed or required scopes. String must be 'space' separated
 * @param options {Object} - Options
 *  - scopeKey {string} [scope] - The user property name to check for the scope. req.user[scopeKey]
 *  - requireAll {boolean} [false] - If true: all scopes must be included. If false: at least 1
 *  - errorToNext {boolean} [false] - If true: forward errors to 'next', instead of ending the response directly
 * @returns {Function}
 */
module.exports = (allowScopes, options = {}) => {
  options.scopeKey = options && options.scopeKey || 'scope';

  if (typeof allowScopes === 'string')
    allowScopes = allowScopes.split(' ');
  if (!Array.isArray(allowScopes)) {
    throw new Error('Parameter allowScopes must be a string or an array of strings.');
  }

  return (req, res, next) => {
    const error = res => {
      const err_message = 'Insufficient scope';

      //  Forward errors to next instead of ending the response directly
      if (options && options.errorToNext)
        return next({statusCode: 403, error: 'Forbidden', message: err_message});

      //  To follow RFC 6750
      //  see https://tools.ietf.org/html/rfc6750#page-7
      res.append(
        'WWW-Authenticate',
        `Bearer scope="${allowScopes.join(' ')}", error="${err_message}"`
      );

      res.status(403).send(err_message);
    };

    if (allowScopes.length === 0) {
      return next();
    }

    if (!req.user) return error(res);

    let userScopes = [];
    const scopeKey = options.scopeKey;

    //  Allow 'space' seperated string value or array value
    if (typeof req.user[scopeKey] === 'string') {
      userScopes = req.user[scopeKey].split(' ');
    } else if (Array.isArray(req.user[scopeKey])) {
      userScopes = req.user[scopeKey];
    } else return error(res);

    let isAllowed;
    if (options && options.requireAll) {
      isAllowed = allowScopes.every(scope => userScopes.includes(scope));
    } else {
      isAllowed = allowScopes.some(scope => userScopes.includes(scope));
    }

    return isAllowed ? next() : error(res);
  };
};
