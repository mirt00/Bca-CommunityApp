import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, StatusBar } from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { register } from '../../api/endpoints/auth';

export default function SignupScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    batch: '',
    faculty: '',
    linkedin: '',
    github: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    setError('');
    const required = ['fullName', 'email', 'password', 'dateOfBirth', 'batch', 'faculty', 'linkedin', 'github'];
    const missing = required.filter((f) => !form[f]);
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>Registration Submitted!</Text>
        <Text style={styles.successText}>
          Your account is pending admin approval. You will receive an email once approved.
        </Text>
        <Button label="Back to Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the BCA Community</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={form.fullName}
              onChangeText={updateField('fullName')}
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={updateField('email')}
              keyboardType="email-address"
            />
            <Input
              label="Password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChangeText={updateField('password')}
              secureTextEntry
            />
            <Input
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              value={form.dateOfBirth}
              onChangeText={updateField('dateOfBirth')}
            />
            <Input
              label="Batch"
              placeholder="e.g. 2023"
              value={form.batch}
              onChangeText={updateField('batch')}
            />
            <Input
              label="Faculty"
              placeholder="e.g. Information Technology"
              value={form.faculty}
              onChangeText={updateField('faculty')}
            />
            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/yourname"
              value={form.linkedin}
              onChangeText={updateField('linkedin')}
              autoCapitalize="none"
            />
            <Input
              label="GitHub URL"
              placeholder="https://github.com/yourname"
              value={form.github}
              onChangeText={updateField('github')}
              autoCapitalize="none"
            />
            <Input
              label="Bio (optional)"
              placeholder="Tell us about yourself"
              value={form.bio}
              onChangeText={updateField('bio')}
              multiline
              numberOfLines={3}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button label="Create Account" onPress={handleRegister} loading={loading} />

            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Login')}
            >
              Already have an account? Sign in
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 24,
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
  link: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
});