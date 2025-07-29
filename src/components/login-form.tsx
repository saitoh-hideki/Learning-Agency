"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Sparkles, ArrowRight, Eye, EyeOff, Info, BookOpen } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // 初回ロード時のアニメーション
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    // 実際のGoogleログイン処理をここに実装
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  const handleEmailLogin = async () => {
    setIsLoading(true)
    // 実際のメールログイン処理をここに実装
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-[#0F0F0F] via-[#101928] to-[#070707] flex items-center justify-center p-6 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/8 via-transparent to-blue-500/8" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/12 to-blue-500/12 rounded-full blur-3xl" />
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-500/8 to-pink-500/8 rounded-full blur-3xl" />
      
      {/* 抽象的な背景線と点 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <div className="absolute bottom-1/3 left-1/3 w-40 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        {/* 思考を表す点 */}
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-600" />
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        {/* ロゴセクション */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 mr-5 drop-shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-wide text-white">Learning Agency</h1>
          </div>
          <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200" />
          </div>
        </div>

        {/* キャッチコピー */}
        <div className={`text-center mb-16 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-2xl font-semibold text-white mb-6 tracking-wide leading-tight">
            学びは、対話から生まれる
          </h2>
          <p className="text-gray-400 leading-relaxed tracking-wide text-base">
            Reflectorと共に、<br />
            あなたの問いと気づきの地図を描いていこう。
          </p>
        </div>

        {/* ログインフォーム */}
        <div className={`space-y-8 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Googleログインボタン */}
          <div className="flex justify-center">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-72 bg-white hover:bg-gray-50 text-black font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span>Googleで続ける</span>
              </div>
            </Button>
          </div>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-radial from-[#0F0F0F] via-[#101928] to-[#070707] text-zinc-500 font-medium tracking-wide">または</span>
            </div>
          </div>

          {/* メールアドレス入力 */}
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="メールアドレス"
              className="w-full bg-zinc-900/80 border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-4 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
            />
          </div>

          {/* パスワード入力 */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                className="w-full bg-zinc-900/80 border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-4 pr-12 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ログインボタン */}
          <Button
            onClick={handleEmailLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-center space-x-3">
              <span>ログイン</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Button>

          {/* ローディング状態 */}
          {isLoading && (
            <div className="flex items-center justify-center space-x-2 text-cyan-400">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">ログイン中...</span>
            </div>
          )}
        </div>

        {/* フッターリンク */}
        <div className={`mt-16 flex items-center justify-between transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">初回ガイドを見る</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2"
          >
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">利用規約</span>
          </Button>
        </div>

        {/* ブランドメッセージ */}
        <div className={`mt-20 text-center transition-all duration-1000 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs text-zinc-600 tracking-wide font-medium">
            思考する習慣を、ここから
          </p>
        </div>
      </div>
    </div>
  )
}