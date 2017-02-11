var path = require('path');

module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
    jquery: true
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      arrowFunctions: true,
      binaryLiterals: true,
      blockBindings: true,
      classes: true,
      defaultParams: true,
      destructuring: true,
      forOf: true,
      generators: true,
      modules: true,
      objectLiteralComputedProperties: true,
      objectLiteralDuplicateProperties: true,
      objectLiteralShorthandMethods: true,
      objectLiteralShorthandProperties: true,
      octalLiterals: true,
      regexUFlag: true,
      regexYFlag: true,
      spread: true,
      superInFunctions: true,
      templateStrings: true,
      unicodeCodePointEscapes: true,
      globalReturn: true,
      jsx: true,
      experimentalObjectRestSpread: true
    }
  },
  plugins: [
    "react",
    "import"
  ],
  settings: {
    'import/resolver': {
      webpack: {
        config: path.resolve("./webpack.config.dev.js")
      }
    }
  },
  rules: {
    "indent": [2, 2],
    "strict": [2, "never"],
    "quotes": [1, "single", { avoidEscape: true }],
    "semi": 1,
    "curly": [1, "all"],
    "object-curly-spacing": [1, "always"],
    "comma-spacing": 1,
    "space-before-blocks": [1, "always"],
    "space-infix-ops": ["error", {int32Hint: false}],
    "no-unused-vars": 2,
    "jsx-quotes": [2, "prefer-single"],
    "react/jsx-curly-spacing": [2, "never"],
    "react/display-name": 0,
    "react/jsx-no-undef": 2,
    "react/jsx-sort-props": 0,
    "react/jsx-uses-react": 2,
    "react/jsx-uses-vars": 2,
    "react/no-did-mount-set-state": 2,
    "react/no-did-update-set-state": 2,
    "react/no-multi-comp": 0,
    "react/no-unknown-property": 2,
    "react/prop-types": 2,
    "react/react-in-jsx-scope": 2,
    "react/self-closing-comp": 2,
    "react/jsx-wrap-multilines": 2,
    "import/no-unresolved": [2, {commonjs: true, amd: true}],
    "import/named": 2,
    "import/namespace": 2,
    "import/default": 2,
    "import/export": 2
  }
}