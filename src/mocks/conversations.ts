/*
 * MOCK DATA — conversations between the mock company (co-001) and creators.
 * `fromCompany` marks messages sent by the company.
 */

export interface MockMessage {
  id: string;
  content: string;
  createdAt: string;
  fromCompany: boolean;
  readAt: string | null;
}

export interface MockConversation {
  id: string;
  creatorId: string;
  messages: MockMessage[];
}

export const mockConversations: MockConversation[] = [
  {
    id: "cv-001",
    creatorId: "cr-001",
    messages: [
      {
        id: "m-001",
        fromCompany: true,
        createdAt: "2026-09-24T02:10:00Z",
        readAt: "2026-09-24T04:00:00Z",
        content:
          "Hi Yui! We're launching a new gentle toner in November and love your skincare content. Would you be open to an Instagram post and Reel?",
      },
      {
        id: "m-002",
        fromCompany: false,
        createdAt: "2026-09-24T04:02:00Z",
        readAt: "2026-09-24T05:00:00Z",
        content:
          "Thank you for reaching out! I'd love to hear more. Could you share the timeline and whether you need usage rights for ads?",
      },
      {
        id: "m-003",
        fromCompany: true,
        createdAt: "2026-09-25T01:30:00Z",
        readAt: "2026-09-25T03:00:00Z",
        content:
          "Of course — content would go live mid-November. We'd like 3 months of paid usage on Instagram. I'll send the brief shortly.",
      },
      {
        id: "m-004",
        fromCompany: false,
        createdAt: "2026-09-27T09:15:00Z",
        readAt: null,
        content: "Sounds great. I've looked at the brief — I have a couple of questions about the Reel format.",
      },
    ],
  },
  {
    id: "cv-002",
    creatorId: "cr-005",
    messages: [
      {
        id: "m-005",
        fromCompany: true,
        createdAt: "2026-09-20T06:00:00Z",
        readAt: "2026-09-20T08:00:00Z",
        content:
          "Hello Sofia, we're looking for Spanish voiceover for three short product videos. Is that something you offer?",
      },
      {
        id: "m-006",
        fromCompany: false,
        createdAt: "2026-09-20T08:12:00Z",
        readAt: "2026-09-20T09:00:00Z",
        content: "Yes! I can deliver within a week. Scripts in Japanese or English both work for me.",
      },
    ],
  },
  {
    id: "cv-003",
    creatorId: "cr-003",
    messages: [
      {
        id: "m-007",
        fromCompany: true,
        createdAt: "2026-09-12T03:00:00Z",
        readAt: null,
        content: "Hi Haruka, could you create two UGC videos for our cleansing balm?",
      },
    ],
  },
];
