import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatState {
  // 現在のセッション
  currentSessionId: string | null
  currentModeId: string | null
  
  // メッセージ
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  
  // Reflective Notes
  memoNotes: Array<{
    id: string
    message_id: string
    original_text: string
    user_note: string
    tags: string[]
    created_at: Date
  }>
  
  // レビュー状態
  showReview: boolean
  currentReview: {
    insights: string
    summary: string
    deep_dive: string
  } | null
  
  // ローディング状態
  isLoading: boolean
  isStreaming: boolean
  
  // アクション
  setCurrentSession: (sessionId: string, modeId: string) => void
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearMessages: () => void
  addMemoNote: (messageId: string, originalText: string, userNote: string, tags: string[]) => void
  updateMemoNote: (id: string, userNote: string, tags: string[]) => void
  deleteMemoNote: (id: string) => void
  setLoading: (loading: boolean) => void
  setStreaming: (streaming: boolean) => void
  toggleReview: () => void
  setReview: (review: { insights: string; summary: string; deep_dive: string } | null) => void
  resetSession: () => void
  updateLastMessage: (content: string) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 初期状態
      currentSessionId: null,
      currentModeId: null,
      messages: [],
      memoNotes: [],
      showReview: false,
      currentReview: null,
      isLoading: false,
      isStreaming: false,
      
      // アクション
      setCurrentSession: (sessionId: string, modeId: string) => 
        set({ currentSessionId: sessionId, currentModeId: modeId }),
      
      addMessage: (role: 'user' | 'assistant', content: string) =>
        set((state) => ({
          messages: [...state.messages, {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role,
            content,
            timestamp: new Date()
          }]
        })),
      
      clearMessages: () => set({ messages: [] }),
      
      addMemoNote: (messageId: string, originalText: string, userNote: string, tags: string[]) =>
        set((state) => ({
          memoNotes: [...state.memoNotes, {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message_id: messageId,
            original_text: originalText,
            user_note: userNote,
            tags,
            created_at: new Date()
          }]
        })),
      
      updateMemoNote: (id: string, userNote: string, tags: string[]) =>
        set((state) => ({
          memoNotes: state.memoNotes.map(note => 
            note.id === id ? { ...note, user_note: userNote, tags } : note
          )
        })),
      
      deleteMemoNote: (id: string) =>
        set((state) => ({
          memoNotes: state.memoNotes.filter(note => note.id !== id)
        })),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setStreaming: (streaming: boolean) => set({ isStreaming: streaming }),
      
      toggleReview: () => set((state) => ({ showReview: !state.showReview })),
      
      setReview: (review) => set({ currentReview: review }),
      
      resetSession: () => set({
        currentSessionId: null,
        currentModeId: null,
        messages: [],
        memoNotes: [], // セッション間でノートを保持する場合は、この行を削除または条件付きにする
        showReview: false,
        currentReview: null,
        isLoading: false,
        isStreaming: false
      }),

      updateLastMessage: (content: string) =>
        set((state) => {
          if (state.messages.length === 0) return state
          
          const updatedMessages = [...state.messages]
          const lastMessageIndex = updatedMessages.length - 1
          
          if (updatedMessages[lastMessageIndex] && updatedMessages[lastMessageIndex].role === 'assistant') {
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              content: content
            }
          }
          
          return { messages: updatedMessages }
        })
    }),
    {
      name: 'learning-agency-chat',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        currentModeId: state.currentModeId,
        messages: state.messages,
        memoNotes: state.memoNotes,
        showReview: state.showReview,
        currentReview: state.currentReview
      })
    }
  )
) 