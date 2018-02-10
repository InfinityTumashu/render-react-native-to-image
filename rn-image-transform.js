
const path = require('path');
const createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');

console.log('AAAAA')
module.exports = {
  // Mocks asset requires to return the filename. Makes it possible to test that
  // the correct images are loaded for components. Essentially
  // require('img1.png') becomes `Object { "testUri": 'path/to/img1.png' }` in
  // the Jest snapshot.
  process: (contents, filename) => {
    return `module.exports = {
      testUri: ${JSON.stringify(path.relative(__dirname, filename))}
    };`
  },
  getCacheKey: createCacheKeyFunction([__filename]),
};
