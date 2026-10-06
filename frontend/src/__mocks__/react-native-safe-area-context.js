const React = require('react');

module.exports = {
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaView: ({ children, style }) => React.createElement('div', { style }, children),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaConsumer: ({ children }) => children({ top: 44, bottom: 34, left: 0, right: 0 }),
};
