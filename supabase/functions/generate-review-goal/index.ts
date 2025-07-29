import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, messages } = await req.json()

    // 会話履歴をテキストに変換
    const conversationText = messages.map((msg: any) => 
      `${msg.role === 'user' ? 'ユーザー' : 'Reflector'}: ${msg.content}`
    ).join('\n\n')

    // 目標モード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector」という目標達成支援AIです。目標モードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 目標設定の質 (Goal Setting Quality)
- SMART目標の適切性と明確性
- 目標の現実性と挑戦性のバランス
- 目標の意義と価値の認識

## 2. 計画実行の進捗 (Plan Execution Progress)
- 具体的なアクションプランの実装
- 進捗管理と調整の効果
- 障害への対応と解決策

## 3. 継続的改善への示唆 (Continuous Improvement Guidance)
- 目標達成に向けた次のステップ
- 学習と成長の継続方法
- モチベーション維持の戦略

各セクションは250-300文字程度で、実践的で建設的な表現を使用してください。日本語で回答してください。`

    // OpenAI APIを呼び出し
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `以下の目標モードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const reviewContent = result.choices[0].message.content

    // レビュー内容を構造化
    const goalSettingMatch = reviewContent.match(/## 1\. 目標設定の質.*?\n(.*?)(?=\n## 2\. 計画実行の進捗|$)/s)
    const executionProgressMatch = reviewContent.match(/## 2\. 計画実行の進捗.*?\n(.*?)(?=\n## 3\. 継続的改善への示唆|$)/s)
    const continuousImprovementMatch = reviewContent.match(/## 3\. 継続的改善への示唆.*?\n(.*?)$/s)

    const review = {
      goal_setting_quality: goalSettingMatch ? goalSettingMatch[1].trim() : '目標設定の質を抽出できませんでした。',
      execution_progress: executionProgressMatch ? executionProgressMatch[1].trim() : '計画実行の進捗を分析できませんでした。',
      continuous_improvement: continuousImprovementMatch ? continuousImprovementMatch[1].trim() : '継続的改善への示唆を提示できませんでした。'
    }

    return new Response(
      JSON.stringify(review),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
}) 