import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';

// Rent screens
import RentUnitsListScreen from '../screens/rent/RentUnitsListScreen';
import RentUnitDetailScreen from '../screens/rent/RentUnitDetailScreen';
import AddEditRentUnitScreen from '../screens/rent/AddEditRentUnitScreen';
import RentReceiptScreen from '../screens/rent/RentReceiptScreen';

// Property screens
import PropertyListScreen from '../screens/property/PropertyListScreen';
import PropertyDetailScreen from '../screens/property/PropertyDetailScreen';
import AddEditPropertyScreen from '../screens/property/AddEditPropertyScreen';
import PropertyTaxRecordScreen from '../screens/property/PropertyTaxRecordScreen';

// Water screens
import WaterUnitsListScreen from '../screens/water/WaterUnitsListScreen';
import WaterUnitDetailScreen from '../screens/water/WaterUnitDetailScreen';
import AddEditWaterUnitScreen from '../screens/water/AddEditWaterUnitScreen';
import WaterReceiptScreen from '../screens/water/WaterReceiptScreen';

const Tab = createBottomTabNavigator();
const RentStack = createStackNavigator();
const PropertyStack = createStackNavigator();
const WaterStack = createStackNavigator();
const HomeStack = createStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="HomeDashboard"
      component={HomeScreen}
      options={{ title: 'LedgerPro' }}
    />
  </HomeStack.Navigator>
);

const RentStackNavigator = () => (
  <RentStack.Navigator>
    <RentStack.Screen
      name="RentUnitsList"
      component={RentUnitsListScreen}
      options={{ title: 'Rent Units' }}
    />
    <RentStack.Screen
      name="RentUnitDetail"
      component={RentUnitDetailScreen}
      options={{ title: 'Unit Details' }}
    />
    <RentStack.Screen
      name="AddEditRentUnit"
      component={AddEditRentUnitScreen}
      options={{ title: 'Add/Edit Rent Unit' }}
    />
    <RentStack.Screen
      name="RentReceipt"
      component={RentReceiptScreen}
      options={{ title: 'Rent Receipt' }}
    />
  </RentStack.Navigator>
);

const PropertyStackNavigator = () => (
  <PropertyStack.Navigator>
    <PropertyStack.Screen
      name="PropertyList"
      component={PropertyListScreen}
      options={{ title: 'Our Buildings' }}
    />
    <PropertyStack.Screen
      name="PropertyDetail"
      component={PropertyDetailScreen}
      options={{ title: 'Building Details' }}
    />
    <PropertyStack.Screen
      name="AddEditProperty"
      component={AddEditPropertyScreen}
      options={{ title: 'Add/Edit Building' }}
    />
    <PropertyStack.Screen
      name="PropertyTaxRecord"
      component={PropertyTaxRecordScreen}
      options={{ title: 'Tax Record' }}
    />
  </PropertyStack.Navigator>
);

const WaterStackNavigator = () => (
  <WaterStack.Navigator>
    <WaterStack.Screen
      name="WaterUnitsList"
      component={WaterUnitsListScreen}
      options={{ title: 'Water Units' }}
    />
    <WaterStack.Screen
      name="WaterUnitDetail"
      component={WaterUnitDetailScreen}
      options={{ title: 'Water Unit Details' }}
    />
    <WaterStack.Screen
      name="AddEditWaterUnit"
      component={AddEditWaterUnitScreen}
      options={{ title: 'Add/Edit Water Unit' }}
    />
    <WaterStack.Screen
      name="WaterReceipt"
      component={WaterReceiptScreen}
      options={{ title: 'Water Receipt' }}
    />
  </WaterStack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1565C0',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { height: 58, paddingBottom: 6 },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Home: focused ? 'view-dashboard' : 'view-dashboard-outline',
              Rent: focused ? 'home-city' : 'home-city-outline',
              Property: focused ? 'office-building' : 'office-building-outline',
              Water: focused ? 'water' : 'water-outline',
            };
            return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
          },
        })}>
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{ tabBarLabel: 'Dashboard' }}
        />
        <Tab.Screen
          name="Rent"
          component={RentStackNavigator}
          options={{ tabBarLabel: 'Rent' }}
        />
        <Tab.Screen
          name="Property"
          component={PropertyStackNavigator}
          options={{ tabBarLabel: 'Property Tax' }}
        />
        <Tab.Screen
          name="Water"
          component={WaterStackNavigator}
          options={{ tabBarLabel: 'Water' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
