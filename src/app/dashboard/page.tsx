"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Brain, Heart, Users, Sparkles, LogOut, Settings, User, ChevronRight, ArrowRight, MessageCircle, BookOpen, Target, Zap, Clock, TrendingUp, Lightbulb, Play, Star, Bookmark, Compass, Book, Sparkles as SparklesIcon, Home, BarChart3, Palette, RotateCcw, FileText as FileTextIcon, Wand2, Calendar, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Mode {
  id: string
  name: string
  englishName: string
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
  reflectorStyle: string
}

const modes: Mode[] = [
  {
    id: "inquiry",
    name: "探究モード",
    englishName: "Inquiry Mode",
    description: "Reflectorと問いを巡る思考空間へ。CurioLoopと連想ジャンプが、探究を次の階層へ導きます。",
    shortDescription: "Reflectorと問いを巡る思考空間へ。CurioLoopと連想ジャンプが、探究を次の階層へ導きます。",
    icon: <Search className="w-5 h-5" />,
    color: "text-blue-400",
    gradient: "from-[#3B82F6] to-[#1D4ED8]",
    features: ["CurioLoop", "連想ジャンプ", "深掘り"],
    category: "思考の入口",
    emoji: "🧠",
    accentColor: "#A0C4FF",
    englishLabel: "Inquiry Mode",
    reflectorStyle: "哲学的・問い返し型：「なぜそう思った？」"
  },
  {
    id: "emotion",
    name: "感情リフレクト",
    englishName: "Emotion Reflect",
    description: "心の声に耳を傾ける静寂の空間。共感と理解が、内なる感情を優しく照らし出します。",
    shortDescription: "心の声に耳を傾ける静寂の空間。共感と理解が、内なる感情を優しく照らし出します。",
    icon: <Heart className="w-5 h-5" />,
    color: "text-pink-400",
    gradient: "from-[#EC4899] to-[#DB2777]",
    features: ["共感語り", "静かな対話", "非評価型"],
    category: "思考の入口",
    emoji: "💭",
    accentColor: "#FFB3BA",
    englishLabel: "Emotion Reflect",
    reflectorStyle: "共感型：「それはつらかったね」「安心して話してね」"
  },
  {
    id: "document",
    name: "ドキュメントモード",
    englishName: "Document Insight",
    description: "知識の海を航海する。PDFの奥深い意味を解き明かし、理解を次の次元へと押し上げます。",
    shortDescription: "知識の海を航海する。PDFの奥深い意味を解き明かし、理解を次の次元へと押し上げます。",
    icon: <FileTextIcon className="w-5 h-5" />,
    color: "text-cyan-400",
    gradient: "from-[#22D3EE] to-[#3B82F6]",
    features: ["PDF要約", "出典提示", "関連質問"],
    category: "思考の入口",
    emoji: "📄",
    accentColor: "#CAFFBF",
    englishLabel: "Document Insight",
    reflectorStyle: "専門解説風：「このPDFでは〜が述べられています」"
  },
  {
    id: "structure",
    name: "思考整理モード",
    englishName: "Structure Mode",
    description: "混沌とした思考を秩序へ。MECEとタグ付けが、あなたのアイデアを美しい構造に織り上げます。",
    shortDescription: "混沌とした思考を秩序へ。MECEとタグ付けが、あなたのアイデアを美しい構造に織り上げます。",
    icon: <Brain className="w-5 h-5" />,
    color: "text-purple-400",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    features: ["MECE", "タグ付け", "分解支援"],
    category: "対話の方向性",
    emoji: "🧩",
    accentColor: "#E0BBE4",
    englishLabel: "Structure Mode",
    reflectorStyle: "ファシリ型：「整理するとこうなりそうです」"
  },
  {
    id: "creative",
    name: "創造モード",
    englishName: "Creative Flow",
    description: "創造性の泉を掘り当てる。視点の転換と逆思考が、新しい可能性の扉を開きます。",
    shortDescription: "創造性の泉を掘り当てる。視点の転換と逆思考が、新しい可能性の扉を開きます。",
    icon: <Wand2 className="w-5 h-5" />,
    color: "text-yellow-400",
    gradient: "from-[#F59E0B] to-[#D97706]",
    features: ["視点変換", "逆思考", "応用展開"],
    category: "対話の方向性",
    emoji: "🪄",
    accentColor: "#FFD6A5",
    englishLabel: "Creative Flow",
    reflectorStyle: "拡張型：「逆の立場だとどうなる？」"
  },
  {
    id: "reflection",
    name: "リフレクションモード",
    englishName: "Reflective Review",
    description: "過去を未来への糧に。セッション記録から気づきを抽出し、経験を智慧へと昇華させます。",
    shortDescription: "過去を未来への糧に。セッション記録から気づきを抽出し、経験を智慧へと昇華させます。",
    icon: <RotateCcw className="w-5 h-5" />,
    color: "text-gray-400",
    gradient: "from-[#6B7280] to-[#4B5563]",
    features: ["セッション記録", "気づき抽出", "レビュー"],
    category: "対話の方向性",
    emoji: "🔁",
    accentColor: "#B8B8B8",
    englishLabel: "Reflective Review",
    reflectorStyle: "メタ認知型：「その出来事から何を得ましたか？」"
  },
  {
    id: "story",
    name: "ストーリーモード",
    englishName: "Story Weaving",
    description: "経験を物語として紡ぐ。Reflectorがナラティブ構造を支援し、あなたの声を世界へと届けます。",
    shortDescription: "経験を物語として紡ぐ。Reflectorがナラティブ構造を支援し、あなたの声を世界へと届けます。",
    icon: <PenTool className="w-5 h-5" />,
    color: "text-amber-400",
    gradient: "from-[#D97706] to-[#B45309]",
    features: ["ナラティブ支援", "Blog化", "表現支援"],
    category: "対話の方向性",
    emoji: "📖",
    accentColor: "#FFD6A5",
    englishLabel: "Story Weaving",
    reflectorStyle: "ナレーション補助：「じゃあ章立てにしてみようか」"
  },
  {
    id: "kids",
    name: "キッズモード",
    englishName: "Kids Dialogue",
    description: "子どもの好奇心を育む。短文と絵文字が、楽しい学びの冒険へと誘います。",
    shortDescription: "子どもの好奇心を育む。短文と絵文字が、楽しい学びの冒険へと誘います。",
    icon: <Users className="w-5 h-5" />,
    color: "text-red-400",
    gradient: "from-[#F87171] to-[#EF4444]",
    features: ["短文", "絵文字", "感情調整"],
    category: "ユーザーの状態",
    emoji: "🎈",
    accentColor: "#FFB3BA",
    englishLabel: "Kids Dialogue",
    reflectorStyle: "明るくシンプル：「すごいね！どんな気持ちだった？」"
  },
  {
    id: "goal",
    name: "目標モード",
    englishName: "Goal Planner",
    description: "学習の道筋を描く。目標設定から実行支援まで、継続的な成長をサポートします。",
    shortDescription: "学習の道筋を描く。目標設定から実行支援まで、継続的な成長をサポートします。",
    icon: <Target className="w-5 h-5" />,
    color: "text-green-400",
    gradient: "from-[#10B981] to-[#059669]",
    features: ["目標設定", "日次リマインド", "ToDo支援"],
    category: "ユーザーの状態",
    emoji: "🎯",
    accentColor: "#CAFFBF",
    englishLabel: "Goal Planner",
    reflectorStyle: "進捗管理型：「今日の学び、5分だけやってみようか」"
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

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100">
      {/* ヘッダー */}
      <header className="border-b border-zinc-800/30 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 左側：ロゴとタイトル */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">Learning Agency</h1>
                <p className="text-xs text-zinc-500 font-medium tracking-wide">Dashboard</p>
              </div>
            </div>
            
            {/* 右側：ナビゲーション */}
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors duration-200 rounded-lg px-3 py-2 text-sm"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors duration-200 rounded-lg px-3 py-2 text-sm"
              >
                <User className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-zinc-700 mx-2" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 rounded-lg px-3 py-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        {/* ウェルカムセクション */}
        <div className={`mb-32 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mt-10 mb-4">
            <h2 className="text-4xl font-semibold tracking-wide text-white mb-1">
              Welcome to Learning Agency
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed tracking-wide">
              あなたの探究と思索を広げる対話の場へ。
            </p>
          </div>
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
                className={`group p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] transition-all duration-500 delay-${index * 100}`}
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
        <div className={`transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-16">
            <h2 className="text-lg font-semibold text-white tracking-wider mb-1">
              9 Learning Modes
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              OECD・UNESCOの学習観に基づく、知的探究と自己形成の空間。
            </p>
          </div>
          
          {/* 3x3グリッドレイアウト */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-8">
            {modes.map((mode, index) => (
              <div
                key={mode.id}
                className={`group bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] relative overflow-hidden min-h-[220px] transition-all duration-500 delay-${index * 100} flex flex-col justify-between`}
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
                
                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex gap-2 text-xs text-gray-400">
                    {mode.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-zinc-800 rounded-full px-2 py-0.5"
                      >
                        #{feature}
                      </span>
                    ))}
                  </div>
                  <button className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                    <span>開始する</span>
                    <ArrowRight className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* セクション区切り */}
        <div className="border-t border-zinc-800/50 mb-40 mt-40" />

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
                9つの学習モードから選んで、新しい対話を始めましょう！
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
            <span className="font-medium tracking-wide">Learning Agency - OECD・UNESCOの学習観に基づく知的探究×自己形成</span>
          </div>
        </div>
      </footer>
    </div>
  )
} 