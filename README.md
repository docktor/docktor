## Run
You will need a mongo database.

1. Get js dependencies
```bash
yarn install
```

2. Get go dependencies into vendor
```bash
govendor sync
```

3. Launch Docktor
```bash
gulp
```

## Contribute with Atom
Docktor have his own .editorconfig so please install editorconfig plugin: https://atom.io/packages/editorconfig
Also some rules have been set for jsx, es6 and sass so please install the following tools
- eslint: https://atom.io/packages/linter-eslint
- sass lint plugin: https://atom.io/packages/linter-sass-lint

## License
GNU GENERAL PUBLIC LICENSE 3

See License File.
