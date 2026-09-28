/** A creator as shown in conversation lists and headers. */
export interface ConversationCreator {
  id: string;
  displayName: string;
  photoUrl: string | null;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  /** Sent by the signed-in company. */
  isMine: boolean;
  readAt: string | null;
}

export interface ConversationSummary {
  id: string;
  creator: ConversationCreator;
  lastMessage: Message | null;
  /** The latest message is from the creator and hasn't been read. */
  hasUnread: boolean;
}

export interface ConversationThread {
  id: string;
  creator: ConversationCreator;
  messages: Message[];
}
