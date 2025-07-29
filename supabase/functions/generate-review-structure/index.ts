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

    // 思考整理モード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector」という思考整理AIです。思考整理モードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 構造化の進歩 (Structural Progress)
- 課題の明確化と再定義の質
- 選択されたフレームワークの適切性
- 論理構造の整理と体系化

## 2. 思考の体系化 (Systematic Thinking)
- 複雑な問題の分解と整理
- 要素間の関係性の把握
- 抜け漏れの特定と補完

## 3. 実践への橋渡し (Bridge to Practice)
- 整理された思考の実装可能性
- 次のアクションステップの明確化
- 継続的な改善への示唆

各セクションは250-300文字程度で、論理的で構造的な表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下の思考整理モードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
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
    const structuralProgressMatch = reviewContent.match(/## 1\. 構造化の進歩.*?\n(.*?)(?=\n## 2\. 思考の体系化|$)/s)
    const systematicThinkingMatch = reviewContent.match(/## 2\. 思考の体系化.*?\n(.*?)(?=\n## 3\. 実践への橋渡し|$)/s)
    const bridgeToPracticeMatch = reviewContent.match(/## 3\. 実践への橋渡し.*?\n(.*?)$/s)

    const review = {
      structural_progress: structuralProgressMatch ? structuralProgressMatch[1].trim() : '構造化の進歩を抽出できませんでした。',
      systematic_thinking: systematicThinkingMatch ? systematicThinkingMatch[1].trim() : '思考の体系化を分析できませんでした。',
      bridge_to_practice: bridgeToPracticeMatch ? bridgeToPracticeMatch[1].trim() : '実践への橋渡しを提示できませんでした。'
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