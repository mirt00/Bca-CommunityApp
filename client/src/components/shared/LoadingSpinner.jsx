import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

/**
 * LoadingSpinner — centered loading indicator with optional message.
 *
 * @param {object} props
 * @param {string} [props.message] - Optional text shown below the spinner
 * @param {'small' | 'large'} [props.size='large']
 * @param {string} [props.color='#3b82f6']
 * @param {boolean} [props.fullScreen=false] - Fills the entire screen
 */
export default function LoadingSpinner({
  message,
  size = 'large',
  color = '#3b82f6',
  fullScreen = false,
}) {
  return (
    <View
      className={`items-center justify-center ${fullScreen ? 'flex-1 bg-white' : 'py-8'}`}
    >
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-3 text-gray-500 text-sm">{message}</Text>
      )}
    </View>
  );
}
