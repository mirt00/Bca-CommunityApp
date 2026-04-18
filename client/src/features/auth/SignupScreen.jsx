import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, StatusBar, TouchableOpacity, Image, Alert, Picker } from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { register, getOrganizations } from '../../api/endpoints/auth';

export default function SignupScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    nickname: '',
    email: '',
    password: '',
    dateOfBirth: '',
    batch: '',
    faculty: '',
    organizationId: '',
    profilePicture: '',
    linkedinUrl: '',
    linkedinUsername: '',
    githubUrl: '',
    githubUsername: '',
    bio: '',
    role: 'student',
  });
  const [organizations, setOrganizations] = useState([]);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await getOrganizations();
        setOrganizations(res.data.organizations || []);
      } catch (err) {
        console.error('Failed to fetch organizations', err);
      }
    }
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos to upload a profile picture.');
      }
    })();
    fetchOrgs();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setForm((prev) => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  };

  function updateField(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    setError('');
    const required = ['fullName', 'email', 'password'];

    if (form.role === 'student') {
      required.push('dateOfBirth', 'batch', 'faculty');
    } else if (form.role === 'organization') {
      required.push('organizationId');
    }

    const payload = { 
      ...form,
      linkedin: form.linkedinUrl ? `${form.linkedinUrl}|${form.linkedinUsername}` : undefined,
      github: form.githubUrl ? `${form.githubUrl}|${form.githubUsername}` : undefined,
    };
    delete payload.linkedinUrl;
    delete payload.linkedinUsername;
    delete payload.githubUrl;
    delete payload.githubUsername;
    if (!payload.organizationId) {
      delete payload.organizationId;
    }

    const missing = required.filter((f) => !form[f]);
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await register(payload);
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
            <View style={styles.roleSelector}>
              <Text style={styles.roleLabel}>I am a:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[styles.roleButton, form.role === 'student' && styles.roleButtonActive]}
                  onPress={() => updateField('role')('student')}
                >
                  <Text style={[styles.roleButtonText, form.role === 'student' && styles.roleButtonTextActive]}>
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, form.role === 'organization' && styles.roleButtonActive]}
                  onPress={() => navigation.navigate('OrganizationSignup')}
                >
                  <Text style={[styles.roleButtonText, form.role === 'organization' && styles.roleButtonTextActive]}>
                    Organization
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imagePickerContainer}>
              {form.profilePicture ? (
                <Image source={{ uri: form.profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
              <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                <Text style={styles.imagePickerButtonText}>
                  {form.profilePicture ? 'Change Photo' : 'Upload Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={form.fullName}
              onChangeText={updateField('fullName')}
            />
            <Input
              label="Nickname (optional)"
              placeholder="Jane"
              value={form.nickname}
              onChangeText={updateField('nickname')}
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

            {form.role === 'student' && (
              <>
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
                {organizations.length > 0 && (
                  <>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerLabel}>Organization Name (optional)</Text>
                      <TouchableOpacity 
                        style={styles.orgDropdown}
                        onPress={() => setShowOrgPicker(!showOrgPicker)}
                      >
                        <Text style={styles.orgDropdownText}>
                          {form.organizationId 
                            ? organizations.find(o => o._id === form.organizationId)?.organizationName 
                            : 'Select Organization'}
                        </Text>
                        <Text style={styles.dropdownArrow}>{showOrgPicker ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                    </View>
                    {showOrgPicker && (
                      <View style={styles.orgPickerList}>
                        <TouchableOpacity 
                          style={styles.orgPickerItem}
                          onPress={() => {
                            setForm(prev => ({ ...prev, organizationId: '' }));
                            setShowOrgPicker(false);
                          }}
                        >
                          <Text style={styles.orgPickerItemText}>None</Text>
                        </TouchableOpacity>
                        {organizations.map((org) => (
                          <TouchableOpacity 
                            key={org._id} 
                            style={styles.orgPickerItem}
                            onPress={() => {
                              setForm(prev => ({ ...prev, organizationId: org._id }));
                              setShowOrgPicker(false);
                            }}
                          >
                            <Text style={styles.orgPickerItemText}>{org.organizationName}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </>
            )}

            {form.role === 'organization' && organizations.length > 0 && (
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Organization Name</Text>
                <Picker
                  selectedValue={form.organizationId}
                  onValueChange={updateField('organizationId')}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Your Organization" value="" />
                  {organizations.map((org) => (
                    <Picker.Item key={org._id} label={org.organizationName} value={org._id} />
                  ))}
                </Picker>
              </View>
            )}

            <Input
              label="LinkedIn URL (optional)"
              placeholder="https://linkedin.com/in/yourname"
              value={form.linkedinUrl}
              onChangeText={updateField('linkedinUrl')}
              autoCapitalize="none"
            />
            <Input
              label="LinkedIn Username (optional)"
              placeholder="yourname"
              value={form.linkedinUsername}
              onChangeText={updateField('linkedinUsername')}
            />
            <Input
              label="GitHub URL (optional)"
              placeholder="https://github.com/yourname"
              value={form.githubUrl}
              onChangeText={updateField('githubUrl')}
              autoCapitalize="none"
            />
            <Input
              label="GitHub Username (optional)"
              placeholder="yourname"
              value={form.githubUsername}
              onChangeText={updateField('githubUsername')}
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

            <View style={styles.links}>
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Login')}
              >
                Already have an account? Sign in
              </Text>
              <Text
                style={[styles.link, styles.orgLink]}
                onPress={() => navigation.navigate('OrganizationSignup')}
              >
                Register Organization
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
  },
  orgLink: {
    marginTop: 12,
  },
  links: {
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
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
selectedOrgText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  orgDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  orgDropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#6b7280',
  },
  orgPickerList: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    maxHeight: 200,
  },
  orgPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orgPickerItemText: {
    fontSize: 16,
    color: '#374151',
  },
  picker: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    color: '#6b7280',
    fontSize: 12,
  },
  imagePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  imagePickerButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
});