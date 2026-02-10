import { NextRequest, NextResponse } from 'next/server'
import { createZaiClient } from '@/lib/zai'
import { EnhancedImageGenerator } from '@/lib/enhancedImageGeneration'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 9)
  console.log(`[${requestId}] Social story generation request started`)

  try {
    const { 
      scenario, 
      contexts = ['home', 'school', 'community'],
      includeEmotions = true,
      includeSocialCues = true,
      generateImages = true,
      targetAge = 'elementary'
    } = await request.json()

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario is required' },
        { status: 400 }
      )
    }

    console.log(`[${requestId}] Creating Z SDK client...`)
    const zai = await createZaiClient()
    const enhancedGenerator = new EnhancedImageGenerator(zai)

    // Generate social story narrative
    const agePrompts = {
      'preschool': 'Use very simple words and short sentences. Focus on basic concepts.',
      'elementary': 'Use clear, simple language appropriate for ages 6-11.',
      'middle': 'Use more detailed explanations suitable for ages 12-14.',
      'high': 'Include more complex social nuances for ages 15-18.'
    }

    const prompt = `Create a social story about: "${scenario}"

Target age: ${targetAge}
Language level: ${agePrompts[targetAge] || agePrompts['elementary']}
Include emotions: ${includeEmotions}
Include social cues: ${includeSocialCues}
Contexts: ${contexts.join(', ')}

Create a structured social story with:
1. Introduction (what the scenario is about)
2. Context-specific situations for each environment
3. Expected behaviors and responses
4. Emotional regulation strategies if relevant
5. Positive outcomes

Format as JSON:
{
  "title": "Social Story Title",
  "introduction": "Brief introduction paragraph",
  "situations": [
    {
      "context": "home|school|community",
      "description": "Detailed scenario description",
      "expectedBehavior": "What to do in this situation",
      "socialCues": "What to look for (if includeSocialCues is true)",
      "emotions": "How you might feel and how to handle it (if includeEmotions is true)",
      "visualDescription": "Description for image generation"
    }
  ],
  "conclusion": "Positive reinforcement and summary"
}`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in creating social stories for autistic individuals. Create clear, supportive, and practical social stories. Respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = completion.choices[0]?.message?.content || ''
    
    // Parse social story
    let socialStory
    try {
      let cleanedContent = content.trim()
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '')
      cleanedContent = cleanedContent.replace(/^```\s*/i, '')
      cleanedContent = cleanedContent.replace(/\s*```$/i, '')
      
      socialStory = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse social story:`, parseError)
      throw new Error('Failed to parse social story from AI response')
    }

    // Generate images for each situation if requested
    if (generateImages && socialStory.situations) {
      console.log(`[${requestId}] Generating images for ${socialStory.situations.length} situations...`)
      
      const imagePromises = socialStory.situations.map(async (situation, index) => {
        try {
          const result = await enhancedGenerator.generateEnhancedImage({
            action: situation.visualDescription || situation.description,
            stylePreset: 'social-story',
            qualityLevel: 'realistic'
          })
          
          return {
            ...situation,
            image: result.success ? result.image : null,
            imageMetadata: result.success ? result.metadata : null,
            imageGenerated: result.success
          }
        } catch (error) {
          console.warn(`[${requestId}] Failed to generate image for situation ${index + 1}:`, error.message)
          return {
            ...situation,
            image: null,
            imageGenerated: false
          }
        }
      })

      socialStory.situations = await Promise.all(imagePromises)
    }

    const response = {
      success: true,
      socialStory,
      metadata: {
        scenario,
        contexts,
        targetAge,
        includeEmotions,
        includeSocialCues,
        imagesGenerated: generateImages,
        generatedAt: new Date().toISOString(),
        requestId
      }
    }

    console.log(`[${requestId}] Social story generated successfully`)
    return NextResponse.json(response)

  } catch (error) {
    console.error(`[${requestId}] Error generating social story:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate social story',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}