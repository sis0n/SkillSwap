import type {
  ExchangeRequest,
  ExchangeRequestSkill,
  ExchangeRequestUser,
} from "../types/exchange-request"

export const PLACEHOLDER_CURRENT_USER_ID = 1

export const PLACEHOLDER_CURRENT_USER: ExchangeRequestUser = {
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

export const PLACEHOLDER_RECEIVER: ExchangeRequestUser = {
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

const mayaChen: ExchangeRequestUser = {
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

const diegoSantos: ExchangeRequestUser = {
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

const sarahKim: ExchangeRequestUser = {
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

const priyaPatel: ExchangeRequestUser = {
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

export const PLACEHOLDER_TEACHING_SKILLS: ExchangeRequestSkill[] = [
  {
    id: 1,
    skill_id: 5,
    skill: { id: 5, name: "Laravel", slug: "laravel" },
    type: "teaching",
    title: "Laravel Development",
    experience_level: "advanced",
  },
  {
    id: 2,
    skill_id: 8,
    skill: { id: 8, name: "Guitar", slug: "guitar" },
    type: "teaching",
    title: "Acoustic Guitar",
    experience_level: "intermediate",
  },
]

export const PLACEHOLDER_LEARNING_SKILLS: ExchangeRequestSkill[] = [
  {
    id: 11,
    skill_id: 12,
    skill: { id: 12, name: "Spanish", slug: "spanish" },
    type: "learning",
    title: "Conversational Spanish",
    experience_level: "beginner",
  },
  {
    id: 12,
    skill_id: 15,
    skill: { id: 15, name: "Photography", slug: "photography" },
    type: "learning",
    title: "Street Photography",
    experience_level: "beginner",
  },
]

export const PLACEHOLDER_EXCHANGE_REQUESTS: ExchangeRequest[] = [
  {
    id: 101,
    sender: mayaChen,
    receiver: PLACEHOLDER_CURRENT_USER,
    teaching_skill: {
      id: 21,
      skill_id: 20,
      skill: { id: 20, name: "Yoga", slug: "yoga" },
      type: "teaching",
      title: "Yoga for Beginners",
      experience_level: "intermediate",
    },
    learning_skill: {
      id: 1,
      skill_id: 5,
      skill: { id: 5, name: "Laravel", slug: "laravel" },
      type: "learning",
      title: "Laravel Development",
      experience_level: "beginner",
    },
    message: "Hi Alex! I'd love to trade yoga lessons for some Laravel guidance.",
    status: "pending",
    created_at: "2026-07-30T09:12:00.000000Z",
    updated_at: "2026-07-30T09:12:00.000000Z",
  },
  {
    id: 102,
    sender: diegoSantos,
    receiver: PLACEHOLDER_CURRENT_USER,
    teaching_skill: {
      id: 22,
      skill_id: 15,
      skill: { id: 15, name: "Photography", slug: "photography" },
      type: "teaching",
      title: "Street Photography",
      experience_level: "advanced",
    },
    learning_skill: null,
    message: "Hey, I can teach you photography — no need to teach me anything back.",
    status: "pending",
    created_at: "2026-07-29T16:45:00.000000Z",
    updated_at: "2026-07-29T16:45:00.000000Z",
  },
  {
    id: 103,
    sender: PLACEHOLDER_CURRENT_USER,
    receiver: sarahKim,
    teaching_skill: {
      id: 2,
      skill_id: 8,
      skill: { id: 8, name: "Guitar", slug: "guitar" },
      type: "teaching",
      title: "Acoustic Guitar",
      experience_level: "intermediate",
    },
    learning_skill: {
      id: 31,
      skill_id: 12,
      skill: { id: 12, name: "Spanish", slug: "spanish" },
      type: "learning",
      title: "Conversational Spanish",
      experience_level: "beginner",
    },
    message: "I can help you with guitar if you can teach me conversational Spanish!",
    status: "pending",
    created_at: "2026-07-29T11:30:00.000000Z",
    updated_at: "2026-07-29T11:30:00.000000Z",
  },
  {
    id: 104,
    sender: mayaChen,
    receiver: PLACEHOLDER_CURRENT_USER,
    teaching_skill: {
      id: 23,
      skill_id: 18,
      skill: { id: 18, name: "Cooking", slug: "cooking" },
      type: "teaching",
      title: "Vegan Cooking",
      experience_level: "intermediate",
    },
    learning_skill: {
      id: 1,
      skill_id: 5,
      skill: { id: 5, name: "Laravel", slug: "laravel" },
      type: "learning",
      title: "Laravel Development",
      experience_level: "beginner",
    },
    message: "Thanks for the first session — let's keep the exchange going!",
    status: "accepted",
    created_at: "2026-07-27T08:20:00.000000Z",
    updated_at: "2026-07-28T10:05:00.000000Z",
  },
  {
    id: 105,
    sender: PLACEHOLDER_CURRENT_USER,
    receiver: diegoSantos,
    teaching_skill: {
      id: 1,
      skill_id: 5,
      skill: { id: 5, name: "Laravel", slug: "laravel" },
      type: "teaching",
      title: "Laravel Development",
      experience_level: "advanced",
    },
    learning_skill: {
      id: 32,
      skill_id: 15,
      skill: { id: 15, name: "Photography", slug: "photography" },
      type: "learning",
      title: "Street Photography",
      experience_level: "beginner",
    },
    message: "Would you be open to a Laravel-for-photography swap?",
    status: "declined",
    created_at: "2026-07-26T14:02:00.000000Z",
    updated_at: "2026-07-26T18:40:00.000000Z",
  },
  {
    id: 106,
    sender: PLACEHOLDER_CURRENT_USER,
    receiver: sarahKim,
    teaching_skill: {
      id: 2,
      skill_id: 8,
      skill: { id: 8, name: "Guitar", slug: "guitar" },
      type: "teaching",
      title: "Acoustic Guitar",
      experience_level: "intermediate",
    },
    learning_skill: null,
    message: "No strings attached — I just want to share what I know about the guitar.",
    status: "cancelled",
    created_at: "2026-07-25T09:55:00.000000Z",
    updated_at: "2026-07-25T13:10:00.000000Z",
  },
  {
    id: 107,
    sender: priyaPatel,
    receiver: PLACEHOLDER_CURRENT_USER,
    teaching_skill: {
      id: 24,
      skill_id: 22,
      skill: { id: 22, name: "Painting", slug: "painting" },
      type: "teaching",
      title: "Watercolor Painting",
      experience_level: "intermediate",
    },
    learning_skill: {
      id: 1,
      skill_id: 5,
      skill: { id: 5, name: "Laravel", slug: "laravel" },
      type: "learning",
      title: "Laravel Development",
      experience_level: "beginner",
    },
    message: "Let's set up our first session — excited to learn Laravel from you!",
    status: "accepted",
    created_at: "2026-07-24T07:40:00.000000Z",
    updated_at: "2026-07-24T09:25:00.000000Z",
  },
]
