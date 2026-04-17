/**
 * agoraService — Agora RTC integration for group video calls.
 *
 * TODO: install agora-react-native-rtc
 *   npx expo install agora-react-native-rtc
 *   (requires Expo dev client or bare workflow — not compatible with Expo Go)
 */

// TODO: uncomment once agora-react-native-rtc is installed
// import RtcEngine, { ChannelProfile, ClientRole } from 'agora-react-native-rtc';

let engine = null;

/**
 * initAgora — create and configure the Agora RTC engine.
 * Must be called once before joining any channel.
 *
 * @param {string} appId - Agora App ID from environment / server
 * @returns {Promise<object>} The initialized engine instance
 */
export async function initAgora(appId) {
  // TODO: implement with agora-react-native-rtc
  // engine = await RtcEngine.create(appId);
  // await engine.setChannelProfile(ChannelProfile.Communication);
  // await engine.setClientRole(ClientRole.Broadcaster);
  // return engine;

  console.warn('[agoraService] initAgora not yet implemented');
  return null;
}

/**
 * joinChannel — join a video call channel.
 * Channel name is derived from the group ID to scope calls to groups.
 *
 * @param {string} channelName - The group ID used as the channel name
 * @param {string} token - Short-lived Agora RTC token from the server
 * @param {number} uid - User ID (0 = auto-assign)
 */
export async function joinChannel(channelName, token, uid = 0) {
  // TODO: implement with agora-react-native-rtc
  // if (!engine) throw new Error('Agora engine not initialized. Call initAgora() first.');
  // await engine.joinChannel(token, channelName, null, uid);

  console.warn('[agoraService] joinChannel not yet implemented');
}

/**
 * leaveChannel — leave the current video call channel.
 */
export async function leaveChannel() {
  // TODO: implement with agora-react-native-rtc
  // if (!engine) return;
  // await engine.leaveChannel();

  console.warn('[agoraService] leaveChannel not yet implemented');
}

/**
 * destroyEngine — release Agora resources.
 * Call this when the video screen unmounts.
 */
export async function destroyEngine() {
  // TODO: implement with agora-react-native-rtc
  // if (engine) {
  //   await RtcEngine.destroy();
  //   engine = null;
  // }

  console.warn('[agoraService] destroyEngine not yet implemented');
}
