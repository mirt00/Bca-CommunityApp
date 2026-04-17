import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

/**
 * Button — primary reusable button component.
 *
 * @param {object} props
 * @param {string} props.label - Button text
 * @param {function} props.onPress - Press handler
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} [props.variant='primary']
 * @param {boolean} [props.loading=false] - Show spinner instead of label
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className] - Additional NativeWind classes
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}) {
  const baseClasses = 'rounded-xl px-6 py-3 items-center justify-center flex-row';

  const variantClasses = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-500 active:bg-secondary-600',
    danger: 'bg-error active:opacity-80',
    ghost: 'bg-transparent border border-primary-600',
  };

  const textClasses = {
    primary: 'text-white font-semibold text-base',
    secondary: 'text-white font-semibold text-base',
    danger: 'text-white font-semibold text-base',
    ghost: 'text-primary-600 font-semibold text-base',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#2563eb' : '#ffffff'} size="small" />
      ) : (
        <Text className={textClasses[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
