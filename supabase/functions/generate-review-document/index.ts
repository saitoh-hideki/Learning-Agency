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

    // ドキュメントモード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector」という資料分析AIです。ドキュメントモードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 資料理解の深化 (Deepening Understanding)
- 資料の核心的な内容の把握
- 論理構造と論拠の理解
- 前提条件と想定読者の認識

## 2. 批判的思考の発展 (Critical Thinking Development)
- 資料に対する批判的な問いの質
- 論拠の妥当性の検討
- 異なる視点からの分析

## 3. 応用と発展の可能性 (Application & Extension)
- 資料内容の実践への応用
- 関連分野への拡張可能性
- さらなる探究への方向性

各セクションは250-300文字程度で、分析的で論理的な表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下のドキュメントモードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
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
    const understandingMatch = reviewContent.match(/## 1\. 資料理解の深化.*?\n(.*?)(?=\n## 2\. 批判的思考の発展|$)/s)
    const criticalThinkingMatch = reviewContent.match(/## 2\. 批判的思考の発展.*?\n(.*?)(?=\n## 3\. 応用と発展の可能性|$)/s)
    const applicationMatch = reviewContent.match(/## 3\. 応用と発展の可能性.*?\n(.*?)$/s)

    const review = {
      deepening_understanding: understandingMatch ? understandingMatch[1].trim() : '資料理解の深化を抽出できませんでした。',
      critical_thinking: criticalThinkingMatch ? criticalThinkingMatch[1].trim() : '批判的思考の発展を分析できませんでした。',
      application_extension: applicationMatch ? applicationMatch[1].trim() : '応用と発展の可能性を提示できませんでした。'
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