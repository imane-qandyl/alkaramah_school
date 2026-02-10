import { NextRequest, NextResponse } from 'next/server'
import { createZaiClient } from '@/lib/zai'

export async function POST(request: NextRequest) {
  try {
    const { activity, numSteps = 4 } = await request.json()

    console.log('Received request:', { activity, numSteps })
    console.log('Environment check:', {
      hasBaseUrl: !!process.env.SDK_BASE_URL,
      hasApiKey: !!process.env.SDK_API_KEY,
      baseUrl: process.env.SDK_BASE_URL
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity is required' },
        { status: 400 }
      )
    }

    // Validate numSteps
    if (numSteps < 3 || numSteps > 6) {
      return NextResponse.json(
        { error: 'Number of steps must be between 3 and 6' },
        { status: 400 }
      )
    }

    // Use Z SDK client to generate step-by-step instructions
    console.log('Creating Z SDK client...')
    const zai = await createZaiClient()

    const prompt = `You are an assistant that creates step-by-step visual schedules for autistic students.

Input activity: "${activity}"

Rules:
- Generate exactly ${numSteps} steps
- For each step, create:
   1. A short label (2–3 words) for display
   2. A full descriptive sentence suitable for generating an illustration
- Use simple, clear language suitable for autistic learners
- Do NOT include student data or explanations

Output format (JSON):
[
  { "label": "<2-3 words>", "description": "<full sentence>" },
  { "label": "<2-3 words>", "description": "<full sentence>" },
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
    console.log('Extracted content:', content)

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
      console.log('Cleaned JSON string:', jsonString)
      
      steps = JSON.parse(jsonString)
      
      // Validate the structure
      if (!Array.isArray(steps) || steps.length === 0) {
        throw new Error('Invalid steps array')
      }
      
      // Ensure each step has label and description
      steps = steps.slice(0, numSteps).map((step: any) => ({
        label: step.label || '',
        description: step.description || ''
      }))
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      console.error('Raw content was:', content)
      throw new Error('Failed to parse steps from AI response')
    }

    console.log('Parsed steps:', steps)

    if (steps.length === 0) {
      console.error('No steps found in content:', content)
      throw new Error('No steps were generated')
    }

    return NextResponse.json({ steps })
  } catch (error) {
    console.error('Error generating steps:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        error: 'Failed to generate steps',
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
