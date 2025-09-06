module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false,
    ecmaVersion: 2020,
    sourceType: "module"
  },
  extends: [
    "plugin:vue/recommended", // Vue 2
    "eslint:recommended"
  ],
  ignorePatterns: [
    "babel.config.js",
    "src"
  ],
  rules: {}
}
