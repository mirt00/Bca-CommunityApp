import React from 'react';
import { View, Image, Text } from 'react-native';

/**
 * Avatar — displays a user's profile picture or a fallback with their initials.
 *
 * @param {object} props
 * @param {string} [props.uri] - Cloudinary URL of the profile picture
 * @param {string} [props.name] - User's full name (used for initials fallback)
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md']
 * @param {string} [props.className] - Additional NativeWind classes
 */
export default function Avatar({ uri, name = '', size = 'md', className = '' }) {
  const sizeMap = {
    sm: { container: 'w-8 h-8', text: 'text-xs' },
    md: { container: 'w-12 h-12', text: 'text-sm' },
    lg: { container: 'w-16 h-16', text: 'text-base' },
    xl: { container: 'w-24 h-24', text: 'text-xl' },
  };

  const { container, text } = sizeMap[size] || sizeMap.md;

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${container} rounded-full bg-gray-200 ${className}`}
        accessibilityLabel={`${name}'s profile picture`}
      />
    );
  }

  return (
    <View
      className={`${container} rounded-full bg-primary-500 items-center justify-center ${className}`}
    >
      <Text className={`${text} text-white font-semibold`}>{initials || '?'}</Text>
    </View>
  );
}
