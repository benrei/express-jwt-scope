# Change Log

All notable changes to this project will be documented in this file starting from version **v1.0.0**.
This project adheres to [Semantic Versioning](http://semver.org/).

## 1.0.0 - 2022-05-01

- add compatibility with `express-jwt@7.x` which decodes the JWT payload to `req.auth` instead of `req.user`. See [migration guide](https://github.com/auth0/express-jwt#migration-from-v6) for details.
