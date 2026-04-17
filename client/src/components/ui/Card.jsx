import React from 'react';
import { View } from 'react-native';

/**
 * Card — surface container with shadow and rounded corners.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className] - Additional NativeWind classes
 */
export default function Card({ children, className = '' }) {
  return (
    <View
      className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}
    >
      {children}
    </View>
  );
}
