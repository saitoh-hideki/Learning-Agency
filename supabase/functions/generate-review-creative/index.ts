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

    // 創造モード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector」という創造支援AIです。創造モードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 創造的思考の展開 (Creative Thinking Expansion)
- 視点の転換と発想の広がり
- 制約からの解放と可能性の拡張
- 異なる領域の組み合わせと融合

## 2. アイデアの質と多様性 (Idea Quality & Diversity)
- 生成されたアイデアの独創性
- アイデア間の多様性と関連性
- 実現可能性と革新性のバランス

## 3. 創造プロセスの最適化 (Creative Process Optimization)
- 創造的思考のプロセス改善点
- アイデア実現への具体的ステップ
- 継続的な創造性向上への示唆

各セクションは250-300文字程度で、創造的で革新的な表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下の創造モードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
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
    const creativeExpansionMatch = reviewContent.match(/## 1\. 創造的思考の展開.*?\n(.*?)(?=\n## 2\. アイデアの質と多様性|$)/s)
    const ideaQualityMatch = reviewContent.match(/## 2\. アイデアの質と多様性.*?\n(.*?)(?=\n## 3\. 創造プロセスの最適化|$)/s)
    const processOptimizationMatch = reviewContent.match(/## 3\. 創造プロセスの最適化.*?\n(.*?)$/s)

    const review = {
      creative_expansion: creativeExpansionMatch ? creativeExpansionMatch[1].trim() : '創造的思考の展開を抽出できませんでした。',
      idea_quality_diversity: ideaQualityMatch ? ideaQualityMatch[1].trim() : 'アイデアの質と多様性を分析できませんでした。',
      process_optimization: processOptimizationMatch ? processOptimizationMatch[1].trim() : '創造プロセスの最適化を提示できませんでした。'
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