"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import { OnboardingGuide } from "@/components/onboarding-guide"
import { MessageCircle, Sparkles } from "lucide-react"

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/5" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-primary-light/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* グリッドパターン */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* メインコンテンツ */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* フッター */}
      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-2 text-text-muted text-sm">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">Learning Agency - 学びは、対話から生まれる</span>
        </div>
      </footer>

      {/* オンボーディングガイド */}
      {showOnboarding && (
        <OnboardingGuide isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}
