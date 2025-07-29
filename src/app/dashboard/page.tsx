"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Brain, Heart, Users, Sparkles, LogOut, Settings, User, ChevronRight, ArrowRight, MessageCircle, BookOpen, Target, Zap, Clock, TrendingUp, Lightbulb, Play, Star, Bookmark, Compass, Book, Sparkles as SparklesIcon, Home, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Mode {
  id: string
  name: string
  description: string
  shortDescription: string
  icon: React.ReactNode
  color: string
  gradient: string
  features: string[]
  category: string
  emoji: string
  accentColor: string
  englishLabel: string
}

const modes: Mode[] = [
  {
    id: "exploration",
    name: "探究モード",
    description: "問いを深める対話で、あなたの好奇心を刺激します。",
    shortDescription: "思考の旅のはじまり。Reflectorと共に、深めていこう。",
    icon: <Search className="w-5 h-5" />,
    color: "text-cyan-400",
    gradient: "from-[#7C3AED] to-[#9333EA]",
    features: ["CurioLoop", "問い駆動"],
    category: "学習",
    emoji: "🧠",
    accentColor: "#A0C4FF",
    englishLabel: "Exploration Mode"
  },
  {
    id: "document",
    name: "ドキュメントモード",
    description: "資料ベースの対話で、PDFやテキストをアップロードして内容を理解します。",
    shortDescription: "言葉の奥にある意味と対話する。知識を構造化し、理解を深める。",
    icon: <FileText className="w-5 h-5" />,
    color: "text-emerald-400",
    gradient: "from-[#22D3EE] to-[#3B82F6]",
    features: ["PDF解析", "構造化"],
    category: "学習",
    emoji: "📚",
    accentColor: "#CAFFBF",
    englishLabel: "Document Insight"
  },
  {
    id: "kids",
    name: "キッズモード",
    description: "やさしい対話で、小中学生が楽しく学べる環境を提供します。",
    shortDescription: "楽しく学ぶ、やさしい対話。好奇心を育む空間。",
    icon: <Users className="w-5 h-5" />,
    color: "text-amber-400",
    gradient: "from-[#F59E0B] to-[#D97706]",
    features: ["やさしい", "シンプル"],
    category: "学習",
    emoji: "🌟",
    accentColor: "#FFD6A5",
    englishLabel: "Kids Learning"
  },
  {
    id: "thinking",
    name: "思考整理モード",
    description: "書いたことの構造化を支援します。Reflectorがあなたの思考を整理します。",
    shortDescription: "思考を整理し、新しい視点を。Reflectorがあなたの思考を構造化。",
    icon: <Brain className="w-5 h-5" />,
    color: "text-purple-400",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    features: ["Reflector", "構造化"],
    category: "思考",
    emoji: "💭",
    accentColor: "#E0BBE4",
    englishLabel: "Thought Organizer"
  },
  {
    id: "emotion",
    name: "感情リフレクト",
    description: "感情整理と内省をサポートします。共感重視の静かな語り口で。",
    shortDescription: "あなたの気持ちに、Reflectorが耳を傾けます。内省の時間を。",
    icon: <Heart className="w-5 h-5" />,
    color: "text-rose-400",
    gradient: "from-[#EC4899] to-[#DB2777]",
    features: ["共感", "内省"],
    category: "感情",
    emoji: "💙",
    accentColor: "#FFB3BA",
    englishLabel: "Emotional Reflect"
  }
]

const quickActions = [
  {
    id: "recent",
    name: "最近の対話",
    description: "続きから始める",
    icon: <Clock className="w-5 h-5" />,
    gradient: "from-slate-500 to-gray-500",
    count: 3,
    accentColor: "#B8B8B8"
  },
  {
    id: "tutorial",
    name: "チュートリアル",
    description: "使い方を学ぶ",
    icon: <BookOpen className="w-5 h-5" />,
    gradient: "from-blue-500 to-indigo-500",
    count: 0,
    accentColor: "#A0C4FF"
  },
  {
    id: "goals",
    name: "学習目標",
    description: "目標を設定する",
    icon: <Target className="w-5 h-5" />,
    gradient: "from-emerald-500 to-teal-500",
    count: 2,
    accentColor: "#CAFFBF"
  }
]

