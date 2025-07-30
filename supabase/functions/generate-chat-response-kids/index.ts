import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// キッズモード専用のシステムプロンプト（v2）
const systemPrompt = `あなたは Reflector for Kids。子どもの好奇心を伸ばすフレンドリー AI。

▼応答構成
1. **褒め言葉＋絵文字1つ**。
2. **わかりやすい説明（句点多め、1文20字以内）**。
3. **楽しい問いかけ** : 2問。
4. **次にやってみよう提案**。

語尾は「〜だね！」「〜してみよう！」など元気に。

基本ルール：
• 1返信 ≒300-400字。1段落 3〜4文で改行。
• 敬語だがフレンドリー。「です・ます」調。
• 箇条書きを使う場合は "・" を使用。番号付けは半角数字+". "。
• 強調は **太字** で。絵文字は Kids モードのみ可。
• 最後に必ず1つ "ユーザーへの問い" で締める。`

serve(async (req) => {
  console.log('Kids mode function called')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, message, history } = await req.json()
    console.log('Request data received:', { sessionId, messageLength: message?.length, historyLength: history?.length })

    // 過去の対話履歴をフォーマット
    const historyText = history.map((msg: any) => 
      `${msg.role === 'user' ? 'ユーザー' : 'Reflector'}: ${msg.content}`
    ).join('\n')

    // システムプロンプトに履歴と現在のメッセージを組み込み
    const fullPrompt = `${systemPrompt}

過去の対話履歴：
${historyText}

現在のユーザーのメッセージ：${message}

上記の履歴と現在のメッセージを踏まえて、Reflectorとして適切に応答してください。`

    console.log('Calling OpenAI API')
    
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
          { role: 'system', content: fullPrompt },
          { role: 'user', content: message }
        ],
        stream: true,
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    console.log('OpenAI response status:', response.status, response.statusText)

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    if (!response.body) {
      console.error('No response body from OpenAI')
      throw new Error('No response body from OpenAI')
    }

    console.log('Creating streaming response')

    // ストリーミングレスポンスを返す
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let chunkCount = 0

        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              console.log('OpenAI stream completed, total chunks:', chunkCount)
              break
            }

            chunkCount++
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                
                if (data === '[DONE]') {
                  console.log('OpenAI stream marked as done')
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content))
                  }
                } catch (parseError) {
                  console.log('JSON parse error, continuing')
                  // JSONパースエラーは無視して続行
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Streaming error occurred:', streamError)
          controller.enqueue(new TextEncoder().encode('\n\n[応答が途中で中断されました。もう一度お試しください。]'))
        } finally {
          try {
            reader.releaseLock()
          } catch (releaseError) {
            console.log('Reader release error:', releaseError)
          }
          controller.close()
        }
      }
    })

    console.log('Returning streaming response')
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
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