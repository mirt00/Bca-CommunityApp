import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { login as loginApi } from '../../api/endpoints/auth';
import { useAuthStore } from '../../store/authStore';

/**
 * LoginScreen — email + password login form.
 * On success, stores the PASETO token and navigates to CommunityStack.
 */
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();

  async function handleLogin() {
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const { data } = await loginApi({ email, password });
      await login(data.token, data.user);
      // Navigation is handled by App.js re-rendering based on store state
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome back</Text>
          <Text className="text-gray-500 mb-8">Sign in to your community account</Text>

          {/* Form */}
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <Text className="text-error text-sm mb-4">{error}</Text>
          ) : null}

          <Button label="Sign In" onPress={handleLogin} loading={loading} />

          {/* Links */}
          <View className="flex-row justify-between mt-6">
            <Text
              className="text-primary-600 text-sm"
              onPress={() => navigation.navigate('ResetPassword')}
            >
              Forgot password?
            </Text>
            <Text
              className="text-primary-600 text-sm"
              onPress={() => navigation.navigate('Signup')}
            >
              Create account
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
