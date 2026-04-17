import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { requestPasswordReset, resetPassword } from '../../api/endpoints/auth';

/**
 * ResetPasswordScreen — two-step password reset flow.
 * Step 1: Enter email → receive reset token via email.
 * Step 2: Enter token + new password → password updated.
 */
export default function ResetPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestReset() {
    setError('');
    if (!email) { setError('Email is required'); return; }

    setLoading(true);
    try {
      const { data } = await requestPasswordReset({ email });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError('');
    if (!token || !newPassword) { setError('Token and new password are required'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setMessage('Password updated successfully. You can now log in.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Reset password</Text>

        {step === 1 && (
          <>
            <Text className="text-gray-500 mb-8">Enter your email to receive a reset link.</Text>
            <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            {error ? <Text className="text-error text-sm mb-4">{error}</Text> : null}
            <Button label="Send Reset Link" onPress={handleRequestReset} loading={loading} />
          </>
        )}

        {step === 2 && (
          <>
            <Text className="text-gray-500 mb-8">{message} Enter the token from your email and your new password.</Text>
            <Input label="Reset Token" placeholder="Paste token from email" value={token} onChangeText={setToken} />
            <Input label="New Password" placeholder="Min. 8 characters" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            {error ? <Text className="text-error text-sm mb-4">{error}</Text> : null}
            <Button label="Update Password" onPress={handleResetPassword} loading={loading} />
          </>
        )}

        {step === 3 && (
          <>
            <Text className="text-success text-base mb-8">{message}</Text>
            <Button label="Back to Login" onPress={() => navigation.navigate('Login')} />
          </>
        )}

        <Text
          className="text-primary-600 text-sm text-center mt-6"
          onPress={() => navigation.navigate('Login')}
        >
          Back to login
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