export default function Dashboard() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // 初回ロード時のアニメーション
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId)
    // チャットページに遷移
    router.push("/chat")
  }

  const handleLogout = () => {
    // ログアウト処理（実際の認証システムでは適切な処理を行う）
    window.location.href = "/"
  }

  const groupedModes = modes.reduce((acc, mode) => {
    if (!acc[mode.category]) {
      acc[mode.category] = []
    }
    acc[mode.category].push(mode)
    return acc
  }, {} as Record<string, Mode[]>)

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100">
      {/* ヘッダー */}
      <header className="border-b border-zinc-800/30 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Learning Agency</h1>
              </div>
              <div className="text-sm text-zinc-400 font-medium tracking-wide">Dashboard</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors duration-200 rounded-xl px-3 py-2">
                <Settings className="w-4 h-4 mr-2" />
                設定
              </Button>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors duration-200 rounded-xl px-3 py-2">
                <User className="w-4 h-4 mr-2" />
                プロフィール
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 rounded-xl px-3 py-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        {/* ウェルカムセクション */}
        <div className={`mb-32 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-4xl font-bold tracking-wide text-white mb-4">
            ようこそ
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed tracking-wide">
            Reflectorと共に、あなたの学びを深めていきましょう。
          </p>
        </div>

        {/* クイックアクション */}
        <div className={`mb-40 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-12">
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">Quick Access</p>
            <h3 className="text-2xl font-semibold text-white">今すぐ使える</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={action.id}
                className={`group p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] transition-all duration-500 delay-${index * 100}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: action.accentColor }}
                  >
                    {action.icon}
                  </div>
                  {action.count > 0 && (
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full font-medium">
                      {action.count}
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{action.name}</h4>
                <p className="text-sm text-zinc-400 tracking-wide">{action.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* セクション区切り */}
        <div className="border-t border-zinc-800/50 mb-40" />

        {/* 学習モードセクション */}
        <div className={`space-y-32 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {Object.entries(groupedModes).map(([category, categoryModes], categoryIndex) => (
            <div key={category}>
              <div className="mb-16">
                <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">{category}</p>
                <h3 className="text-2xl font-semibold text-white">
                  学習モード
                  <span className="text-xs text-zinc-500 ml-3 font-normal">Learning Modes</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryModes.map((mode, index) => (
                  <div
                    key={mode.id}
                    className={`group bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] relative overflow-hidden min-h-[200px] transition-all duration-500 delay-${(categoryIndex * 100) + (index * 100)} flex flex-col justify-between`}
                    onClick={() => handleModeSelect(mode.id)}
                  >
                    {/* 背景グラデーション */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                      style={{ background: `linear-gradient(135deg, ${mode.accentColor}20, transparent)` }}
                    />
                    
                    <div className="relative flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${mode.gradient} text-white flex items-center justify-center shadow-md`}>
                          {mode.emoji}
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400 uppercase tracking-wider">{mode.englishLabel}</p>
                          <h4 className="text-lg font-semibold text-white tracking-wide">{mode.name}</h4>
                        </div>
                      </div>
                      
                      <p className="text-sm text-zinc-400 leading-relaxed flex-grow">
                        {mode.shortDescription}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex gap-2 text-xs text-zinc-300">
                        {mode.features.map((feature, index) => (
                          <span
                            key={index}
                            className="bg-zinc-800 rounded-full px-2 py-0.5"
                          >
                            #{feature}
                          </span>
                        ))}
                      </div>
                      <button className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg text-sm shadow-sm hover:scale-[1.02] transition hover:opacity-90">
                        開始する →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* セクション区切り */}
        <div className="border-t border-zinc-800/50 mb-40" />

        {/* 最近の活動 */}
        <div className={`transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-16">
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">Learning History</p>
            <h3 className="text-2xl font-semibold text-white">
              最近の活動
              <span className="text-xs text-zinc-500 ml-3 font-normal">Recent Activity</span>
            </h3>
          </div>
          
          <div className="p-16 rounded-3xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 shadow-md relative overflow-hidden">
            {/* 背景装飾 */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-50" />
            <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
            
            <div className="relative text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-cyan-500/25">
                <Compass className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-3xl font-semibold text-white mb-6">まだ活動がありません</h4>
              <p className="text-zinc-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed tracking-wide">
                学習モードを選択して、新しい対話を始めましょう！
              </p>
              <Button 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold px-12 py-5 rounded-2xl text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25 hover:scale-105"
                onClick={() => handleModeSelect(modes[0].id)}
              >
                <Play className="w-6 h-6 mr-3" />
                はじめての対話を始める
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-48 border-t border-gradient-to-r from-zinc-800/50 to-transparent bg-gradient-to-b from-transparent to-zinc-900/30">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center space-x-3 text-zinc-500 text-sm">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-medium tracking-wide">Learning Agency - 思考と静けさが漂う、知的な探究空間</span>
          </div>
        </div>
      </footer>
    </div>
  )
} 