module.exports = {

    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '.*\\.integration\\.test\\.ts$'
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.integration.test.ts',
        '!src/tests/**',
        '!src/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    testTimeout: 10000,

    // 1. Tell Jest NOT to ignore nanoid when transforming
    transformIgnorePatterns: [
        "node_modules/(?!nanoid/.*)"
    ],
    // 2. Ensure ts-jest or babel-jest handles the transformation
    transform: {
        "^.+\\.[tj]sx?$": "ts-jest",
        // If you use babel-jest, replace "ts-jest" with "babel-jest"
    },
};
