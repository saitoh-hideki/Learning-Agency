"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useChatStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { 
  ArrowDown,
  Send, 
  FileText, 
  Download, 
  Save,
  Sparkles,
  User,
  X,
  Brain,
  Lightbulb,
  Target,
  BookOpen,
  Clock,
  Zap,
  Heart,
  Edit3,
  Trash2
} from "lucide-react"

// モード定義
const modes = {
  inquiry: { name: "探究モード", englishName: "Inquiry Mode", color: "text-blue-400", gradient: "from-blue-400 to-cyan-400", icon: Sparkles },
  emotion: { name: "感情リフレクト", englishName: "Emotion Reflect", color: "text-pink-400", gradient: "from-pink-400 to-rose-400", icon: Heart },
  structure: { name: "思考整理モード", englishName: "Structure Mode", color: "text-purple-400", gradient: "from-purple-400 to-violet-400", icon: Brain },
  document: { name: "ドキュメントモード", englishName: "Document Insight", color: "text-cyan-400", gradient: "from-cyan-400 to-blue-400", icon: BookOpen },
  creative: { name: "創造モード", englishName: "Creative Flow", color: "text-yellow-400", gradient: "from-yellow-400 to-orange-400", icon: Lightbulb },
  reflection: { name: "リフレクションモード", englishName: "Reflective Review", color: "text-gray-400", gradient: "from-gray-400 to-slate-400", icon: Zap },
  kids: { name: "キッズモード", englishName: "Kids Dialogue", color: "text-red-400", gradient: "from-red-400 to-pink-400", icon: User },
  goal: { name: "目標モード", englishName: "Goal Planner", color: "text-green-400", gradient: "from-green-400 to-emerald-400", icon: Target },
  story: { name: "ストーリーモード", englishName: "Story Weaving", color: "text-amber-400", gradient: "from-amber-400 to-orange-400", icon: Clock }
}

