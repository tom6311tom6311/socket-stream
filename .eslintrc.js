module.exports = {
  "extends": "airbnb-base",
  "env": {
    "mocha": true
  },
  "plugins": [
    "import",
    "chai-friendly",
  ],
  "rules": {
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2
  }
};