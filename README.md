# Docktor

Docktor is a platform for administrating and deploying SaaS services based on Docker.

[![Build Status](https://travis-ci.org/soprasteria/docktor.svg?branch=golang)](https://travis-ci.org/soprasteria/docktor)
[![Dependencies Status](https://david-dm.org/soprasteria/docktor.svg)](https://david-dm.org/soprasteria/docktor)
[![devDependencies Status](https://david-dm.org/soprasteria/docktor/dev-status.svg)](https://david-dm.org/soprasteria/docktor?type=dev)

## Development

Tools and dependencies:
* Golang 1.7+
  * [govendor](https://github.com/kardianos/govendor)
* NodeJS 7.2.0
  * npm
  * [gulp](https://github.com/gulpjs/gulp)
* Docker

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
mongo-addr = "localhost:27017"

[auth]
jwt-secret = "a-unique-secret-for-secure-password-hosting"

[smtp]
server = ""
user = ""
identity = ""

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
gulp
```

You can then browse Docktor at [http://localhost:8080/](http://localhost:8080/)

## Production

You can generate the binaries with:

```sh
npm run dist
```

The relevant files are in `./dist` folder.

You can generate an archive of these files with:

```sh
npm run archive
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
npm run golint
# Run eslint
npm run lint
```

If you need to lint inplace your Javascript files afterwards, run:

```bash
npm run formatJS
```

## License

See the [LICENSE](./LICENSE) file.
