import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Input({
  label,
  error,
  secureTextEntry = false,
  style,
  ...rest
}) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : styles.inputNormal,
            secureTextEntry && styles.inputSecure,
          ]}
          secureTextEntry={isSecure}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure((prev) => !prev)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>{isSecure ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  inputNormal: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  inputSecure: {
    paddingRight: 48,
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  toggleText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});