import { NextRequest, NextResponse } from "next/server"
import { createZaiClient } from "@/lib/zai"

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 9)
  console.log(`[${requestId}] Image generation request started`)

  try {
    const { action, styleNote, size = "768x768" } = await request.json()

    console.log(`[${requestId}] Parsed body:`, { actionLength: action?.length, styleNote, size })

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      )
    }

    const validSizes = ["768x768", "1024x1024"]
    if (!validSizes.includes(size)) {
      return NextResponse.json(
        { error: `Invalid size. Must be one of: ${validSizes.join(", ")}` },
        { status: 400 }
      )
    }

    const prompt = `Simple autism-friendly illustration of a child performing this action: "${action}". 
Style: educational visual schedule, clear action, soft colors, plain background, no text or labels anywhere. ${styleNote || ""}`

    console.log(`[${requestId}] Creating Z SDK client...`)
    const zai = await createZaiClient()
    console.log(`[${requestId}] Z SDK client created`)

    console.log(`[${requestId}] Calling image generation API with prompt length: ${prompt.length}`)
    const response = await zai.images.generations.create({
      prompt,
      size: size,
      n: 1,
    })

    console.log(`[${requestId}] SDK response received, type:`, typeof response)
    console.log(`[${requestId}] SDK response keys:`, Object.keys(response || {}))

    if (!response) {
      throw new Error("No response from SDK")
    }

    if (!response.data) {
      console.error(`[${requestId}] No data field in response:`, response)
      throw new Error("No data field in SDK response")
    }

    if (!Array.isArray(response.data)) {
      console.error(`[${requestId}] response.data is not an array:`, typeof response.data)
      throw new Error("response.data is not an array")
    }

    if (!response.data[0]) {
      console.error(`[${requestId}] response.data[0] is empty`)
      throw new Error("No image in response.data[0]")
    }

    const imageBase64 = response.data[0].base64
    
    if (!imageBase64) {
      console.error(`[${requestId}] No base64 in response.data[0]:`, Object.keys(response.data[0] || {}))
      throw new Error("No base64 in response.data[0]")
    }

    const dataUrl = `data:image/png;base64,${imageBase64}`
    console.log(`[${requestId}] Image generated successfully, size: ${imageBase64.length}`)
    return NextResponse.json({ image: dataUrl })
  } catch (error) {
    console.error(`[${requestId}] Error generating image:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error(`[${requestId}] Error details:`, { 
      message: errorMessage,
      stack: errorStack?.slice(0, 500)
    })

    return NextResponse.json(
      { 
        error: "Failed to generate image", 
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
