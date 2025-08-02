"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Brain,
  Heart,
  Target,
  BookOpen,
  Zap,
  User,
  Lightbulb,
  Clock,
  Search,
  FileText,
  Users,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface Mode {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  gradient: string
  features: string[]
}

const modes: Mode[] = [
  {
    id: "exploration",
    name: "探究モード",
    description: "問いを深める対話で、あなたの好奇心を刺激します。中高生〜大人向けの深掘り型対話で、CurioLoop機能で知識を広げます。",
    icon: <Search className="w-8 h-8" />,
    color: "text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    features: ["深掘り型対話", "CurioLoop機能", "知識の拡張", "好奇心の刺激"]
  },
  {
    id: "document",
    name: "ドキュメントモード",
    description: "資料ベースの対話で、PDFやテキストをアップロードして内容を理解し、対話を通じて学びを深めます。全世代向け。",
    icon: <FileText className="w-8 h-8" />,
    color: "text-green-400",
    gradient: "from-green-500 to-emerald-500",
    features: ["PDFアップロード", "テキスト解析", "内容理解", "対話学習"]
  },
  {
    id: "kids",
    name: "キッズモード",
    description: "やさしい対話で、小中学生が楽しく学べる環境を提供します。短文・絵文字を使用し、CurioLoopなしでシンプルな体験。",
    icon: <Users className="w-8 h-8" />,
    color: "text-yellow-400",
    gradient: "from-yellow-500 to-orange-500",
    features: ["やさしい対話", "絵文字使用", "シンプル体験", "楽しい学習"]
  },
  {
    id: "thinking",
    name: "思考整理モード",
    description: "書いたことの構造化を支援します。高校生以上向けで、Reflectorがあなたの思考を整理し、新しい視点を提供します。",
    icon: <Brain className="w-8 h-8" />,
    color: "text-purple-400",
    gradient: "from-purple-500 to-violet-500",
    features: ["思考の構造化", "Reflector機能", "新しい視点", "整理支援"]
  },
  {
    id: "emotion",
    name: "感情リフレクト",
    description: "感情整理と内省をサポートします。全年齢向けで、共感重視の静かな語り口で、あなたの感情を整理します。",
    icon: <Heart className="w-8 h-8" />,
    color: "text-pink-400",
    gradient: "from-pink-500 to-rose-500",
    features: ["感情整理", "内省サポート", "共感重視", "静かな語り口"]
  }
]

interface OnboardingGuideProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const currentMode = modes[currentStep]

  const nextStep = () => {
    if (currentStep < modes.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStart = () => {
    onClose()
    // ここでダッシュボードに遷移する処理を追加
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary/95 backdrop-blur-xl rounded-2xl max-w-lg w-full p-8 space-y-8 border border-border/20 shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-full blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                <h2 className="text-xl font-bold">Learning Agency</h2>
              </div>
            </div>
            <span className="text-text-muted text-sm font-medium">ガイド</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors duration-200 p-2 hover:bg-background-tertiary rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* モード紹介 */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            {/* アイコン */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${currentMode.gradient} rounded-2xl blur-xl opacity-20`}></div>
              <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${currentMode.gradient} ${currentMode.color} shadow-lg`}>
                {currentMode.icon}
              </div>
            </div>
            
            {/* タイトル */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-text">
                {currentMode.name}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
                {currentMode.description}
              </p>
            </div>

            {/* 機能リスト */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {currentMode.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-background-tertiary/50 border border-border/30 rounded-full text-xs text-text-secondary font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-text-muted">
            <span className="font-medium">{currentStep + 1} / {modes.length}</span>
            <span className="font-medium">{Math.round(((currentStep + 1) / modes.length) * 100)}%</span>
          </div>
          <div className="w-full bg-background-tertiary/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary-light h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / modes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 h-12 px-6 border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <ChevronLeft size={16} />
            <span>前へ</span>
          </Button>

          {currentStep === modes.length - 1 ? (
            <Button 
              onClick={handleStart} 
              className="flex items-center space-x-2 h-12 px-8 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-background font-semibold transition-all duration-300 group"
            >
              <span>始める</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          ) : (
            <Button 
              onClick={nextStep} 
              className="flex items-center space-x-2 h-12 px-8 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-background font-semibold transition-all duration-300 group"
            >
              <span>次へ</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          )}
        </div>

        {/* スキップボタン */}
        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-sm font-medium transition-colors duration-200 hover:underline"
          >
            スキップ
          </button>
        </div>
      </div>
    </div>
  )
}