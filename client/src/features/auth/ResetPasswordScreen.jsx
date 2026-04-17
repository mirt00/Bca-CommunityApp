import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, StatusBar } from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { requestPasswordReset, resetPassword } from '../../api/endpoints/auth';

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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>

        {step === 1 && (
          <>
            <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button label="Send Reset Link" onPress={handleRequestReset} loading={loading} />
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.subtitle}>{message} Enter the token from your email and your new password.</Text>
            <View style={styles.form}>
              <Input
                label="Reset Token"
                placeholder="Paste token from email"
                value={token}
                onChangeText={setToken}
              />
              <Input
                label="New Password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button label="Update Password" onPress={handleResetPassword} loading={loading} />
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.successText}>{message}</Text>
            <Button label="Back to Login" onPress={() => navigation.navigate('Login')} />
          </>
        )}

        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          Back to login
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
  },
  successText: {
    color: '#22c55e',
    fontSize: 16,
    marginBottom: 24,
  },
  link: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 24,
  },
});