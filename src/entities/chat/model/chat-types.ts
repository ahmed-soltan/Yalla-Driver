// src/entities/chat/model/chat-types.ts
// Mirrors BACKEND_API_CONTRACT section 9.
export type ChatSenderType = 'PASSENGER' | 'CAPTAIN';
export type ChatMessageStatus = 'sent' | 'delivered' | 'read';

export type ChatMessage = {
  id: string;
  senderType: ChatSenderType;
  senderId: string;
  text: string;
  createdAt: string; // ISO
  status: ChatMessageStatus;
  // Client-only, never sent by the server:
  clientId?: string;
  pending?: boolean;
  failed?: boolean;
};

export type ChatHistory = {
  items: ChatMessage[];
  chatOpen: boolean;
};
