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

    // リフレクションモード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector」という内省支援AIです。リフレクションモードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 経験の意味づけ (Meaning Making)
- 経験から抽出された重要な気づき
- 経験の背景と文脈の理解
- 個人の成長への影響と意義

## 2. メタ認知の発達 (Metacognitive Development)
- 自己の思考プロセスの理解
- 感情と行動の関係性の洞察
- 学習パターンと改善点の認識

## 3. 未来への応用 (Future Application)
- 経験から得た知見の活用方法
- 類似状況での行動改善
- 継続的な学習と成長への示唆

各セクションは250-300文字程度で、内省的で深みのある表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下のリフレクションモードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
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
    const meaningMakingMatch = reviewContent.match(/## 1\. 経験の意味づけ.*?\n(.*?)(?=\n## 2\. メタ認知の発達|$)/s)
    const metacognitiveMatch = reviewContent.match(/## 2\. メタ認知の発達.*?\n(.*?)(?=\n## 3\. 未来への応用|$)/s)
    const futureApplicationMatch = reviewContent.match(/## 3\. 未来への応用.*?\n(.*?)$/s)

    const review = {
      meaning_making: meaningMakingMatch ? meaningMakingMatch[1].trim() : '経験の意味づけを抽出できませんでした。',
      metacognitive_development: metacognitiveMatch ? metacognitiveMatch[1].trim() : 'メタ認知の発達を分析できませんでした。',
      future_application: futureApplicationMatch ? futureApplicationMatch[1].trim() : '未来への応用を提示できませんでした。'
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