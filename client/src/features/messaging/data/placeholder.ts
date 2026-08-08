// Stage 1 placeholder fixtures — static, isolated, and used only as default
// prop values to render the Messaging UI states before a backend exists. They
// are NOT coupled to component logic, do not simulate API behavior, and do not
// persist anything. Remove this file entirely during Stage 3 integration.
import type { Conversation, Message, MessageUser } from "../types/messaging"

export const PLACEHOLDER_CURRENT_USER: MessageUser = {
  id: 1,
  first_name: "Alex",
  middle_name: null,
  last_name: "Rivera",
  suffix: null,
  username: "alexrivera",
  profile: {
    avatar_url: null,
    headline: "Full-stack developer & guitarist",
  },
}

const mayaChen: MessageUser = {
  id: 2,
  first_name: "Maya",
  middle_name: null,
  last_name: "Chen",
  suffix: null,
  username: "mayachen",
  profile: {
    avatar_url: null,
    headline: "Yoga instructor & aspiring developer",
  },
}

const diegoSantos: MessageUser = {
  id: 3,
  first_name: "Diego",
  middle_name: null,
  last_name: "Santos",
  suffix: null,
  username: "diegosantos",
  profile: {
    avatar_url: null,
    headline: "Photographer based in Manila",
  },
}

const sarahKim: MessageUser = {
  id: 4,
  first_name: "Sarah",
  middle_name: null,
  last_name: "Kim",
  suffix: null,
  username: "sarahkim",
  profile: {
    avatar_url: null,
    headline: "Language enthusiast & baker",
  },
}

const priyaPatel: MessageUser = {
  id: 5,
  first_name: "Priya",
  middle_name: null,
  last_name: "Patel",
  suffix: null,
  username: "priyapatel",
  profile: {
    avatar_url: null,
    headline: "Painter learning to code",
  },
}

export const PLACEHOLDER_CONVERSATIONS: Conversation[] = [
  {
    id: 101,
    exchange_request_id: 1001,
    other_user: mayaChen,
    last_message: {
      id: 504,
      conversation_id: 101,
      sender_id: 2,
      sender: mayaChen,
      body: "Just let me know what time suits you best.",
      read_at: null,
      created_at: "2026-08-02T09:07:00.000000Z",
    },
    unread_count: 2,
    updated_at: "2026-08-02T09:07:00.000000Z",
  },
  {
    id: 104,
    exchange_request_id: 1004,
    other_user: priyaPatel,
    last_message: {
      id: 703,
      conversation_id: 104,
      sender_id: 5,
      sender: priyaPatel,
      body: "That sounds wonderful. I'll gather some beginner exercises.",
      read_at: null,
      created_at: "2026-07-30T18:42:00.000000Z",
    },
    unread_count: 1,
    updated_at: "2026-07-30T18:42:00.000000Z",
  },
  {
    id: 102,
    exchange_request_id: 1002,
    other_user: diegoSantos,
    last_message: {
      id: 603,
      conversation_id: 102,
      sender_id: 3,
      sender: diegoSantos,
      body: "Sounds good, thanks!",
      read_at: "2026-07-30T14:36:00.000000Z",
      created_at: "2026-07-30T14:35:00.000000Z",
    },
    unread_count: 0,
    updated_at: "2026-07-30T14:35:00.000000Z",
  },
  {
    id: 103,
    exchange_request_id: 1003,
    other_user: sarahKim,
    last_message: null,
    unread_count: 0,
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
]

export const PLACEHOLDER_MESSAGES_BY_CONVERSATION: Record<number, Message[]> = {
  101: [
    {
      id: 501,
      conversation_id: 101,
      sender_id: 1,
      sender: PLACEHOLDER_CURRENT_USER,
      body: "Hey Maya! Thanks for accepting the exchange. When works for a first yoga session?",
      read_at: "2026-08-02T09:01:00.000000Z",
      created_at: "2026-08-02T09:00:00.000000Z",
    },
    {
      id: 502,
      conversation_id: 101,
      sender_id: 2,
      sender: mayaChen,
      body: "Of course! I'm free Thursday evening if that works for you.",
      read_at: "2026-08-02T09:06:00.000000Z",
      created_at: "2026-08-02T09:05:00.000000Z",
    },
    {
      id: 503,
      conversation_id: 101,
      sender_id: 2,
      sender: mayaChen,
      body: "Also happy to answer any Laravel questions before then!",
      read_at: null,
      created_at: "2026-08-02T09:06:30.000000Z",
    },
    {
      id: 504,
      conversation_id: 101,
      sender_id: 2,
      sender: mayaChen,
      body: "Just let me know what time suits you best.",
      read_at: null,
      created_at: "2026-08-02T09:07:00.000000Z",
    },
  ],
  102: [
    {
      id: 601,
      conversation_id: 102,
      sender_id: 3,
      sender: diegoSantos,
      body: "Great swap — street photography for some backend help.",
      read_at: "2026-07-30T14:31:00.000000Z",
      created_at: "2026-07-30T14:00:00.000000Z",
    },
    {
      id: 602,
      conversation_id: 102,
      sender_id: 1,
      sender: PLACEHOLDER_CURRENT_USER,
      body: "Perfect. I'll send over a few Laravel tips this weekend.",
      read_at: "2026-07-30T14:30:00.000000Z",
      created_at: "2026-07-30T14:30:00.000000Z",
    },
    {
      id: 603,
      conversation_id: 102,
      sender_id: 3,
      sender: diegoSantos,
      body: "Sounds good, thanks!",
      read_at: "2026-07-30T14:36:00.000000Z",
      created_at: "2026-07-30T14:35:00.000000Z",
    },
  ],
  103: [],
  104: [
    {
      id: 701,
      conversation_id: 104,
      sender_id: 5,
      sender: priyaPatel,
      body: "Hi Alex! Excited to start our watercolor-and-code exchange.",
      read_at: "2026-07-30T18:11:00.000000Z",
      created_at: "2026-07-30T18:00:00.000000Z",
    },
    {
      id: 702,
      conversation_id: 104,
      sender_id: 1,
      sender: PLACEHOLDER_CURRENT_USER,
      body: "Me too! I'll set up a short intro video call this week.",
      read_at: "2026-07-30T18:10:00.000000Z",
      created_at: "2026-07-30T18:10:00.000000Z",
    },
    {
      id: 703,
      conversation_id: 104,
      sender_id: 5,
      sender: priyaPatel,
      body: "That sounds wonderful. I'll gather some beginner exercises.",
      read_at: null,
      created_at: "2026-07-30T18:42:00.000000Z",
    },
  ],
}
