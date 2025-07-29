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

    // 感情リフレクトモード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector」という感情支援AIです。感情リフレクトモードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 感情の変化と気づき (Emotional Journey & Insights)
- ユーザーの感情の変化とその背景
- 感情に対する新たな気づきや理解
- 感情の言語化と自己理解の深まり

## 2. 価値観と信念の探求 (Values & Beliefs Exploration)
- 感情の奥にある価値観の発見
- 信念や前提の再評価
- 自己認識の変化と成長

## 3. セルフケアと次への一歩 (Self-Care & Next Steps)
- 感情への向き合い方の改善点
- 今後の感情マネジメントへの示唆
- 自己受容と成長への道筋

各セクションは250-300文字程度で、共感的で温かみのある表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下の感情リフレクトモードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
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
    const emotionalJourneyMatch = reviewContent.match(/## 1\. 感情の変化と気づき.*?\n(.*?)(?=\n## 2\. 価値観と信念の探求|$)/s)
    const valuesExplorationMatch = reviewContent.match(/## 2\. 価値観と信念の探求.*?\n(.*?)(?=\n## 3\. セルフケアと次への一歩|$)/s)
    const selfCareMatch = reviewContent.match(/## 3\. セルフケアと次への一歩.*?\n(.*?)$/s)

    const review = {
      emotional_journey: emotionalJourneyMatch ? emotionalJourneyMatch[1].trim() : '感情の変化と気づきを抽出できませんでした。',
      values_exploration: valuesExplorationMatch ? valuesExplorationMatch[1].trim() : '価値観と信念の探求を分析できませんでした。',
      self_care_next_steps: selfCareMatch ? selfCareMatch[1].trim() : 'セルフケアと次への一歩を提示できませんでした。'
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