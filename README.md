# express-jwt-scope
[![NPM version](https://img.shields.io/npm/v/express-jwt-scope.svg)](https://www.npmjs.com/package/express-jwt-scope)

Middleware that checks validated JsonWebTokens (JWT) for scopes

## Install

    $ npm install express-jwt-scope

> Peer dependency: `express@^4.0.0`

## Usage

>Requires : `express-jwt`

Use together with [express-jwt](https://github.com/auth0/express-jwt) to validate JWT(JsonWebTokens) and set req.user

#### Example 1
```javascript
const jwt = require('express-jwt');
const jwtScope = require('express-jwt-scope');

let options = {};
app.get('/users',
  jwt({ secret: 'shared_secret' }), //  Validates JWT and sets req.user
  jwtScope('read:users', options),
  (req, res)=> res.json({message: 'Hello from /users'}));

// This user will have access
let user = { scope: 'read:users' };
```

#### Example 2
Allow if any of `scope`, looks like this:

```javascript
const jwt = require('express-jwt');
const jwtScope = require('express-jwt-scope');
//  Validates JWT and sets req.user
app.use(jwt({ secret: 'shared_secret'}));

app.get('/users', jwtScope('read:users write:users'), (req, res)=> {
  res.json({message: 'Hello from /users'})
});

// This user will have access
let user = { scope: 'read:users' };
```

To require that all scopes are provided, use the `requireAll: true` option:

```javascript
let options = { requireAll: true };
app.post('/users', jwtScope('read:users write:users', options), (req, res)=> {
  //  Do stuff...
});

// This user will have access
const authorizedUser = { scope: 'read:users write:users' };

// This user will NOT have access
const unauthorizedUser = { scope: 'read:users' };
```

### Custom usage
```javascript
const jwt = require('express-jwt');
const jwtScope = require('express-jwt-scope');

app.use(jwt({ secret: 'shared_secret'}));

//  Checks req.user['permission']
const checkPermissions = (permissions)=> jwtScope(permissions, { scopeKey : 'permissions', requireAll: true });
//  Checks req.user['yourScope']
const checkYourScope = (yourScope)=> jwtScope(yourScope, { scopeKey : 'yourScope' });

app.post('/users', checkPermissions('write:users read:users'), (req, res)=> {
  //  Do stuff...
});

app.get('/yourPath', checkYourScope('your:scope'), (req, res)=> {
  res.json({message: 'Hello from /yourPath!'});
});
```

### Input types
#### String (space separated)

```
"write:users read:users"
jwtScope("write:users read:users")
```
#### Array

```
["write:users", "read:users"]
jwtScope(["write:users", "read:users"])
```

## Options

- `scopeKey`: The user property name to check for the scope(s). 
    -   Default value: `'scope'` => req.user['scope'].
    -   Ex: `'permission'` => req.user['permission']
- `requireAll`: `true` => Requires all scopes to be provided. 
    -   Default value: `false`
- `errorToNext`: `true` => Forward errors to express `next()`, instead of ending the response directly. 
    -   Default value: `false`
    
##  Examples
### Full Auth0
```js
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const jwtScope = require('express-jwt-scope');

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and 
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://YOUR_DOMAIN/.well-known/jwks.json`
  }),

  //  Validate the audience and the issuer.
  audience: 'YOUR_API_IDENTIFIER',
  issuer: `https://YOUR_DOMAIN/`,
  algorithms: ['RS256']
});

/**  Public routes goes here  */
// This route doesn't need authentication
app.get('/api/public', (req, res)=> {
  res.json({message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'});
});

// This route need authentication
app.get('/api/private', checkJwt, (req, res)=> {
  res.json({message: 'Hello from a private endpoint! You need to be authenticated to see this.'});
});

// This route need authentication and scope
app.get('/api/private-scoped', checkJwt, jwtScope('read:messages'), (req, res)=> {
  res.json({message: 'Hello from a private endpoint! You need to be authenticated and have a req.user.scope of read:messages to see this.'});
});

/** Private routes goes here  */
app.use(checkJwt);
app.get('/api/another-private-scoped', jwtScope('read:info'), (req, res)=> {
  res.json({message: 'Hello from a private endpoint! You need to be authenticated and have `read:info` included in req.user.scope to see this.'});
});

//  Enable Role-Based Access Control for APIs, to add Auth0 permissions in the access token.
//  See https://auth0.com/docs/dashboard/guides/apis/enable-rbac
let options = {
  scopeKey: 'permissions'
};
app.get('/api/another-private-scoped', jwtScope('read:user', options), (req, res)=> {
  res.json({message: 'Hello from a private endpoint! You need to be authenticated and have `read:user` included in req.user["permission"] to see this.'});
});

```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.