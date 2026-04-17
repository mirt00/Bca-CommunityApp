import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';

/**
 * Input — reusable text input with label, error state, and password toggle.
 *
 * @param {object} props
 * @param {string} [props.label] - Field label shown above the input
 * @param {string} [props.error] - Error message shown below the input
 * @param {boolean} [props.secureTextEntry=false] - Enables password mode with toggle
 * @param {string} [props.className] - Additional NativeWind classes for the container
 * @param {object} rest - All other TextInput props (value, onChangeText, placeholder, etc.)
 */
export default function Input({
  label,
  error,
  secureTextEntry = false,
  className = '',
  ...rest
}) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}

      <View className="relative">
        <TextInput
          className={`
            border rounded-xl px-4 py-3 text-base text-gray-900 bg-white
            ${error ? 'border-error' : 'border-gray-300'}
            ${secureTextEntry ? 'pr-12' : ''}
          `}
          secureTextEntry={isSecure}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure((prev) => !prev)}
            className="absolute right-3 top-3"
          >
            {/* TODO: replace with eye icon from @expo/vector-icons */}
            <Text className="text-primary-600 text-sm">{isSecure ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-error text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
