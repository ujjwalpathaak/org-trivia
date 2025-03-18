module.exports = {
  testEnvironment: 'node', // Or 'jsdom' if you are testing browser code
  collectCoverage: true,  // Enable coverage collection
  coverageDirectory: 'coverage',  // Output directory for coverage report
  coverageReporters: ['text', 'lcov'],  // Choose the coverage reporters
  transform: {
    '^.+\\.js$': 'babel-jest', // Use babel-jest to transform .js files
  },
  globals: {
    'jest/globals': {
      'import.meta': { url: '' }, // Required for ESM support in Jest
    },
  },
};
