import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';

/**
 * FilePreview — renders a preview card for a file attachment.
 * Handles three categories: doc, media, resource.
 *
 * @param {object} props
 * @param {string} props.fileUrl - Cloudinary URL of the file
 * @param {'doc' | 'media' | 'resource'} props.fileType
 * @param {string} [props.fileName] - Display name for the file
 * @param {string} [props.uploadedBy] - Uploader's display name
 * @param {string} [props.uploadedAt] - ISO date string
 */
export default function FilePreview({ fileUrl, fileType, fileName, uploadedBy, uploadedAt }) {
  const iconMap = {
    doc: '📄',
    media: '🎬',
    resource: '📦',
  };

  const labelMap = {
    doc: 'Document',
    media: 'Media',
    resource: 'Resource',
  };

  const handleOpen = async () => {
    // TODO: for media files, open in-app video player
    // For docs and resources, open in browser or download
    const supported = await Linking.canOpenURL(fileUrl);
    if (supported) {
      await Linking.openURL(fileUrl);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleOpen}
      className="flex-row items-center bg-white border border-gray-200 rounded-xl p-3 mb-2"
      activeOpacity={0.7}
    >
      {/* Icon / Thumbnail */}
      {fileType === 'media' ? (
        <Image
          source={{ uri: fileUrl }}
          className="w-14 h-14 rounded-lg bg-gray-200"
          resizeMode="cover"
        />
      ) : (
        <View className="w-14 h-14 rounded-lg bg-gray-100 items-center justify-center">
          <Text className="text-2xl">{iconMap[fileType] ?? '📎'}</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1 ml-3">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
          {fileName || 'Untitled file'}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">{labelMap[fileType] ?? 'File'}</Text>
        {uploadedBy && (
          <Text className="text-xs text-gray-400 mt-0.5">by {uploadedBy}</Text>
        )}
      </View>

      {/* Open arrow */}
      <Text className="text-gray-400 ml-2">›</Text>
    </TouchableOpacity>
  );
}
