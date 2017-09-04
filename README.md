# Docktor

Docktor is a platform for administrating and deploying SaaS services based on Docker.

[![Build Status](https://travis-ci.org/soprasteria/docktor.svg?branch=golang)](https://travis-ci.org/soprasteria/docktor)
[![Dependencies Status](https://david-dm.org/soprasteria/docktor.svg)](https://david-dm.org/soprasteria/docktor)
[![devDependencies Status](https://david-dm.org/soprasteria/docktor/dev-status.svg)](https://david-dm.org/soprasteria/docktor?type=dev)

## Development

Tools and dependencies:
* Golang 1.7+
  * [govendor](https://github.com/kardianos/govendor)
* NodeJS 8+
  * npm 5+
* Docker
  * 1.11+

Get the dependencies:

```sh
npm install
govendor sync
```

Run a MongoDB database:

```sh
docker run --name mongo -p 27017:27017 -v /data/mongo:/data/db -d mongo
```

Run a Redis cache:

```sh
docker run --name redis -p 6379:6379 -d redis
```

Docktor allows three ways of configuration:

1. Use a config file as described above. By default : `~/.docktor.toml`
2. Use environment variables (e.g., `server.mongo.addr` becomes `MONGO_SERVER_MONGO_ADDR`)
3. Use CLI parameters (`--server.mongo.addr`)

You can see all the available settings and their defaults with:

```sh
go run main.go serve --help
```

Here is an example file:

```toml
env = "dev"

[server]
  [server.mongo]
    addr = "localhost:27017"
    username = ""
    password = ""
  [server.redis]
    addr = "localhost:6379"
    password = ""

[auth]
  jwt-secret = "a-unique-secret-for-secure-password-hosting"
  reset-pwd-secret = "a-unique-secret-for-reset-password-token-generation"
  bcrypt-pepper = "a-pepper-used-when-storing-password-to-db"

[smtp]
  server = ""
  user = ""
  identity = ""
  password = ""
  sender = ""

[ldap]
  address = ""
  baseDN = ""
  bindDN = ""
  bindPassword = ""
  searchFilter = ""

  [ldap.attr]
  username = ""
  firstname = ""
  lastname = ""
  realname = ""
  email = ""
```

Then, you can run Docktor in dev mode, with live reload, with the command:

```sh
npm start
```

You can then browse Docktor at [http://localhost:8080/](http://localhost:8080/)

## Debug

It's possible to debug the docktor server using vscode and delve.
In order to do that, just:

* Install delve

```shell
go get github.com/derekparker/delve/cmd/dlv
```

* launch the client side in a terminal

```shell
npm run client:start
```

* use the vscode debugger with the 'Debug Package' profile which was commited

Be careful, new endpoints will not be taken account until you restart the debugger


## Production

You can generate the binaries with:

```sh
npm run build
npm run package
```

## Contributing

Docktor is open to contribution.

### Install plugins for guidelines

Docktor have his own code guideline. Please install:
- Editor config: [Atom](https://atom.io/packages/editorconfig) [VSCode](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- ESLint for Javascript ES6 and JSX [Atom](https://atom.io/packages/linter-eslint) [VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- Sasslint for Saas [Atom](https://atom.io/packages/linter-sass-lint) [VSCode](https://marketplace.visualstudio.com/items?itemName=glen-84.sass-lint)

### Lint checks

Run the following commands to check lint errors

```bash
# Get Gometalinter
go get -u github.com/alecthomas/gometalinter
# Run go lint (with gometalinter)
npm run server:lint
# Run eslint
npm run client:lint
```

If you need to lint inplace your Javascript files afterwards, run:

```bash
npm run client:fix
```

# Updating dependencies

Updating dependencies regularly is important to fix bugs and use latest features.

## Back-end : Golang

```
# Run govendor to update every Golang dependency from remote packages.
govendor fetch +all
# Build the application to check that application still compiles
npm run build
```

## Front-end : NPM

Use of [NPM-Check-Updates](https://www.npmjs.com/package/npm-check-updates) is strongly recommended.

```
# Install NPM Check Updates (aka ncu)
[sudo] npm install -g npm-check-updates
# List all updatable libraries
ncu
# Upgrade package.json with latest stable and comaptible versions
ncu -u
# Build the application to check that application is still working
# For dev
npm start
# For prod
npm run build
./docktor serve
```

To update dependencies with latest version (not necessarily compatible), use `ncu -a`

## License

See the [LICENSE](./LICENSE) file.
