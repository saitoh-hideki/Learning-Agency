"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Sparkles,
  MessageCircle,
  Brain,
  Heart,
  Target,
  BookOpen,
  Clock,
  Zap,
  User,
  Lightbulb,
  Search,
  FileText,
  Users,
  Settings,
  Send
} from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface Mode {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  gradient: string
}

const modes: Mode[] = [
  {
    id: "exploration",
    name: "探究モード",
    description: "問いを深める対話で、あなたの好奇心を刺激します。",
    icon: <Search className="w-5 h-5" />,
    color: "text-blue-400",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "document",
    name: "ドキュメントモード",
    description: "資料ベースの対話で、PDFやテキストをアップロードして内容を理解します。",
    icon: <FileText className="w-5 h-5" />,
    color: "text-green-400",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "kids",
    name: "キッズモード",
    description: "やさしい対話で、小中学生が楽しく学べる環境を提供します。",
    icon: <Users className="w-5 h-5" />,
    color: "text-yellow-400",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    id: "thinking",
    name: "思考整理モード",
    description: "書いたことの構造化を支援します。Reflectorがあなたの思考を整理します。",
    icon: <Brain className="w-5 h-5" />,
    color: "text-purple-400",
    gradient: "from-purple-500 to-violet-500"
  },
  {
    id: "emotion",
    name: "感情リフレクト",
    description: "感情整理と内省をサポートします。共感重視の静かな語り口で。",
    icon: <Heart className="w-5 h-5" />,
    color: "text-pink-400",
    gradient: "from-pink-500 to-rose-500"
  }
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "こんにちは！Learning Agencyへようこそ。どのようなお手伝いができますか？",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMode, setSelectedMode] = useState(modes[0])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // シミュレートされたAI応答
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `「${inputValue}」について、${selectedMode.name}で詳しくお答えします。どのような観点から知りたいですか？`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ヘッダー */}
      <header className="bg-background-secondary/50 backdrop-blur-sm border-b border-border/20 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-text-muted hover:text-text"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${selectedMode.gradient} flex items-center justify-center`}>
                {selectedMode.icon}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-text">{selectedMode.name}</h1>
                <p className="text-xs text-text-muted">{selectedMode.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-text-muted hover:text-text">
              <Settings size={18} />
            </Button>
            <Button variant="ghost" size="sm" className="text-text-muted hover:text-text">
              <User size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-1 flex">
        {/* サイドバー */}
        <aside className="w-80 bg-background-secondary/30 backdrop-blur-sm border-r border-border/20 p-4 hidden lg:block">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text mb-3">学習モード</h3>
              <div className="space-y-2">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedMode.id === mode.id
                        ? `bg-gradient-to-r ${mode.gradient} bg-opacity-10 border border-${mode.gradient.split('-')[1]}-500/20`
                        : "hover:bg-background-tertiary/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-r ${mode.gradient} flex items-center justify-center`}>
                        {mode.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${selectedMode.id === mode.id ? mode.color : "text-text"}`}>
                          {mode.name}
                        </p>
                        <p className="text-xs text-text-muted mt-1">{mode.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* チャットエリア */}
        <main className="flex-1 flex flex-col">
          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? "bg-gradient-to-r from-primary to-primary-light text-background"
                      : "bg-background-secondary/50 backdrop-blur-sm border border-border/20"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.isUser ? "text-background/70" : "text-text-muted"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background-secondary/50 backdrop-blur-sm border border-border/20 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="border-t border-border/20 p-4 bg-background-secondary/30 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="メッセージを入力してください..."
                    className="w-full bg-background-secondary/50 border-border/50 focus:border-primary/50 focus:bg-background-secondary transition-all duration-300 pr-12 resize-none"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-background px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Send size={18} />
                </Button>
              </div>
              <p className="text-xs text-text-muted mt-2 text-center">
                Enter で送信、Shift + Enter で改行
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 