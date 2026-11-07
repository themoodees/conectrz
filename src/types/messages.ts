/** Which side of a conversation the signed-in user is on. */
export type Viewer = "company" | "creator";

/** The other participant, as shown in lists and headers. */
export interface Counterpart {
  id: string;
  name: string;
  photoUrl: string | null;
  /** Link to their profile, when one exists (creator profiles only). */
  profileHref: string | null;
}

export interface MessageAttachment {
  id: string;
  kind: "image" | "video";
  name: string;
  /** Short-lived signed link; null when not loaded (e.g. inbox previews). */
  url: string | null;
}

export interface Message {
  id: string;
  content: string;
  attachments: MessageAttachment[];
  createdAt: string;
  /** Sent by the signed-in user. */
  isMine: boolean;
  readAt: string | null;
  /** The text in the reader's language, for the other person's messages (when it differs). */
  translation?: { content: string; sourceLanguage: string } | null;
}

export interface ConversationSummary {
  id: string;
  counterpart: Counterpart;
  lastMessage: Message | null;
  /** The latest message is from the other side and hasn't been read. */
  hasUnread: boolean;
}

export interface ConversationThread {
  id: string;
  counterpart: Counterpart;
  messages: Message[];
  /** Archived by the signed-in user. */
  isArchived: boolean;
}
