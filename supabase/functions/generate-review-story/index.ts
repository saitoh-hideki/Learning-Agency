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

    // ストーリーモード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector」というストーリー支援AIです。ストーリーモードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 物語構造の深化 (Narrative Structure Development)
- ストーリーの起承転結の明確化
- キャラクターと設定の豊かさ
- 物語の一貫性と説得力

## 2. 語りの力の向上 (Storytelling Power Enhancement)
- 感情と体験の表現力
- 読者・聞き手への共感喚起
- 物語の普遍性と個別性のバランス

## 3. ストーリーの可能性 (Story Potential)
- 物語の拡張と発展の方向性
- 異なる視点からの再解釈
- 実生活への応用と影響

各セクションは250-300文字程度で、物語的で魅力的な表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下のストーリーモードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
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
    const narrativeStructureMatch = reviewContent.match(/## 1\. 物語構造の深化.*?\n(.*?)(?=\n## 2\. 語りの力の向上|$)/s)
    const storytellingPowerMatch = reviewContent.match(/## 2\. 語りの力の向上.*?\n(.*?)(?=\n## 3\. ストーリーの可能性|$)/s)
    const storyPotentialMatch = reviewContent.match(/## 3\. ストーリーの可能性.*?\n(.*?)$/s)

    const review = {
      narrative_structure: narrativeStructureMatch ? narrativeStructureMatch[1].trim() : '物語構造の深化を抽出できませんでした。',
      storytelling_power: storytellingPowerMatch ? storytellingPowerMatch[1].trim() : '語りの力の向上を分析できませんでした。',
      story_potential: storyPotentialMatch ? storyPotentialMatch[1].trim() : 'ストーリーの可能性を提示できませんでした。'
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