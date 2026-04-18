import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';

import { AuthStack, CommunityStack } from './navigation/StackNavigator';
import { getToken } from './utils/tokenHelper';
import { useAuthStore } from './store/authStore';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { token, user, isApproved, login } = useAuthStore();

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const storedToken = await getToken();
        if (storedToken) {
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const isOrganization = user?.role === 'organization';
  const canAccess = token && (isApproved || isOrganization);

  return (
    <NavigationContainer>
      {canAccess ? <CommunityStack isOrganization={isOrganization} /> : <AuthStack />}
    </NavigationContainer>
  );
}
