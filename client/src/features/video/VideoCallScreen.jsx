import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { initAgora, joinChannel, leaveChannel, destroyEngine } from './agoraService';
import { getAgoraToken } from '../../api/endpoints/group';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

/**
 * VideoCallScreen — Agora-powered group video call.
 * Channel name is derived from the active group ID.
 *
 * TODO: render remote video streams using RtcLocalView and RtcRemoteView
 *       once agora-react-native-rtc is installed.
 */
export default function VideoCallScreen() {
  const { activeGroup } = useChatStore();
  const { user } = useAuthStore();
  const [inCall, setInCall] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up Agora engine on unmount
      destroyEngine();
    };
  }, []);

  async function handleJoinCall() {
    if (!activeGroup) {
      Alert.alert('No group selected', 'Please select a group before joining a call.');
      return;
    }

    setLoading(true);
    try {
      // Fetch a short-lived Agora token from the server
      const { data } = await getAgoraToken(activeGroup._id, user?._id);

      // Initialize Agora engine with the App ID
      // TODO: pass AGORA_APP_ID from server response or env
      await initAgora(data.appId);
      await joinChannel(data.channelName, data.token, data.uid);

      setInCall(true);
    } catch (err) {
      Alert.alert('Call Error', err.response?.data?.error || 'Failed to join call');
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaveCall() {
    await leaveChannel();
    setInCall(false);
  }

  if (!activeGroup) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white text-base">Select a group to start a video call</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Video area */}
      <View className="flex-1 items-center justify-center">
        {inCall ? (
          <>
            {/* TODO: render RtcLocalView.SurfaceView and RtcRemoteView.SurfaceView here */}
            <Text className="text-white text-lg">In call: {activeGroup.name}</Text>
            <Text className="text-gray-400 text-sm mt-2">
              Video streams will appear here once Agora SDK is integrated
            </Text>
          </>
        ) : (
          <>
            <Text className="text-white text-xl font-semibold mb-2">{activeGroup.name}</Text>
            <Text className="text-gray-400 text-sm mb-8">Group video call</Text>
            {loading ? (
              <LoadingSpinner color="#ffffff" />
            ) : (
              <Button label="Join Call" onPress={handleJoinCall} />
            )}
          </>
        )}
      </View>

      {/* Controls bar */}
      {inCall && (
        <View className="flex-row justify-center items-center pb-10 pt-4 bg-gray-800">
          {/* TODO: add mute, camera toggle buttons */}
          <TouchableOpacity
            onPress={handleLeaveCall}
            className="bg-error rounded-full w-16 h-16 items-center justify-center"
          >
            <Text className="text-white text-2xl">✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
