import { create } from 'zustand';

/**
 * chatStore — global chat state.
 *
 * State:
 *   activeGroup  - The currently selected group object (or null)
 *   messages     - Array of message objects for the active group
 *
 * Actions:
 *   setActiveGroup(group)    - Switch to a different group and clear messages
 *   setMessages(messages)    - Replace the messages array (initial load)
 *   addMessage(message)      - Append a new incoming message
 *   clearChat()              - Reset chat state on logout or group leave
 */
export const useChatStore = create((set) => ({
  activeGroup: null,
  messages: [],

  setActiveGroup: (group) =>
    set({ activeGroup: group, messages: [] }),

  setMessages: (messages) =>
    set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearChat: () =>
    set({ activeGroup: null, messages: [] }),
}));
