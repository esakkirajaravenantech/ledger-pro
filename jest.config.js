module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-paper|react-native-vector-icons|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-reanimated|react-native-sqlite-storage|react-native-push-notification|@react-native-community/push-notification-ios|@react-native-async-storage)/)',
  ],
};
