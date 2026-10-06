module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
  },
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^react-native-svg$': '<rootDir>/src/__mocks__/react-native-svg.js',
    '^react-native-safe-area-context$': '<rootDir>/src/__mocks__/react-native-safe-area-context.js',
    '^expo-haptics$': '<rootDir>/src/__mocks__/expo-haptics.js',
    '\\.(mp4|png|jpg|jpeg|gif)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
};
