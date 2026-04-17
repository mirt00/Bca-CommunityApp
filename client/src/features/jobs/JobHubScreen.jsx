import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';

import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getJobs } from '../../api/endpoints/job';
import { useChatStore } from '../../store/chatStore';

const TAG_FILTERS = [
  'All',
  'frontend',
  'backend',
  'fullstack',
  'mobile',
  'devops',
  'design',
  'internship',
  'remote',
  'part-time',
  'full-time',
];

/**
 * JobHubScreen — browse job opportunities posted by organizations.
 * Filter by tag (frontend, internship, remote, etc.).
 */
export default function JobHubScreen() {
  const { activeGroup } = useChatStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    fetchJobs();
  }, [selectedTag, activeGroup]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = {};
      if (selectedTag !== 'All') params.tag = selectedTag;
      if (activeGroup) params.groupId = activeGroup._id;

      const { data } = await getJobs(params);
      setJobs(data.jobs);
    } catch (err) {
      console.warn('[JobHubScreen] Failed to fetch jobs:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenJob(link) {
    Linking.canOpenURL(link).then((supported) => {
      if (supported) Linking.openURL(link);
    });
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">Job Hub</Text>
      </View>

      {/* Tag filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-gray-200 px-4 py-2"
      >
        {TAG_FILTERS.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => setSelectedTag(tag)}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedTag === tag ? 'bg-primary-600' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedTag === tag ? 'text-white' : 'text-gray-700'
              }`}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Job list */}
      {loading ? (
        <LoadingSpinner message="Loading jobs..." />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={({ item }) => (
            <Card className="mb-3 mx-4 mt-3">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-600 mb-2">{item.company}</Text>
              <View className="flex-row flex-wrap mb-3">
                {item.tags.map((tag) => (
                  <View
                    key={tag}
                    className="bg-primary-50 px-2 py-1 rounded-md mr-2 mb-1"
                  >
                    <Text className="text-xs text-primary-700">{tag}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={() => handleOpenJob(item.link)}>
                <Text className="text-primary-600 text-sm font-medium">View Job →</Text>
              </TouchableOpacity>
            </Card>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-8">
              No jobs found for this filter
            </Text>
          }
        />
      )}
    </View>
  );
}
