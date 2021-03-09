module.exports = {
  roots: ['<rootDir>/'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: [
    "/node_modules"
  ],
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  testURL: "http://localhost/",
  'transform': {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: ['**/test/**/*.*s?(x)']
};