// 思考促進メッセージ
const reflectionMessages = [
  "問いの深さは、視点の移動から生まれる。",
  "思考の境界を越えるとき、新しい発見がある。",
  "内省は、外の世界への窓を開く。",
  "知識は、問いと対話の中で育まれる。",
  "創造性は、制約の中で花開く。",
  "理解は、多様な視点の交差点にある。",
  "学習は、好奇心の旅路である。",
  "洞察は、静寂の中で生まれる。"
]

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const modeId = params.modeId as string
  const mode = modes[modeId as keyof typeof modes]
  
  const {
    currentSessionId,
    currentModeId,
    messages,
    memoNotes,
    showReview,
    currentReview,
    isLoading,
    isStreaming,
    setCurrentSession,
    addMessage,
    clearMessages,
    addMemoNote,
    updateMemoNote,
    deleteMemoNote,
    setLoading,
    setStreaming,
    toggleReview,
    updateLastMessage
  } = useChatStore()

  const [input, setInput] = useState("")
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  const [showPastSession, setShowPastSession] = useState(false)
  const [isReviewStreaming, setIsReviewStreaming] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 })
  const [showSelectionPopup, setShowSelectionPopup] = useState(false)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 思考促進メッセージの循環
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessage = reflectionMessages[Math.floor(Math.random() * reflectionMessages.length)]
      // setCurrentReflectionMessage(randomMessage) // この変数は削除されたため、ここでは削除
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // 過去セッション引用の表示
  useEffect(() => {
    if (messages.length > 2 && !isLoading && !showPastSession) {
      setTimeout(() => {
        // setPastSessionQuote("AIは人間の創造性を拡張する存在であり、その境界を探ることが私の問いです。") // この変数は削除されたため、ここでは削除
        setShowPastSession(true)
      }, 2000)
    }
  }, [messages.length, isLoading, showPastSession])

  // モードが変更された場合の処理
  useEffect(() => {
    if (modeId && modeId !== currentModeId) {
      // 新しいセッションを開始
      const sessionId = `session_${Date.now()}`
      setCurrentSession(sessionId, modeId)
      clearMessages()
      // memoNotesは保持する（セッション間でノートを継続）
      setShowPastSession(false)
    }
  }, [modeId, currentModeId, setCurrentSession, clearMessages])

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ストリーミング中も自動スクロール
  useEffect(() => {
    if (isStreaming) {
      const scrollInterval = setInterval(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      return () => clearInterval(scrollInterval)
    }
  }, [isStreaming])

  // 最後のメッセージの内容が変更されたらスクロール
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [messages.length > 0 ? messages[messages.length - 1]?.content : null])

  // レビュー表示時にもスクロール
  useEffect(() => {
    if (showReview) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [showReview])

  // ローディング状態が変わった時にもスクロール
  useEffect(() => {
    if (!isLoading && !isStreaming) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 50)
    }
  }, [isLoading, isStreaming])

  // 自動高さ調整
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px` // 最大200px
  }, [input])

  // セッション開始時の初期メッセージ
  useEffect(() => {
    if (currentSessionId && messages.length === 0) {
      const welcomeMessages = {
        inquiry: "こんにちは！探究モードのReflectorです。あなたの問いを深く掘り下げて、思考を次の階層へ導きましょう。何について探究したいですか？",
        emotion: "こんにちは！感情リフレクトモードのReflectorです。あなたの気持ちに寄り添い、内省をサポートします。どんな気持ちでお話ししたいですか？",
        structure: "こんにちは！思考整理モードのReflectorです。混沌とした思考を秩序へと導き、美しい構造に織り上げましょう。何を整理したいですか？",
        document: "こんにちは！ドキュメントモードのReflectorです。PDFや資料の内容を深く理解し、関連質問で理解を深めましょう。どのような資料について話したいですか？",
        creative: "こんにちは！創造モードのReflectorです。アイデア創出と発想拡張をサポートします。どんな創造的な課題に取り組みたいですか？",
        reflection: "こんにちは！リフレクションモードのReflectorです。過去の出来事の意味づけと気づきの抽出をサポートします。何を振り返りたいですか？",
        kids: "こんにちは！キッズモードのReflectorです。楽しく学べる環境を提供します。何について話したいですか？😊",
        goal: "こんにちは！目標モードのReflectorです。学習計画と実行支援をサポートします。どんな目標を持っていますか？",
        story: "こんにちは！ストーリーモードのReflectorです。経験を物語として紡ぎ、ナラティブ構造を支援します。どんな物語を紡ぎたいですか？"
      }
      
      const welcomeMessage = welcomeMessages[modeId as keyof typeof welcomeMessages] || welcomeMessages.inquiry
      addMessage('assistant', welcomeMessage)
    }
  }, [currentSessionId, messages.length, modeId, addMessage])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    
    // ユーザーメッセージを追加
    addMessage('user', userMessage)
    
    // ローディング状態を設定
    setLoading(true)
    setStreaming(true)
    setShowPastSession(false)

    // 空のアシスタントメッセージを追加
    addMessage('assistant', "")

    try {
      console.log('Starting chat request for mode:', modeId)
      
      // AbortControllerでタイムアウト処理を追加
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒タイムアウト
      
      // モード別のSupabase Edge Functionを呼び出し
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-chat-response-${modeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: userMessage,
          history: messages
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      console.log('Response received:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""
      let lastUpdateTime = Date.now()

      console.log('Starting to read stream')

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('Stream completed successfully')
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          console.log('Received chunk:', chunk.length, 'characters')
          fullResponse += chunk

          // リアルタイムでメッセージを更新（頻繁すぎる更新を防ぐ）
          const now = Date.now()
          if (now - lastUpdateTime > 50) { // 50ms間隔で更新
            updateLastMessage(fullResponse)
            lastUpdateTime = now
          }
        }
        
        // 最終更新
        updateLastMessage(fullResponse)
      } catch (streamError) {
        console.error('Stream reading error:', streamError)
        if (fullResponse.trim()) {
          updateLastMessage(fullResponse + "\n\n[応答が途中で中断されました。もう一度お試しください。]")
        } else {
          updateLastMessage("ストリーミング中にエラーが発生しました。もう一度お試しください。")
        }
      } finally {
        try {
          reader.releaseLock()
        } catch (releaseError) {
          console.log('Reader release error:', releaseError)
        }
      }

    } catch (error) {
      console.error('Request error:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        updateLastMessage("応答がタイムアウトしました。もう一度お試しください。")
      } else {
        updateLastMessage("申し訳ございません。応答の生成中にエラーが発生しました。もう一度お試しください。")
      }
    } finally {
      console.log('Request completed, resetting states')
      setLoading(false)
      setStreaming(false)
      
      // 入力欄にフォーカスを戻す
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleGenerateReview = async () => {
    if (messages.length === 0) return
    
    setIsReviewStreaming(true)
    setReviewText("")
    toggleReview()
    
    try {
      // モード別のレビュー生成エッジファンクションを直接呼び出し
      const response = await fetch(`https://vcmcincwurpiaqrgjdfv.supabase.co/functions/v1/generate-review-${modeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbWNpbmN3dXJwaWFxcmdqZGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjQ5NTAsImV4cCI6MjA2OTM0MDk1MH0.eY1KFdfENHYDwOukxapa7DHsE0xCrM9s08esKklj_T8`,
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          messages: messages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate review')
      }

      const reviewData = await response.json()
      
      // レビューデータを構造化して表示
      const reviewText = `## レビュー結果

${Object.entries(reviewData).map(([key, value]) => {
  const sectionTitle = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  return `### ${sectionTitle}\n\n${value}\n`
}).join('\n')}`

      setReviewText(reviewText)
    } catch (error) {
      console.error('Error generating review:', error)
      setReviewText("Error generating review. Please try again.")
    } finally {
      setIsReviewStreaming(false)
    }
  }

  const handleCloseReview = () => {
    toggleReview()
    setReviewText("")
    setIsReviewStreaming(false)
  }

  const handleUpdateNote = (noteId: string, userNote: string, tags: string[]) => {
    updateMemoNote(noteId, userNote, tags)
    setEditingNoteId(null)
  }

  const handleDeleteNote = (noteId: string) => {
    deleteMemoNote(noteId)
  }

  // テキスト選択機能
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      const selection = window.getSelection()
      const selectedText = selection?.toString().trim()
      
      if (selectedText && selectedText.length > 1) {
        // 選択範囲の位置を取得
        const range = selection?.getRangeAt(0)
        const rect = range?.getBoundingClientRect()
        
        if (rect) {
          setSelectedText(selectedText)
          setShowSelectionPopup(true)
          setSelectionPosition({ 
            x: rect.left + rect.width / 2, 
            y: rect.top - 10 
          })
        }
      } else {
        setShowSelectionPopup(false)
        setSelectedText("")
      }
    }

    const handleGlobalClick = (event: MouseEvent) => {
      // ポップアップ外をクリックした場合は閉じる
      const target = event.target as Element
      if (!target.closest('.selection-popup')) {
        setShowSelectionPopup(false)
        setSelectedText("")
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('click', handleGlobalClick)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [])

  const handlePinSelectedText = () => {
    if (selectedText) {
      // 選択されたテキストをReflective Notesに追加
      addMemoNote("selected_text", selectedText, "", [])
      setShowSelectionPopup(false)
      setSelectedText("")
      
      // 成功フィードバック
      console.log("📌 Selected text pinned:", selectedText)
    }
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">モードが見つかりません</h1>
          <Button onClick={() => router.push('/dashboard')}>ダッシュボードに戻る</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* ヘッダー - 洗練された知的デザイン */}
      <header className="flex items-center justify-between h-16 px-8 bg-zinc-950/80 border-b border-zinc-800/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            size="sm"
            className="text-sm text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800/50 transition-all duration-200"
          >
            ← Back
          </Button>
          
          <h1 className="text-base font-semibold text-white tracking-wide">
            {mode.englishName} <span className="text-xs text-gray-400 ml-2">{mode.name}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 italic">
            Reflector is ready to explore with you.
          </div>
          
          {/* レビュー生成ボタン */}
          <Button
            onClick={handleGenerateReview}
            disabled={messages.length === 0 || isReviewStreaming}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-xs px-3 py-1.5"
          >
            <FileText className="w-3 h-3 mr-1" />
            {isReviewStreaming ? 'Generating...' : 'Review'}
          </Button>
        </div>
      </header>

      {/* メインコンテンツ - 完全に新しいレイアウト構造 */}
      <div className="flex flex-row min-h-[calc(100vh-64px)]">
        
        {/* メインチャットエリア */}
        <div className="flex-grow pl-8 pr-0 md:pr-[320px] pt-4 pb-32 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* メッセージエリア */}
            <div className="flex flex-col gap-6 relative">
              {/* スクロールボタン */}
              <button
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="fixed bottom-32 right-8 z-40 bg-zinc-800/80 hover:bg-zinc-700/80 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 backdrop-blur-sm border border-zinc-700/30"
                title="最新メッセージにスクロール"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-up duration-300 relative group`}
                  style={{ animationDelay: `${index * 150}ms` }}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {message.role === 'user' ? (
                    // ユーザーメッセージ - 右寄せ
                    <div className="self-end max-w-[65%] mr-0 md:mr-[320px] bg-cyan-700/70 backdrop-blur-sm text-white text-sm font-medium rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.01] border border-cyan-800/20">
                      <p className="leading-relaxed select-text">
                        {message.content}
                      </p>
                    </div>
                  ) : (
                    // Reflectorメッセージ - 左寄せ
                    <div className="self-start max-w-[65%] ml-12 bg-zinc-800/60 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.01] border border-zinc-700/30 shadow-sm" style={{ marginLeft: '48px' }}>
                      {/* Reflectorラベル */}
                      <div className="flex items-center space-x-2 mb-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-xs text-gray-400 font-medium tracking-wide">🧠 Reflector</span>
                        {isStreaming && index === messages.length - 1 && (
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        )}
                      </div>
                      
                      {/* メッセージ内容 */}
                      <p className="text-gray-100 text-[15px] leading-relaxed tracking-normal select-text">
                        {message.content}
                        {isStreaming && index === messages.length - 1 && (
                          <span className="inline-block w-2 h-4 bg-gray-300 animate-pulse ml-1" />
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {/* スクロールターゲット */}
              <div ref={messagesEndRef} />
              
              {/* ローディング状態 */}
              {isLoading && !isStreaming && (
                <div className="flex justify-start animate-in fade-in-up duration-300">
                  <div className="self-start max-w-[65%] ml-12 bg-zinc-800/60 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-zinc-700/30 shadow-sm" style={{ marginLeft: '48px' }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-gray-400 font-medium tracking-wide">🧠 Reflector</span>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-[15px] leading-relaxed italic">
                      Reflector is thinking...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 入力エリア - 下部固定 */}
        <div className="fixed bottom-16 left-0 right-0 md:right-[320px] bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/30 z-40">
          <div className="px-12 py-6">
            <div className="max-w-4xl ml-8" style={{ marginLeft: '32px' }}>
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Reflectorに思考を伝えてください…"
                  disabled={isLoading}
                  rows={1}
                  className="w-full resize-none rounded-xl bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/30 text-white placeholder-gray-500 text-base leading-relaxed px-6 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all duration-200 hover:bg-zinc-800/90 shadow-md min-h-[60px]"
                  autoFocus
                />
                
                {/* 送信ボタン */}
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-500 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 rounded-lg px-4 py-2 z-10"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              

            </div>
          </div>
        </div>

        {/* Reflective Notes サイドバー */}
        {!showReview && (
          <aside className="hidden md:block fixed right-0 top-16 w-[320px] h-[calc(100vh-64px)] bg-zinc-950 border-l border-zinc-800/30 shadow-lg z-30 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6 tracking-wide">REFLECTIVE NOTES</h2>
              <p className="text-xs text-gray-500 mb-6 font-medium">Pin important messages to create your reflective notes</p>
              
              {memoNotes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">
                    <p className="mb-2">No notes yet</p>
                    <p className="text-xs">Select text in chat to pin important thoughts</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {memoNotes.map((note) => (
                    <div key={note.id} className="bg-zinc-900/60 rounded-lg p-4 border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-200 group">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-gray-400 font-medium">Original Text</span>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            onClick={() => setEditingNoteId(note.id)}
                            className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded p-0"
                            size="sm"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteNote(note.id)}
                            className="w-6 h-6 bg-zinc-800 hover:bg-red-600 text-white rounded p-0"
                            size="sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3 leading-relaxed">{note.original_text}</p>
                      
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={note.user_note}
                            onChange={(e) => {
                              const updatedNotes = memoNotes.map(n => 
                                n.id === note.id ? { ...n, user_note: e.target.value } : n
                              )
                              // ここでstoreのupdateMemoNoteを呼び出す
                            }}
                            className="w-full bg-zinc-800 text-sm text-white p-2 rounded border border-zinc-700"
                            placeholder="Add your reflection..."
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleUpdateNote(note.id, note.user_note, note.tags)}
                              className="text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-2 py-1"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingNoteId(null)}
                              className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {note.user_note && (
                            <p className="text-sm text-gray-400 mb-2 italic">"{note.user_note}"</p>
                          )}
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-zinc-800 text-gray-400 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reflector待機メッセージ */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500 italic">
                  Reflector is waiting for your next thought...
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>

        {/* Reflectorステータスメッセージ - 右下に固定 */}
        {!showReview && (
          <div className="fixed bottom-6 right-6 text-xs text-gray-400 italic">
            <div className="flex items-center space-x-2 bg-zinc-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-zinc-700/30 shadow-md">
              <Heart className="w-3 h-3 text-cyan-400" />
              <span>Reflector is listening...</span>
            </div>
          </div>
        )}

        {/* テキスト選択ポップアップ */}
        {showSelectionPopup && selectedText && (
          <div 
            className="fixed z-50 bg-zinc-800 text-xs text-white px-3 py-1 rounded shadow-md selection-popup"
            style={{ 
              top: selectionPosition.y + window.scrollY + 20, 
              left: selectionPosition.x + 10,
              transform: 'translateX(-50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePinSelectedText}
                className="text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
              >
                📌 メモする
              </Button>
              <span className="text-xs text-gray-400 max-w-[200px] truncate font-medium">
                &quot;{selectedText}&quot;
              </span>
            </div>
          </div>
        )}

        {/* レビューパネル - 右側固定 */}
        {showReview && (
          <div className="fixed right-0 top-16 w-1/2 h-[calc(100vh-64px)] bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-700/30 shadow-2xl transition-all duration-300 ease-in-out z-40">
            <div className="h-full flex flex-col">
              {/* レビューヘッダー */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">📊 Session Analysis Report</h2>
                    <p className="text-xs text-zinc-500 font-medium tracking-wide">AI-Powered Learning Insights</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseReview}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* レビューコンテンツ */}
              <div className="flex-1 overflow-y-auto p-6">
                {isReviewStreaming ? (
                  <div className="space-y-6">
                    {/* 思考中演出 */}
                    <div className="flex items-center space-x-3 text-sm text-zinc-400 italic">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>Reflector is analyzing your session...</span>
                    </div>

                    {/* ストリーミングテキスト */}
                    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-xl p-4">
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                        {reviewText}
                        {isReviewStreaming && (
                          <span className="inline-block w-2 h-4 bg-zinc-300 animate-pulse ml-1" />
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* エグゼクティブサマリー */}
                    <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 backdrop-blur-sm border border-zinc-700/30 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
                          <p className="text-xs text-zinc-400">Key findings at a glance</p>
                        </div>
                      </div>
                      <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-700/20">
                        <p className="text-sm text-zinc-200 leading-relaxed">
                          {currentReview?.summary || reviewText || "This session demonstrates active engagement with the learning process, showing clear progression in understanding and application of concepts."}
                        </p>
                      </div>
                    </div>

                    {/* キーメトリクス */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Engagement</span>
                        </div>
                        <div className="text-2xl font-bold text-white">92%</div>
                        <div className="text-xs text-zinc-500">High participation</div>
                      </div>
                      <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Depth</span>
                        </div>
                        <div className="text-2xl font-bold text-white">8.5/10</div>
                        <div className="text-xs text-zinc-500">Strong analysis</div>
                      </div>
                    </div>

                    {/* 主要な気づき */}
                    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Key Insights</h3>
                          <p className="text-xs text-zinc-400">Critical discoveries & patterns</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {currentReview?.insights || reviewText || "Demonstrated strong analytical thinking with clear progression from surface-level understanding to deeper conceptual connections."}
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            "Active questioning and reflection patterns indicate a growth mindset and willingness to challenge assumptions."
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            "Clear evidence of knowledge synthesis and application across multiple contexts."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 深掘り分析 */}
                    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Deep Dive Analysis</h3>
                          <p className="text-xs text-zinc-400">Strategic perspectives & recommendations</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2">Learning Patterns</h4>
                          <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-700/20">
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              {currentReview?.deep_dive || reviewText || "The session reveals a systematic approach to problem-solving, with clear evidence of hypothesis formation and testing."}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2">Growth Opportunities</h4>
                          <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-700/20">
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              &quot;Consider exploring interdisciplinary connections and applying concepts to real-world scenarios for enhanced retention.&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* アクションプラン */}
                    <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 backdrop-blur-sm border border-zinc-700/30 rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Action Plan</h3>
                          <p className="text-xs text-zinc-400">Next steps & recommendations</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-400">1</span>
                          </div>
                          <span className="text-sm text-zinc-300">Continue exploring advanced concepts in this domain</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-400">2</span>
                          </div>
                          <span className="text-sm text-zinc-300">Apply learned concepts to practical scenarios</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-400">3</span>
                          </div>
                          <span className="text-sm text-zinc-300">Schedule follow-up session for deeper exploration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              {!isReviewStreaming && (
                <div className="p-6 border-t border-zinc-800/30">
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-zinc-800/60 border-zinc-700/30 text-zinc-300 hover:bg-zinc-700/60"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-zinc-800/60 border-zinc-700/30 text-zinc-300 hover:bg-zinc-700/60"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  )
}
