module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'copilot-integration.test.ts', // Exclude integration test (run manually)
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000, // 30 seconds for integration tests
  moduleNameMapper: {
    '^@github/copilot-sdk$': '<rootDir>/node_modules/@github/copilot-sdk',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@github/copilot-sdk)/)',
  ],
};
