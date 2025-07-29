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

    // キッズモード専用のレビュー生成システムプロンプト
    const systemPrompt = `あなたは「Reflector for Kids」という子どもの学習支援AIです。キッズモードでの対話履歴を分析し、以下の観点からレビューを生成してください：

## 1. 好奇心の発展 (Curiosity Development)
- 子どもの興味・関心の広がり
- 質問の質と深まり
- 新しい発見への意欲

## 2. 学習の進歩 (Learning Progress)
- 理解の深化と知識の定着
- 思考力と表現力の向上
- 学習意欲と自信の育成

## 3. 次の学びへの導き (Guidance for Next Learning)
- さらなる探究への方向性
- 実践・体験への橋渡し
- 継続的な学習習慣の形成

各セクションは200-250文字程度で、温かみがあり、子どもの成長を励ます表現を使用してください。日本語で回答してください。`

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
          { role: 'user', content: `以下のキッズモードでの対話履歴を分析してレビューを生成してください：\n\n${conversationText}` }
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
    const curiosityDevelopmentMatch = reviewContent.match(/## 1\. 好奇心の発展.*?\n(.*?)(?=\n## 2\. 学習の進歩|$)/s)
    const learningProgressMatch = reviewContent.match(/## 2\. 学習の進歩.*?\n(.*?)(?=\n## 3\. 次の学びへの導き|$)/s)
    const nextLearningMatch = reviewContent.match(/## 3\. 次の学びへの導き.*?\n(.*?)$/s)

    const review = {
      curiosity_development: curiosityDevelopmentMatch ? curiosityDevelopmentMatch[1].trim() : '好奇心の発展を抽出できませんでした。',
      learning_progress: learningProgressMatch ? learningProgressMatch[1].trim() : '学習の進歩を分析できませんでした。',
      next_learning_guidance: nextLearningMatch ? nextLearningMatch[1].trim() : '次の学びへの導きを提示できませんでした。'
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