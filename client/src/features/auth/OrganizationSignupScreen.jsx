import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, StatusBar, TouchableOpacity, Image, Alert, Modal, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { registerOrganization } from '../../api/endpoints/auth';

export default function OrganizationSignupScreen({ navigation }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    organizationName: '',
    establishedDate: new Date(),
    location: '',
    website: '',
    facebookUrl: '',
    facebookUsername: '',
    logo: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos to upload a logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setForm((prev) => ({ ...prev, logo: result.assets[0].uri }));
    }
  };

  async function handleRegister() {
    setError('');
    const required = ['email', 'password', 'organizationName', 'establishedDate', 'location'];

    const missing = required.filter((f) => !form[f]);
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      console.log('Registering with:', form.email, form.organizationName);
      const payload = {
        email: form.email,
        password: form.password,
        organizationName: form.organizationName,
        establishedDate: form.establishedDate.toISOString().split('T')[0],
        location: form.location,
        website: form.website || undefined,
        socials: {
          facebook: {
            url: form.facebookUrl || undefined,
            username: form.facebookUsername || undefined,
          },
        },
        logo: form.logo || undefined,
      };

      const response = await registerOrganization(payload);
      console.log('Success:', response.data);
      setSuccess(true);
    } catch (err) {
      console.log('Error:', err.message, err.response?.data);
      setError(err.response?.data?.error || 'Organization registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>Organization Registered!</Text>
        <Text style={styles.successText}>
          Your organization has been created successfully.
        </Text>
        <Button label="Go to Login" onPress={() => navigation.navigate('Login')} />
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
            <Text style={styles.title}>Register Organization</Text>
            <Text style={styles.subtitle}>Add your organization to BCA Community</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.imagePickerContainer}>
              {form.logo ? (
                <Image source={{ uri: form.logo }} style={styles.logoImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Add Logo</Text>
                </View>
              )}
              <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                <Text style={styles.imagePickerButtonText}>
                  {form.logo ? 'Change Logo' : 'Upload Logo'}
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Email"
              placeholder="org@example.com"
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
              label="Organization Name"
              placeholder="e.g. Tech Company Inc."
              value={form.organizationName}
              onChangeText={updateField('organizationName')}
            />
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Established Date</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>
                  {form.establishedDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && Platform.OS === 'ios' && (
                <Modal transparent animationType="slide">
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <DateTimePicker
                        value={form.establishedDate}
                        mode="date"
                        display="spinner"
                        onChange={(event, date) => {
                          setShowDatePicker(false);
                          if (date) setForm(prev => ({ ...prev, establishedDate: date }));
                        }}
                      />
                      <Pressable style={styles.modalDone} onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.modalDoneText}>Done</Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>
              )}
              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={form.establishedDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setForm(prev => ({ ...prev, establishedDate: date }));
                  }}
                />
              )}
            </View>
            <Input
              label="Location"
              placeholder="e.g. Kathmandu, Nepal"
              value={form.location}
              onChangeText={updateField('location')}
            />
            <Input
              label="Website (optional)"
              placeholder="https://example.com"
              value={form.website}
              onChangeText={updateField('website')}
              autoCapitalize="none"
            />
            <Input
              label="Facebook URL (optional)"
              placeholder="https://facebook.com/yourorg"
              value={form.facebookUrl}
              onChangeText={updateField('facebookUrl')}
              autoCapitalize="none"
            />
            <Input
              label="Facebook Username (optional)"
              placeholder="yourorg"
              value={form.facebookUsername}
              onChangeText={updateField('facebookUsername')}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button label="Register Organization" onPress={handleRegister} loading={loading} />

            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
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
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
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
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
  },
  modalDone: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});