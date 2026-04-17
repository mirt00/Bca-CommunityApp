import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';

import { AuthStack, CommunityStack } from './navigation/StackNavigator';
import { getToken } from './utils/tokenHelper';
import { useAuthStore } from './store/authStore';

/**
 * App — root entry point.
 *
 * On mount:
 *  1. Reads the PASETO token from Expo Secure Store.
 *  2. If a valid token exists and the user is approved, renders CommunityStack.
 *  3. Otherwise renders AuthStack (public screens).
 *
 * TODO: add token expiry validation (decode exp claim without a full decrypt round-trip).
 */
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { token, isApproved, login } = useAuthStore();

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          // TODO: call /api/users/profile to validate token and hydrate user state
          // For now, trust the stored token and mark as approved
          // login(storedToken, cachedUser);
        }
      } catch (err) {
        console.warn('[App] Failed to read stored token:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token && isApproved ? <CommunityStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
