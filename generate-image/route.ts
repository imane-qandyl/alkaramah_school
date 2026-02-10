import { NextRequest, NextResponse } from "next/server"
import { createZaiClient } from "@/lib/zai"
import { EnhancedImageGenerator } from "@/lib/enhancedImageGeneration"

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 9)
  console.log(`[${requestId}] Enhanced image generation request started`)

  try {
    const { 
      action, 
      styleNote, 
      size = "768x768",
      stylePreset = "autism-friendly",
      qualityLevel = "child-friendly",
      generateVariations = false,
      negativePrompt = "",
      seed = null
    } = await request.json()

    console.log(`[${requestId}] Parsed body:`, { 
      actionLength: action?.length, 
      styleNote, 
      size, 
      stylePreset, 
      qualityLevel,
      generateVariations
    })

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      )
    }

    const validSizes = ["768x768", "1024x1024", "512x512"]
    if (!validSizes.includes(size)) {
      return NextResponse.json(
        { error: `Invalid size. Must be one of: ${validSizes.join(", ")}` },
        { status: 400 }
      )
    }

    console.log(`[${requestId}] Creating Z SDK client...`)
    const zai = await createZaiClient()
    const enhancedGenerator = new EnhancedImageGenerator(zai)
    console.log(`[${requestId}] Enhanced generator created`)

    // Generate style variations if requested
    if (generateVariations) {
      console.log(`[${requestId}] Generating style variations...`)
      const variations = await enhancedGenerator.generateStyleVariations(action)
      
      if (variations.success) {
        console.log(`[${requestId}] Style variations generated successfully`)
        return NextResponse.json({
          success: true,
          variations: variations.variations,
          summary: variations.summary
        })
      } else {
        throw new Error("Failed to generate style variations")
      }
    }

    // Generate single enhanced image
    console.log(`[${requestId}] Generating enhanced image...`)
    const result = await enhancedGenerator.generateEnhancedImage({
      action,
      stylePreset,
      qualityLevel,
      customStyle: styleNote,
      size,
      negativePrompt,
      seed
    })

    if (result.success) {
      console.log(`[${requestId}] Enhanced image generated successfully`)
      return NextResponse.json({
        success: true,
        image: result.image,
        metadata: result.metadata,
        availableStyles: enhancedGenerator.getAvailableStyles(),
        availableQualityLevels: enhancedGenerator.getAvailableQualityLevels()
      })
    } else {
      throw new Error(result.error || "Enhanced image generation failed")
    }

  } catch (error) {
    console.error(`[${requestId}] Error generating enhanced image:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error(`[${requestId}] Error details:`, { 
      message: errorMessage,
      stack: errorStack?.slice(0, 500)
    })

    return NextResponse.json(
      { 
        success: false,
        error: "Failed to generate enhanced image", 
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
