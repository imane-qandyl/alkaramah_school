import { NextRequest, NextResponse } from 'next/server'
import { createZaiClient } from '@/lib/zai'
import { EnhancedImageGenerator } from '@/lib/enhancedImageGeneration'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 9)
  console.log(`[${requestId}] Progressive sequence generation request started`)

  try {
    const { 
      baseActivity, 
      difficultyLevels = ['simple', 'intermediate', 'complex'],
      generateImages = true,
      includePrerequisites = true,
      targetSkillLevel = 'beginner'
    } = await request.json()

    if (!baseActivity) {
      return NextResponse.json(
        { error: 'Base activity is required' },
        { status: 400 }
      )
    }

    console.log(`[${requestId}] Creating Z SDK client...`)
    const zai = await createZaiClient()
    const enhancedGenerator = new EnhancedImageGenerator(zai)

    // Generate progressive sequence
    const skillLevelPrompts = {
      'beginner': 'Focus on foundational skills and basic steps',
      'intermediate': 'Include skill building and moderate complexity',
      'advanced': 'Incorporate complex variations and independence'
    }

    const prompt = `Create a progressive learning sequence for: "${baseActivity}"

Target skill level: ${targetSkillLevel}
Difficulty levels: ${difficultyLevels.join(' → ')}
Include prerequisites: ${includePrerequisites}

For each difficulty level, create:
1. Specific learning objectives
2. Step-by-step instructions adapted to that level
3. Prerequisites (if includePrerequisites is true)
4. Success criteria
5. Visual description for image generation

${skillLevelPrompts[targetSkillLevel] || skillLevelPrompts['beginner']}

Format as JSON:
{
  "baseActivity": "${baseActivity}",
  "overallObjective": "Main learning goal",
  "sequence": [
    {
      "level": "simple|intermediate|complex",
      "title": "Level-specific title",
      "objective": "What student will learn at this level",
      "prerequisites": ["skill1", "skill2"] (if includePrerequisites),
      "steps": [
        {
          "stepNumber": 1,
          "instruction": "Clear instruction",
          "visualDescription": "Description for image generation",
          "supportNeeded": "none|minimal|moderate|full"
        }
      ],
      "successCriteria": "How to know student has mastered this level",
      "nextLevelPreparation": "What prepares student for next level"
    }
  ]
}`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in progressive skill development for autistic learners. Create structured, achievable learning sequences. Respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = completion.choices[0]?.message?.content || ''
    
    // Parse progressive sequence
    let progressiveSequence
    try {
      let cleanedContent = content.trim()
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '')
      cleanedContent = cleanedContent.replace(/^```\s*/i, '')
      cleanedContent = cleanedContent.replace(/\s*```$/i, '')
      
      progressiveSequence = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse progressive sequence:`, parseError)
      throw new Error('Failed to parse progressive sequence from AI response')
    }

    // Generate images for each step if requested
    if (generateImages && progressiveSequence.sequence) {
      console.log(`[${requestId}] Generating images for progressive sequence...`)
      
      for (const level of progressiveSequence.sequence) {
        if (level.steps) {
          const imagePromises = level.steps.map(async (step, stepIndex) => {
            try {
              const result = await enhancedGenerator.generateEnhancedImage({
                action: step.visualDescription || step.instruction,
                stylePreset: 'visual-schedule',
                qualityLevel: 'child-friendly'
              })
              
              return {
                ...step,
                image: result.success ? result.image : null,
                imageMetadata: result.success ? result.metadata : null,
                imageGenerated: result.success
              }
            } catch (error) {
              console.warn(`[${requestId}] Failed to generate image for ${level.level} step ${stepIndex + 1}:`, error.message)
              return {
                ...step,
                image: null,
                imageGenerated: false
              }
            }
          })

          level.steps = await Promise.all(imagePromises)
        }
      }
    }

    // Calculate progression statistics
    const stats = {
      totalLevels: progressiveSequence.sequence?.length || 0,
      totalSteps: progressiveSequence.sequence?.reduce((sum, level) => sum + (level.steps?.length || 0), 0) || 0,
      imagesGenerated: 0,
      imagesFailed: 0
    }

    if (generateImages) {
      progressiveSequence.sequence?.forEach(level => {
        level.steps?.forEach(step => {
          if (step.imageGenerated) {
            stats.imagesGenerated++
          } else {
            stats.imagesFailed++
          }
        })
      })
    }

    const response = {
      success: true,
      progressiveSequence,
      statistics: stats,
      metadata: {
        baseActivity,
        difficultyLevels,
        targetSkillLevel,
        includePrerequisites,
        imagesGenerated: generateImages,
        generatedAt: new Date().toISOString(),
        requestId
      }
    }

    console.log(`[${requestId}] Progressive sequence generated successfully`)
    return NextResponse.json(response)

  } catch (error) {
    console.error(`[${requestId}] Error generating progressive sequence:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate progressive sequence',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}