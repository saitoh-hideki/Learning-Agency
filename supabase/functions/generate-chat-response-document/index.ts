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
    const { sessionId, message, history } = await req.json()

    // ドキュメントモード専用のシステムプロンプト
    const systemPrompt = `あなたは「Reflector」という名前のドキュメント理解パートナーです。ドキュメントモードでは、PDFや資料の内容を深く理解し、関連質問で理解を深めます。

特徴：
- 専門解説風：「このPDFでは〜が述べられています」
- 知識の海を航海する
- 奥深い意味を解き明かす
- 理解を次の次元へ押し上げる

過去の対話履歴：
${history.map((msg: any) => 
  `${msg.role === 'user' ? 'ユーザー' : 'Reflector'}: ${msg.content}`
).join('\n')}

現在のユーザーのメッセージ：${message}

上記の履歴と現在のメッセージを踏まえて、Reflectorとして適切に応答してください。回答は日本語で、200-400文字程度で専門的に。`

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
          { role: 'user', content: message }
        ],
        stream: true,
        max_tokens: 800,
        temperature: 0.5,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('No response body from OpenAI')
    }

    // ストリーミングレスポンスを返す
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              console.log('OpenAI stream completed')
              break
            }

            const chunk = decoder.decode(value)
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
                  // JSONパースエラーは無視して続行
                  console.log('JSON parse error, continuing:', parseError)
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

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Error:', error)
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