import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../features/auth/LoginScreen';
import SignupScreen from '../features/auth/SignupScreen';
import ResetPasswordScreen from '../features/auth/ResetPasswordScreen';
import OrganizationSignupScreen from '../features/auth/OrganizationSignupScreen';
import TabNavigator from './TabNavigator';
import OrganizationDashboard from '../features/organization/OrganizationDashboard';

const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OrganizationSignup" component={OrganizationSignupScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

export function CommunityStack({ isOrganization }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {isOrganization ? (
        <Stack.Screen name="OrganizationDashboard" component={OrganizationDashboard} />
      ) : (
        <Stack.Screen name="Tabs" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
}
