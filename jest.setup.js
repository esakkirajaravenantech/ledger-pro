// Mock native modules that require native binary
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: ({ children }) => children,
    PanGestureHandler: ({ children }) => children,
    State: {},
    gestureHandlerRootHOC: jest.fn(comp => comp),
    Directions: {},
  };
});

jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    executeSql: jest.fn(),
  })),
  enablePromise: jest.fn(),
}));

jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  requestPermissions: jest.fn(),
  PushNotification: jest.fn(),
}));

jest.mock('@react-native-community/push-notification-ios', () => ({
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(() => Promise.resolve()),
  getInitialNotification: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: jest.fn(),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  })),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  })),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('react-native-paper', () => {
  const React = require('react');
  const MockComponent = ({ children }) => React.createElement('View', null, children);
  return {
    Provider: MockComponent,
    DefaultTheme: { colors: {} },
    Card: MockComponent,
    Title: MockComponent,
    Paragraph: MockComponent,
    Button: MockComponent,
    TextInput: MockComponent,
    Checkbox: { Item: MockComponent },
    Divider: () => null,
    List: { Item: MockComponent, Icon: MockComponent },
    IconButton: MockComponent,
    FAB: MockComponent,
    Chip: MockComponent,
    Surface: MockComponent,
    Text: MockComponent,
    Snackbar: MockComponent,
    Menu: Object.assign(MockComponent, { Item: MockComponent }),
    DataTable: Object.assign(MockComponent, {
      Header: MockComponent,
      Title: MockComponent,
      Row: MockComponent,
      Cell: MockComponent,
    }),
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
