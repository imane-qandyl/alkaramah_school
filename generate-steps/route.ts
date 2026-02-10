import { NextRequest, NextResponse } from 'next/server'
import { createZaiClient } from '@/lib/zai'
import { EnhancedImageGenerator } from '@/lib/enhancedImageGeneration'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 9)
  console.log(`[${requestId}] Enhanced steps generation request started`)

  try {
    const { 
      activity, 
      numSteps = 4,
      generateImages = false,
      stylePreset = "visual-schedule",
      difficultyLevel = "simple",
      includeContext = false
    } = await request.json()

    console.log(`[${requestId}] Received request:`, { 
      activity, 
      numSteps, 
      generateImages, 
      stylePreset, 
      difficultyLevel,
      includeContext
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity is required' },
        { status: 400 }
      )
    }

    // Validate numSteps
    if (numSteps < 3 || numSteps > 8) {
      return NextResponse.json(
        { error: 'Number of steps must be between 3 and 8' },
        { status: 400 }
      )
    }

    console.log(`[${requestId}] Creating Z SDK client...`)
    const zai = await createZaiClient()
    const enhancedGenerator = new EnhancedImageGenerator(zai)

    // Enhanced prompt for better step generation
    const contextualPrompt = includeContext 
      ? `Consider different environments (home, school, community) and social contexts.`
      : `Focus on the core action steps.`

    const difficultyPrompt = {
      'simple': 'Use very simple language and basic steps suitable for beginners.',
      'intermediate': 'Include moderate detail and some preparatory steps.',
      'complex': 'Provide comprehensive steps with context and variations.'
    }[difficultyLevel] || 'Use simple, clear language.'

    const prompt = `You are an expert assistant that creates step-by-step visual schedules for autistic students.

Input activity: "${activity}"
Difficulty level: ${difficultyLevel}
Context consideration: ${contextualPrompt}

Rules:
- Generate exactly ${numSteps} steps
- ${difficultyPrompt}
- For each step, create:
   1. A short label (2–4 words) for display
   2. A full descriptive sentence suitable for generating an illustration
   3. A brief context note explaining why this step is important (optional)
- Use simple, clear language suitable for autistic learners
- Ensure steps are logically sequenced
- Consider sensory and social aspects when relevant
- Do NOT include student data or explanations

Output format (JSON):
[
  { 
    "label": "<2-4 words>", 
    "description": "<full sentence>",
    "context": "<brief explanation of importance>" 
  },
  ...
]`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a specialized assistant for creating visual schedules for autistic students. Keep responses simple and focused. CRITICAL: You must respond with valid JSON only. Do not wrap the JSON in markdown code blocks. Ensure all JSON syntax is correct with proper colons, commas, and quotes.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = completion.choices[0]?.message?.content || ''
    console.log(`[${requestId}] Extracted content:`, content)

    // Parse the JSON response to extract steps
    let steps
    try {
      // Remove markdown code block formatting if present
      let cleanedContent = content.trim()
      
      // Remove ```json and ``` markers
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '')
      cleanedContent = cleanedContent.replace(/^```\s*/i, '')
      cleanedContent = cleanedContent.replace(/\s*```$/i, '')
      
      // Extract just the JSON array
      const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }
      
      const jsonString = jsonMatch[0]
      console.log(`[${requestId}] Cleaned JSON string:`, jsonString)
      
      steps = JSON.parse(jsonString)
      
      // Validate the structure
      if (!Array.isArray(steps) || steps.length === 0) {
        throw new Error('Invalid steps array')
      }
      
      // Ensure each step has required fields
      steps = steps.slice(0, numSteps).map((step, index) => ({
        id: index + 1,
        label: step.label || `Step ${index + 1}`,
        description: step.description || '',
        context: step.context || null,
        order: index + 1
      }))
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse JSON response:`, parseError)
      console.error(`[${requestId}] Raw content was:`, content)
      throw new Error('Failed to parse steps from AI response')
    }

    console.log(`[${requestId}] Parsed steps:`, steps)

    if (steps.length === 0) {
      console.error(`[${requestId}] No steps found in content:`, content)
      throw new Error('No steps were generated')
    }

    // Generate images for steps if requested
    let stepsWithImages = steps
    if (generateImages) {
      console.log(`[${requestId}] Generating images for ${steps.length} steps...`)
      
      const imageResults = await enhancedGenerator.batchGenerateWithQualityControl(
        steps.map(step => step.description),
        {
          stylePreset,
          qualityLevel: 'child-friendly',
          maxRetries: 1
        }
      )

      if (imageResults.success) {
        stepsWithImages = steps.map((step, index) => ({
          ...step,
          image: imageResults.results[index]?.image || null,
          imageMetadata: imageResults.results[index]?.metadata || null,
          imageGenerated: !!imageResults.results[index]?.success
        }))
        
        console.log(`[${requestId}] Images generated for ${imageResults.summary.successful}/${imageResults.summary.total} steps`)
      } else {
        console.warn(`[${requestId}] Image generation failed, returning steps without images`)
      }
    }

    // Generate progressive difficulty versions if requested
    let progressiveVersions = null
    if (difficultyLevel === 'simple' && numSteps <= 5) {
      try {
        console.log(`[${requestId}] Generating progressive difficulty versions...`)
        const progressive = await enhancedGenerator.generateProgressiveSequence(activity)
        if (progressive.success) {
          progressiveVersions = progressive.sequence
        }
      } catch (error) {
        console.warn(`[${requestId}] Progressive generation failed:`, error.message)
      }
    }

    const response = {
      success: true,
      steps: stepsWithImages,
      metadata: {
        activity,
        numSteps: steps.length,
        difficultyLevel,
        includeContext,
        imagesGenerated: generateImages,
        generatedAt: new Date().toISOString(),
        requestId
      },
      ...(progressiveVersions && { progressiveVersions }),
      ...(generateImages && {
        imageGenerationSummary: {
          requested: steps.length,
          successful: stepsWithImages.filter(s => s.imageGenerated).length,
          failed: stepsWithImages.filter(s => !s.imageGenerated).length
        }
      })
    }

    console.log(`[${requestId}] Enhanced steps generated successfully`)
    return NextResponse.json(response)

  } catch (error) {
    console.error(`[${requestId}] Error generating enhanced steps:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate enhanced steps',
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
