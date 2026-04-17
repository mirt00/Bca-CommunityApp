import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Avatar from '../../components/shared/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getProfile } from '../../api/endpoints/user';
import { useAuthStore } from '../../store/authStore';

/**
 * ProfileScreen — displays the authenticated user's profile.
 * Allows logout and navigation to edit profile (TODO).
 */
export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data } = await getProfile();
      setProfile(data.user);
    } catch (err) {
      console.warn('[ProfileScreen] Failed to fetch profile:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Navigation is handled by App.js re-rendering based on store state
        },
      },
    ]);
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="text-error">Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">Profile</Text>
      </View>

      {/* Profile card */}
      <View className="items-center py-8">
        <Avatar uri={profile.profilePicture} name={profile.fullName} size="xl" />
        <Text className="text-xl font-bold text-gray-900 mt-4">{profile.fullName}</Text>
        {profile.nickname && (
          <Text className="text-sm text-gray-500">@{profile.nickname}</Text>
        )}
        {profile.bio && (
          <Text className="text-sm text-gray-600 text-center mt-2 px-6">{profile.bio}</Text>
        )}
      </View>

      {/* Details */}
      <Card className="mx-4 mb-4">
        <Text className="text-xs text-gray-500 uppercase mb-2">Details</Text>
        <InfoRow label="Email" value={profile.email} />
        <InfoRow label="Batch" value={profile.batch} />
        <InfoRow label="Faculty" value={profile.faculty} />
        {profile.organizationName && (
          <InfoRow label="Organization" value={profile.organizationName} />
        )}
      </Card>

      {/* Links */}
      <Card className="mx-4 mb-4">
        <Text className="text-xs text-gray-500 uppercase mb-2">Links</Text>
        <InfoRow label="LinkedIn" value={profile.linkedin} link />
        <InfoRow label="GitHub" value={profile.github} link />
      </Card>

      {/* Actions */}
      <View className="px-4 pb-8">
        {/* TODO: add Edit Profile button that navigates to an edit screen */}
        <Button label="Logout" onPress={handleLogout} variant="danger" />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, link = false }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-sm text-gray-600">{label}</Text>
      {link ? (
        <TouchableOpacity onPress={() => Linking.openURL(value)}>
          <Text className="text-sm text-primary-600" numberOfLines={1}>
            {value}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-sm text-gray-900" numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
}
