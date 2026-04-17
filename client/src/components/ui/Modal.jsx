import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

/**
 * Modal — accessible overlay dialog.
 *
 * @param {object} props
 * @param {boolean} props.visible - Controls visibility
 * @param {function} props.onClose - Called when backdrop or close button is pressed
 * @param {string} [props.title] - Optional modal title
 * @param {React.ReactNode} props.children - Modal body content
 */
export default function Modal({ visible, onClose, title, children }) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessible
      accessibilityViewIsModal
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          {/* Modal card — stop propagation so tapping inside doesn't close */}
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                {title && (
                  <Text className="text-lg font-semibold text-gray-900">{title}</Text>
                )}
                <TouchableOpacity onPress={onClose} accessibilityLabel="Close modal">
                  {/* TODO: replace with X icon */}
                  <Text className="text-gray-500 text-lg">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Body */}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}
