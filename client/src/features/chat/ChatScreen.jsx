import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import MessageBubble from './MessageBubble';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { getGroupMessages } from '../../api/endpoints/group';
import { connect, joinGroup, sendMessage, onMessage, disconnect } from './socketService';
import { getToken } from '../../utils/tokenHelper';

/**
 * ChatScreen — real-time group chat.
 * Loads message history on mount, then listens for live messages via Socket.io.
 */
export default function ChatScreen() {
  const { activeGroup, messages, setMessages, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!activeGroup) return;

    let cleanup = () => {};

    async function setup() {
      // Load history
      try {
        const { data } = await getGroupMessages(activeGroup._id);
        setMessages(data.messages);
      } catch (err) {
        console.warn('[ChatScreen] Failed to load messages:', err.message);
      } finally {
        setLoading(false);
      }

      // Connect socket and join room
      const token = await getToken();
      connect(token);
      joinGroup(activeGroup._id);

      // Listen for new messages
      cleanup = onMessage((msg) => addMessage(msg));
    }

    setup();

    return () => {
      cleanup();
      // TODO: call leaveGroup(activeGroup._id) on unmount
    };
  }, [activeGroup]);

  function handleSend() {
    const text = inputText.trim();
    if (!text || !activeGroup || !user) return;

    sendMessage({
      groupId: activeGroup._id,
      content: text,
      senderId: user._id,
    });

    setInputText('');
  }

  if (!activeGroup) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="text-gray-400">Select a group to start chatting</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">{activeGroup.name}</Text>
      </View>

      {/* Messages */}
      {loading ? (
        <LoadingSpinner message="Loading messages..." />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.senderId?._id === user?._id || item.senderId === user?._id}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input bar */}
      <View className="flex-row items-center bg-white border-t border-gray-200 px-4 py-2">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base text-gray-900 mr-2"
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={5000}
        />
        <TouchableOpacity
          onPress={handleSend}
          className="bg-primary-600 rounded-full w-10 h-10 items-center justify-center"
          disabled={!inputText.trim()}
        >
          {/* TODO: replace with send icon */}
          <Text className="text-white font-bold">→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
