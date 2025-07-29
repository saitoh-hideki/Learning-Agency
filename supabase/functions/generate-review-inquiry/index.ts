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

    // 探究モード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector」という探究支援AIです。探究モードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 探究の軌跡 (Inquiry Journey)
- ユーザーの問いの深化と変化
- 探究の方向性の転換点
- 新たに発見された視点やアプローチ

## 2. 思考の進化 (Evolution of Thinking)
- 初期の問いから最終的な洞察への発展
- 思考の階層的な深まり
- 前提や仮説の更新・修正

## 3. 次の探究への示唆 (Next Inquiry Directions)
- さらに深掘りすべき問い
- 関連する探究領域の提案
- 実践・検証への橋渡し

各セクションは250-300文字程度で、探究の本質を捉えた知的で洗練された表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下の探究モードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
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
    const inquiryJourneyMatch = reviewContent.match(/## 1\. 探究の軌跡.*?\n(.*?)(?=\n## 2\. 思考の進化|$)/s)
    const evolutionMatch = reviewContent.match(/## 2\. 思考の進化.*?\n(.*?)(?=\n## 3\. 次の探究への示唆|$)/s)
    const nextDirectionsMatch = reviewContent.match(/## 3\. 次の探究への示唆.*?\n(.*?)$/s)

    const review = {
      inquiry_journey: inquiryJourneyMatch ? inquiryJourneyMatch[1].trim() : '探究の軌跡を抽出できませんでした。',
      evolution_of_thinking: evolutionMatch ? evolutionMatch[1].trim() : '思考の進化を分析できませんでした。',
      next_directions: nextDirectionsMatch ? nextDirectionsMatch[1].trim() : '次の探究への示唆を提示できませんでした。'
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