import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

import Button from '../../components/ui/Button';
import { uploadFile } from '../../api/endpoints/file';
import { useChatStore } from '../../store/chatStore';

// TODO: install expo-document-picker — `npx expo install expo-document-picker`
// import * as DocumentPicker from 'expo-document-picker';

/**
 * FileUploader — allows users to pick and upload a file to the active group.
 * The server's Smart File Sorter automatically categorizes the file.
 *
 * @param {object} props
 * @param {function} [props.onUploadSuccess] - Called after a successful upload
 */
export default function FileUploader({ onUploadSuccess }) {
  const { activeGroup } = useChatStore();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  async function handlePickFile() {
    // TODO: uncomment once expo-document-picker is installed
    // try {
    //   const result = await DocumentPicker.getDocumentAsync({
    //     type: '*/*',
    //     copyToCacheDirectory: true,
    //   });
    //   if (!result.canceled && result.assets?.length > 0) {
    //     setSelectedFile(result.assets[0]);
    //   }
    // } catch (err) {
    //   Alert.alert('Error', 'Failed to pick file');
    // }
    Alert.alert('TODO', 'Install expo-document-picker to enable file picking');
  }

  async function handleUpload() {
    if (!selectedFile || !activeGroup) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('groupId', activeGroup._id);
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      });

      await uploadFile(formData);
      setSelectedFile(null);
      onUploadSuccess?.();
    } catch (err) {
      const message = err.response?.data?.error || 'Upload failed';
      Alert.alert('Upload Error', message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View className="p-4 bg-white border-t border-gray-200">
      <TouchableOpacity
        onPress={handlePickFile}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center mb-4"
      >
        <Text className="text-2xl mb-2">📎</Text>
        <Text className="text-gray-500 text-sm">
          {selectedFile ? selectedFile.name : 'Tap to select a file'}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">PDF, DOCX, MP4, ZIP and more</Text>
      </TouchableOpacity>

      {selectedFile && (
        <Button
          label="Upload File"
          onPress={handleUpload}
          loading={uploading}
        />
      )}
    </View>
  );
}
