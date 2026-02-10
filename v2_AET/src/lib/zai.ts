type SdkEnvelope<T> = { success?: boolean; data?: T; error?: string; message?: string }

type ZaiClient = {
  chat: {
    completions: {
      create: (payload: Record<string, unknown>) => Promise<unknown>
      createVision: (payload: Record<string, unknown>) => Promise<unknown>
    }
  }
  images: {
    generations: {
      create: (payload: Record<string, unknown>) => Promise<unknown>
      edit: (payload: Record<string, unknown>) => Promise<unknown>
    }
  }
}

function getSdkConfig() {
  const sdkBaseUrl = process.env.SDK_BASE_URL || process.env.ZAI_BASE_URL
  const sdkApiKey = process.env.SDK_API_KEY || process.env.ZAI_API_KEY

  if (!sdkBaseUrl) {
    throw new Error('SDK_BASE_URL is required')
  }

  if (!sdkApiKey) {
    throw new Error('SDK_API_KEY is required')
  }

  return {
    baseUrl: sdkBaseUrl.replace(/\/$/, ''),
    apiKey: sdkApiKey,
  }
}

function unwrapSdkData<T>(payload: SdkEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as SdkEnvelope<T>).data as T
  }

  return payload as T
}

function normalizeVisionPayload(payload: Record<string, unknown>) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const normalizedMessages = messages.map((message) => {
    if (!message || typeof message !== 'object') {
      return message
    }

    const typedMessage = message as Record<string, unknown>
    const content = typedMessage.content
    if (!Array.isArray(content)) {
      return typedMessage
    }

    let textContent = ''
    let imageUrl: string | undefined

    for (const part of content) {
      if (!part || typeof part !== 'object') {
        continue
      }

      const partRecord = part as Record<string, unknown>
      if (partRecord.type === 'text' && typeof partRecord.text === 'string') {
        textContent = partRecord.text
      }

      if (partRecord.type === 'image_url') {
        const rawImageUrl = partRecord.image_url
        if (typeof rawImageUrl === 'string') {
          imageUrl = rawImageUrl
        } else if (rawImageUrl && typeof rawImageUrl === 'object') {
          const imageUrlRecord = rawImageUrl as Record<string, unknown>
          if (typeof imageUrlRecord.url === 'string') {
            imageUrl = imageUrlRecord.url
          }
        }
      }
    }

    if (!imageUrl && typeof typedMessage.image === 'string') {
      imageUrl = typedMessage.image
    }
    if (!imageUrl && typeof typedMessage.image_url === 'string') {
      imageUrl = typedMessage.image_url
    }

    let finalImageUrl = imageUrl
    if (imageUrl && imageUrl.startsWith('data:')) {
      const base64Match = imageUrl.match(/;base64,(.+)/)
      if (base64Match && base64Match[1]) {
        console.log('[normalizeVisionPayload] Data URL detected, base64 length:', base64Match[1].length)
      }
      finalImageUrl = imageUrl
    }
    
    return {
      role: typedMessage.role,
      content: textContent || typedMessage.content,
      ...(finalImageUrl ? { image_url: finalImageUrl } : {}),
    }
  })

  if (normalizedMessages.length > 0) {
    const firstMsg = normalizedMessages[0] as Record<string, unknown>
    console.log('[normalizeVisionPayload] content length:', typeof firstMsg.content === 'string' ? firstMsg.content.length : 0)
    console.log('[normalizeVisionPayload] image_url present:', !!firstMsg.image_url)
  }

  const sanitized: Record<string, unknown> = {
    messages: normalizedMessages,
  }

  if (typeof payload.model === 'string') {
    sanitized.model = payload.model
  }

  if (typeof payload.temperature === 'number') {
    sanitized.temperature = payload.temperature
  }

  if (typeof payload.max_tokens === 'number') {
    sanitized.max_tokens = payload.max_tokens
  }

  if (typeof payload.top_p === 'number') {
    sanitized.top_p = payload.top_p
  }

  if (typeof payload.stream === 'boolean') {
    sanitized.stream = payload.stream
  }

  return sanitized
}

async function sdkRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { baseUrl, apiKey } = getSdkConfig()

  console.log(`[SDK] ${path} payload keys:`, Object.keys(body))

  const controller = new AbortController()
  // Use shorter timeout for image generation (60s), longer for other requests (120s)
  const timeoutMs = path.includes('/image/') ? 60000 : 120000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  console.log(`[SDK] ${path} request start (timeout ${timeoutMs}ms)`)

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (error) {
    clearTimeout(timeoutId)
    const message = error instanceof Error ? error.message : 'Unknown fetch error'
    console.error(`[SDK] ${path} request error:`, message)
    throw error
  }

  clearTimeout(timeoutId)

  console.log(`[SDK] ${path} response status:`, response.status)

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error(`[SDK] ${path} response status:`, response.status)
    console.error(`[SDK] ${path} response body:`, text.slice(0, 1000))
    throw new Error(`SDK request failed (${response.status}): ${text || response.statusText}`)
  }

  const payload = (await response.json()) as SdkEnvelope<T> | T
  return unwrapSdkData(payload)
}

export async function createZaiClient(): Promise<ZaiClient> {
  return {
    chat: {
      completions: {
        create: async (payload) => sdkRequest('/llm/chat', payload),
        createVision: async (payload) => sdkRequest('/vlm/chat', normalizeVisionPayload(payload)),
      },
    },
    images: {
      generations: {
        create: async (payload) => sdkRequest('/image/generate', payload),
        edit: async (payload) => {
          const editPayload = payload as Record<string, unknown>
          const prompt = editPayload.prompt as string
          const size = (editPayload.size as string) || '1024x1024'
          
          console.log('[SDK] [image.edit] calling /image/generate for edit')
          
          return sdkRequest('/image/generate', {
            prompt: prompt,
            size: size,
            n: 1,
          })
        },
      },
    },
  }
}
