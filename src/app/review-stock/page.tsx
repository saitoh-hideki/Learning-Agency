"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  Edit3, 
  Eye,
  Calendar,
  Clock,
  Tag,
  MessageCircle,
  Brain,
  Heart,
  Target,
  BookOpen,
  Zap,
  User,
  Lightbulb,
  Sparkles
} from "lucide-react"

interface ReviewStock {
  id: string
  title: string
  insights: string
  summary: string
  deep_dive: string
  created_at: string
  session_id: string
}

export default function ReviewStockPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<ReviewStock[]>([])
  const [filteredReviews, setFilteredReviews] = useState<ReviewStock[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ReviewStock | null>(null)

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    // 検索フィルタリング
    const filtered = reviews.filter(review =>
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.insights?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredReviews(filtered)
  }, [reviews, searchTerm])

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      
      // 匿名ユーザーのセッションIDを取得（実際の実装では適切なユーザー管理を行う）
      const sessionId = localStorage.getItem('session_id') || `session_${Date.now()}`
      localStorage.setItem('session_id', sessionId)

      const { data, error } = await supabase
        .from('review_stocks')
        .select('*')
        .eq('user_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading reviews:', error)
        return
      }

      setReviews(data || [])
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleReviewClick = (review: ReviewStock) => {
    setSelectedReview(review)
  }

  const handleCloseReview = () => {
    setSelectedReview(null)
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('review_stocks')
        .delete()
        .eq('id', reviewId)

      if (error) {
        console.error('Error deleting review:', error)
        return
      }

      setReviews(reviews.filter(r => r.id !== reviewId))
      if (selectedReview?.id === reviewId) {
        setSelectedReview(null)
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* ヘッダー */}
      <header className="border-b border-zinc-800/30 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ダッシュボード
              </Button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">レビューストック</h1>
                <p className="text-xs text-zinc-500 font-medium tracking-wide">Review Stock</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* レビュー一覧 */}
        <div className={`flex-1 flex flex-col ${selectedReview ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
          <div className="p-6">
            {/* 検索バー */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="レビューを検索..."
                  className="pl-10 bg-zinc-900/60 backdrop-blur-sm border-zinc-700/30 text-white placeholder-zinc-400 focus:ring-cyan-400"
                />
              </div>
            </div>

            {/* レビューリスト */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                  <p className="text-zinc-400 mt-4">読み込み中...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-300 mb-2">レビューがありません</h3>
                  <p className="text-zinc-400">チャットセッションでレビューを生成すると、ここに保存されます。</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    onClick={() => handleReviewClick(review)}
                    className={`p-4 rounded-xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 cursor-pointer transition-all duration-200 hover:bg-zinc-800/60 ${
                      selectedReview?.id === review.id ? 'ring-2 ring-cyan-400' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">
                          {review.title || '無題のレビュー'}
                        </h3>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                          {review.summary}
                        </p>
                        <div className="flex items-center text-xs text-zinc-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteReview(review.id)
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* レビュー詳細 */}
        {selectedReview && (
          <div className="w-1/2 border-l border-zinc-800/30 bg-zinc-900/20 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">レビュー詳細</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseReview}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    閉じる
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">タイトル</h3>
                  <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-xl p-4">
                    <p className="text-sm text-zinc-300">{selectedReview.title || '無題のレビュー'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">気づき</h3>
                  <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-xl p-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedReview.insights}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">要約</h3>
                  <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-xl p-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedReview.summary}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">深掘り視点</h3>
                  <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-xl p-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedReview.deep_dive}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">作成日時</h3>
                  <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/30 rounded-xl p-4">
                    <p className="text-sm text-zinc-300">{formatDate(selectedReview.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 