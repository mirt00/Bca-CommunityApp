import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../features/auth/LoginScreen';
import SignupScreen from '../features/auth/SignupScreen';
import ResetPasswordScreen from '../features/auth/ResetPasswordScreen';
import OrganizationSignupScreen from '../features/auth/OrganizationSignupScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

/**
 * AuthStack — public screens accessible without a token.
 * Shown when the user is not authenticated or not yet approved.
 */
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

/**
 * CommunityStack — protected screens for approved users.
 * Wraps the bottom TabNavigator and can push detail screens on top.
 */
export function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      {/* TODO: add detail screens here (e.g. GroupDetail, UserProfile) */}
    </Stack.Navigator>
  );
}
