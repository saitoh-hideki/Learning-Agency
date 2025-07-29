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
    const { sessionId, messages, modeId } = await req.json()

    // 会話履歴をテキストに変換
    const conversationText = messages.map((msg: any) => 
      `${msg.role === 'user' ? 'ユーザー' : 'Reflector'}: ${msg.content}`
    ).join('\n\n')

    // レビュー生成のシステムプロンプト
    const systemPrompt = `あなたは「Reflector」という名前の対話分析パートナーです。与えられた会話履歴を分析し、以下の3つの観点からレビューを生成してください：

## 1. 気づき (Insights)
- 会話の中で見えてきた重要な気づきや発見
- ユーザーの思考パターンや価値観の変化
- 新しく生まれた視点やアイデア

## 2. 要約 (Summary)
- 会話の全体像と主要なテーマ
- 議論された主要なポイント
- 達成された成果や進展

## 3. 深掘り視点 (Deep Dive Perspectives)
- さらに探究すべき方向性
- 関連する分野や視点の提案
- 次のステップへの示唆

各セクションは200-300文字程度で、知的で洗練された表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下の会話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const reviewContent = result.choices[0].message.content

    // レビュー内容を構造化
    const insightsMatch = reviewContent.match(/## 1\. 気づき.*?\n(.*?)(?=\n## 2\. 要約|$)/s)
    const summaryMatch = reviewContent.match(/## 2\. 要約.*?\n(.*?)(?=\n## 3\. 深掘り視点|$)/s)
    const deepDiveMatch = reviewContent.match(/## 3\. 深掘り視点.*?\n(.*?)$/s)

    const review = {
      insights: insightsMatch ? insightsMatch[1].trim() : '気づきを抽出できませんでした。',
      summary: summaryMatch ? summaryMatch[1].trim() : '要約を生成できませんでした。',
      deep_dive: deepDiveMatch ? deepDiveMatch[1].trim() : '深掘り視点を提示できませんでした。'
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