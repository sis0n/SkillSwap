export interface MessageUser {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  username: string
  profile?: {
    avatar_url: string | null
    headline: string | null
  } | null
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  sender: MessageUser
  body: string
  read_at: string | null
  created_at: string
}

export interface Conversation {
  id: number
  exchange_request_id: number
  other_user: MessageUser
  last_message: Message | null
  unread_count: number
  updated_at: string
}

export interface SendMessageData {
  body: string
}
