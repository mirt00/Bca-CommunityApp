import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { register } from '../../api/endpoints/auth';

/**
 * SignupScreen — new user registration form.
 * Collects all required fields from user.schema.json.
 * On success, shows a pending-approval message.
 */
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
      <View className="flex-1 bg-surface items-center justify-center px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Registration submitted</Text>
        <Text className="text-gray-500 text-center mb-8">
          Your account is pending admin approval. You will receive an email once approved.
        </Text>
        <Button label="Back to Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
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
        <View className="px-6 py-12">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Create account</Text>
          <Text className="text-gray-500 mb-8">Join the IT community</Text>

          <Input label="Full Name" placeholder="Jane Doe" value={form.fullName} onChangeText={updateField('fullName')} />
          <Input label="Email" placeholder="you@example.com" value={form.email} onChangeText={updateField('email')} keyboardType="email-address" />
          <Input label="Password" placeholder="Min. 8 characters" value={form.password} onChangeText={updateField('password')} secureTextEntry />
          <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={form.dateOfBirth} onChangeText={updateField('dateOfBirth')} />
          <Input label="Batch" placeholder="e.g. 2023" value={form.batch} onChangeText={updateField('batch')} />
          <Input label="Faculty" placeholder="e.g. Information Technology" value={form.faculty} onChangeText={updateField('faculty')} />
          <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/yourname" value={form.linkedin} onChangeText={updateField('linkedin')} autoCapitalize="none" />
          <Input label="GitHub URL" placeholder="https://github.com/yourname" value={form.github} onChangeText={updateField('github')} autoCapitalize="none" />
          <Input label="Bio (optional)" placeholder="Tell us about yourself" value={form.bio} onChangeText={updateField('bio')} multiline numberOfLines={3} />

          {error ? <Text className="text-error text-sm mb-4">{error}</Text> : null}

          <Button label="Create Account" onPress={handleRegister} loading={loading} />

          <Text
            className="text-primary-600 text-sm text-center mt-6"
            onPress={() => navigation.navigate('Login')}
          >
            Already have an account? Sign in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
