import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getGroups } from '../../api/endpoints/group';
import { useChatStore } from '../../store/chatStore';

/**
 * HomeScreen — displays a list of available groups.
 * Tapping a group sets it as the active group for chat, files, and video.
 */
export default function HomeScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setActiveGroup } = useChatStore();

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      const { data } = await getGroups();
      setGroups(data.groups);
    } catch (err) {
      console.warn('[HomeScreen] Failed to fetch groups:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectGroup(group) {
    setActiveGroup(group);
    navigation.navigate('Chat');
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">Groups</Text>
      </View>

      {/* Group list */}
      {loading ? (
        <LoadingSpinner message="Loading groups..." />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectGroup(item)}>
              <Card className="mb-3 mx-4 mt-3">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {item.name}
                </Text>
                {item.description && (
                  <Text className="text-sm text-gray-600">{item.description}</Text>
                )}
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-8">
              No groups available yet
            </Text>
          }
        />
      )}
    </View>
  );
}
