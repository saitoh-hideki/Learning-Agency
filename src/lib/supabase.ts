import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vcmcincwurpiaqrgjdfv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbWNpbmN3dXJwaWFxcmdqZGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjQ5NTAsImV4cCI6MjA2OTM0MDk1MH0.eY1KFdfENHYDwOukxapa7DHsE0xCrM9s08esKklj_T8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
export interface User {
  id: string
  created_at: string
  session_id: string
}

export interface Session {
  id: string
  user_id: string
  mode_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Document {
  id: string
  session_id: string
  filename: string
  content: string
  created_at: string
}

export interface Review {
  id: string
  session_id: string
  insights: string
  summary: string
  deep_dive: string
  created_at: string
}

export interface ReviewStock {
  id: string
  user_id: string
  session_id: string
  title: string
  insights: string
  summary: string
  deep_dive: string
  created_at: string
}

export interface MemoNote {
  id: string
  session_id: string
  message_id: string
  original_text: string
  user_note: string
  tags: string[]
  created_at: string
} 