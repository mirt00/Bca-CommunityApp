import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { login as loginApi, getOrganizations, loginOrganization } from '../../api/endpoints/auth';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();

  useEffect(() => {
    if (role === 'organization') {
      loadOrganizations();
    }
  }, [role]);

  const loadOrganizations = async () => {
    try {
      const { data } = await getOrganizations();
      setOrganizations(data.organizations || []);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    }
  };

  async function handleLogin() {
    setError('');
    
    if (role === 'organization') {
      if (!selectedOrganization) {
        setError('Please select your organization');
        return;
      }
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }
    }

    setLoading(true);
    try {
      if (role === 'organization' && selectedOrganization) {
        const { data } = await loginOrganization({ email, password });
        await login(data.organization._id, { ...data.organization, role: 'organization' });
      } else {
        const { data } = await loginApi({ email, password });
        await login(data.token, data.user);
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.roleSelector}>
              <Text style={styles.roleLabel}>Login as:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
                  onPress={() => setRole('student')}
                >
                  <Text style={[styles.roleButtonText, role === 'student' && styles.roleButtonTextActive]}>
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'organization' && styles.roleButtonActive]}
                  onPress={() => setRole('organization')}
                >
                  <Text style={[styles.roleButtonText, role === 'organization' && styles.roleButtonTextActive]}>
                    Organization
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {role === 'organization' && (
              <View style={styles.organizationSelector}>
                <Text style={styles.orgLabel}>Select Organization:</Text>
                <TouchableOpacity
                  style={styles.orgDropdown}
                  onPress={() => setShowOrgDropdown(!showOrgDropdown)}
                >
                  <Text style={styles.orgDropdownText}>
                    {selectedOrganization ? selectedOrganization.organizationName : 'Select organization'}
                  </Text>
                  <Text style={styles.dropdownArrow}>{showOrgDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {showOrgDropdown && (
                  <View style={styles.orgDropdownList}>
                    {organizations.map((org) => (
                      <TouchableOpacity
                        key={org._id}
                        style={styles.orgDropdownItem}
                        onPress={() => {
                          setSelectedOrganization(org);
                          setShowOrgDropdown(false);
                        }}
                      >
                        <Text style={styles.orgDropdownItemText}>{org.organizationName}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

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
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.links}>
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('ResetPassword')}
              >
                Forgot password?
              </Text>
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Signup')}
              >
                Create an account
              </Text>
            </View>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 32,
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
  button: {
    marginTop: 8,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  link: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  roleSelector: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  roleButtonTextActive: {
    color: '#3b82f6',
  },
  organizationSelector: {
    marginBottom: 24,
  },
  orgLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  orgDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  orgDropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#6b7280',
  },
  orgDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  orgDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orgDropdownItemText: {
    fontSize: 16,
    color: '#374151',
  },
});