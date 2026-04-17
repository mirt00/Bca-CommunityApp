import React from 'react';
import { View, Text } from 'react-native';

import Avatar from '../../components/shared/Avatar';
import FilePreview from '../../components/shared/FilePreview';
import { formatTimestamp } from '../../utils/dateFormatter';

/**
 * MessageBubble — renders a single chat message.
 *
 * @param {object} props
 * @param {object} props.message - Message object from the server
 * @param {boolean} props.isOwn - True if the message was sent by the current user
 */
export default function MessageBubble({ message, isOwn }) {
  const { content, fileUrl, fileType, senderId, createdAt } = message;
  const senderName = senderId?.fullName || senderId?.nickname || 'Unknown';
  const avatarUri = senderId?.profilePicture;

  return (
    <View
      className={`flex-row items-end mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar — only shown for other users */}
      {!isOwn && (
        <Avatar uri={avatarUri} name={senderName} size="sm" className="mr-2" />
      )}

      <View className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name — only for others */}
        {!isOwn && (
          <Text className="text-xs text-gray-500 mb-1 ml-1">{senderName}</Text>
        )}

        {/* File attachment */}
        {fileUrl && (
          <FilePreview
            fileUrl={fileUrl}
            fileType={fileType}
            fileName={content}
          />
        )}

        {/* Text content */}
        {!fileUrl && (
          <View
            className={`rounded-2xl px-4 py-2 ${
              isOwn ? 'bg-primary-600 rounded-br-sm' : 'bg-white border border-gray-200 rounded-bl-sm'
            }`}
          >
            <Text className={`text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}>
              {content}
            </Text>
          </View>
        )}

        {/* Timestamp */}
        <Text className="text-xs text-gray-400 mt-1 mx-1">
          {formatTimestamp(createdAt)}
        </Text>
      </View>
    </View>
  );
}
