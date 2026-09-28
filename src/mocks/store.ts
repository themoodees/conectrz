import { mockConversations, type MockConversation } from "./conversations";

/*
 * In-memory state for MOCK MODE only, so saving creators and sending messages
 * work while designing. It lives in the dev server's memory and resets when
 * the server restarts.
 */

interface MockStore {
  savedCreatorIds: string[];
  conversations: MockConversation[];
}

// Kept on globalThis so it survives hot reloads in development.
const globalForMock = globalThis as unknown as { __conectrzMockStore?: MockStore };

export const mockStore: MockStore = (globalForMock.__conectrzMockStore ??= {
  savedCreatorIds: ["cr-002", "cr-007"],
  conversations: structuredClone(mockConversations),
});
