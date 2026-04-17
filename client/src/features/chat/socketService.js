import { io } from 'socket.io-client';

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * connect — initialize the Socket.io connection with the PASETO token.
 * The server verifies the token on the handshake.
 *
 * @param {string} token - PASETO token from Expo Secure Store
 * @returns {Socket} The socket instance
 */
export function connect(token) {
  if (socket?.connected) return socket;

  socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
}

/**
 * joinGroup — subscribe to a group's message room.
 * @param {string} groupId
 */
export function joinGroup(groupId) {
  if (!socket) throw new Error('Socket not connected. Call connect() first.');
  socket.emit('join_group', groupId);
}

/**
 * leaveGroup — unsubscribe from a group's message room.
 * @param {string} groupId
 */
export function leaveGroup(groupId) {
  if (!socket) return;
  socket.emit('leave_group', groupId);
}

/**
 * sendMessage — emit a message to the group room.
 * @param {{ groupId: string, content: string, senderId: string, fileUrl?: string, fileType?: string }} payload
 */
export function sendMessage(payload) {
  if (!socket) throw new Error('Socket not connected. Call connect() first.');
  socket.emit('send_message', payload);
}

/**
 * onMessage — register a listener for incoming messages.
 * @param {function} callback - Called with the message payload
 * @returns {function} Cleanup function to remove the listener
 */
export function onMessage(callback) {
  if (!socket) return () => {};
  socket.on('receive_message', callback);
  return () => socket.off('receive_message', callback);
}

/**
 * disconnect — cleanly close the socket connection.
 */
export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
