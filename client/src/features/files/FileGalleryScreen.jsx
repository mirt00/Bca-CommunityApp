import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

import FilePreview from '../../components/shared/FilePreview';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getGroupFiles } from '../../api/endpoints/file';
import { useChatStore } from '../../store/chatStore';

const TABS = [
  { key: 'doc', label: 'Docs' },
  { key: 'media', label: 'Media' },
  { key: 'resource', label: 'Resources' },
];

/**
 * FileGalleryScreen — tabbed file browser for a group's asset repository.
 * Tabs: Docs · Media · Resources
 */
export default function FileGalleryScreen() {
  const { activeGroup } = useChatStore();
  const [activeTab, setActiveTab] = useState('doc');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeGroup) return;
    fetchFiles(activeTab);
  }, [activeGroup, activeTab]);

  async function fetchFiles(fileType) {
    setLoading(true);
    setError('');
    try {
      const { data } = await getGroupFiles(activeGroup._id, fileType);
      setFiles(data.files);
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  }

  if (!activeGroup) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="text-gray-400">Select a group to browse files</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">{activeGroup.name} — Files</Text>
      </View>

      {/* Tab bar */}
      <View className="flex-row bg-white border-b border-gray-200">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === tab.key ? 'border-primary-600' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab.key ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* File list */}
      {loading ? (
        <LoadingSpinner message="Loading files..." />
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-error">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={({ item }) => (
            <FilePreview
              fileUrl={item.fileUrl}
              fileType={item.fileType}
              fileName={item.content}
              uploadedBy={item.senderId?.fullName}
              uploadedAt={item.createdAt}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-8">No files in this category yet</Text>
          }
        />
      )}
    </View>
  );
}
