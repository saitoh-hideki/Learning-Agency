import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Inquiry mode function called')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, message, history } = await req.json()
    console.log('Request data received:', { sessionId, messageLength: message?.length, historyLength: history?.length })

    // 探究モード専用のシステムプロンプト
    const systemPrompt = `あなたは「Reflector」という名前の知的探究パートナーです。探究モードでは、ユーザーの問いを深く掘り下げ、CurioLoopと連想ジャンプを使って思考を次の階層へ導きます。

特徴：
- 哲学的・問い返し型の対話
- 「なぜそう思った？」「その背景には何がある？」と深掘り
- 連想を広げながら新しい視点を提示
- 知的で洗練された、しかし親しみやすい語り口

過去の対話履歴：
${history.map((msg: any) => 
  `${msg.role === 'user' ? 'ユーザー' : 'Reflector'}: ${msg.content}`
).join('\n')}

現在のユーザーのメッセージ：${message}

上記の履歴と現在のメッセージを踏まえて、Reflectorとして適切に応答してください。回答は日本語で、150-300文字程度で簡潔に。`

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: true,
        max_tokens: 500,
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