# Docktor [![Build Status](https://travis-ci.org/soprasteria/docktor.svg?branch=golang)](https://travis-ci.org/soprasteria/docktor)

## Run
You will need a mongo database.

1. Get js dependencies
```bash
npm install
```

2. Get go dependencies into vendor
```bash
govendor sync
```

3. Launch Docktor in dev mode
```bash
gulp
```

## Contribute with Atom
Docktor have his own .editorconfig so please install editorconfig plugin: https://atom.io/packages/editorconfig
Also some rules have been set for jsx, es6 and sass so please install the following tools
- eslint: https://atom.io/packages/linter-eslint
- sass lint plugin: https://atom.io/packages/linter-sass-lint

## Generate package

```bash
# In exploded format
gulp dist
# In a single zip
gulp archive
```

## With Docker

Run container with following command :

`docker run -d --name docktor -p 8080:8080 -v /home:/root docktor:latest`

Map /home to load local `.docktor.toml` file.

## License
GNU GENERAL PUBLIC LICENSE 3

See License File.
