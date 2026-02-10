'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Loader2, Image as ImageIcon, Sparkles, Download, DownloadCloud, RotateCcw } from 'lucide-react'

interface Step {
  label: string
  description: string
  image: string
  loading?: boolean
}

export default function VisualScheduleGenerator() {
  const [activity, setActivity] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [numSteps, setNumSteps] = useState(4)
  const [imageSize, setImageSize] = useState('1024x1024')

  // Helper function to download a single image
  const downloadImage = (imageData: string, filename: string) => {
    try {
      const link = document.createElement('a')
      link.href = imageData
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading image:', error)
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Could not download the image',
      })
    }
  }

  // Download all images at once
  const downloadAllImages = () => {
    const stepsWithImages = steps.filter(step => step.image)

    if (stepsWithImages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No images to download',
        description: 'Generate a visual schedule first',
      })
      return
    }

    stepsWithImages.forEach((step, index) => {
      const filename = `${activity.replace(/\s+/g, '-')}-step-${index + 1}.png`
      // Add small delay between downloads to prevent browser blocking
      setTimeout(() => {
        downloadImage(step.image, filename)
      }, index * 200)
    })

    toast({
      title: 'Downloading images...',
      description: `${stepsWithImages.length} images will be downloaded`,
    })
  }

  // Helper function to fetch image with retry logic
  const fetchImageWithRetry = async (stepText: string, index: number, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Client] Step ${index + 1} (Attempt ${attempt}): Starting image fetch for "${stepText}"`)

        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: stepText,
            styleNote: 'autism-friendly visual schedule',
            size: imageSize,
          }),
        })

        console.log(`[Client] Step ${index + 1} (Attempt ${attempt}): Response status ${imageResponse.status}`)

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text()
          console.error(`[Client] Step ${index + 1} (Attempt ${attempt}) failed:`, {
            status: imageResponse.status,
            statusText: imageResponse.statusText,
            body: errorText.slice(0, 200),
          })

          // If API is overwhelmed (502/503), retry after delay
          if ((imageResponse.status === 502 || imageResponse.status === 503) && attempt < maxRetries) {
            const delayMs = attempt * 1000 // 1s, 2s, 3s delays
            console.log(`[Client] Step ${index + 1}: Retrying after ${delayMs}ms...`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
            continue // Try again
          }

          throw new Error(`Failed to generate image (Status: ${imageResponse.status})`)
        }

        const result = await imageResponse.json()
        console.log(`[Client] Step ${index + 1}: Got response, image length: ${result.image?.length || 'no image'}`)

        const { image } = result

        if (!image) {
          console.error(`[Client] Step ${index + 1}: No image in response`)
          throw new Error('No image in response')
        }

        // Update UI immediately with this image as soon as it arrives
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === index ? { ...step, loading: false, image } : step
          )
        )
        console.log(`[Client] Step ${index + 1}: Image displayed successfully`)
        return // Success!
      } catch (error) {
        console.error(`[Client] Step ${index + 1} (Attempt ${attempt}) error:`, error)

        if (attempt === maxRetries) {
          // All retries exhausted
          setSteps((prev) =>
            prev.map((step, idx) =>
              idx === index ? { ...step, loading: false, image: '' } : step
            )
          )
          toast({
            variant: 'destructive',
            title: 'Image generation failed',
            description: `Could not generate image for step ${index + 1} after ${maxRetries} attempts`,
          })
          return
        }

        // Wait before retrying
        const delayMs = attempt * 1000
        console.log(`[Client] Step ${index + 1}: Retrying after ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  // Retry generating failed images
  const retryFailedImages = async () => {
    const failedSteps = steps
      .map((step, index) => ({ ...step, index }))
      .filter(step => !step.image && !step.loading)

    if (failedSteps.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No failed images',
        description: 'All images have been generated successfully',
      })
      return
    }

    setIsGenerating(true)

    // Update loading state for failed steps
    setSteps((prev) =>
      prev.map((step, idx) => {
        const failed = failedSteps.find(f => f.index === idx)
        if (failed) {
          return { ...step, loading: true }
        }
        return step
      })
    )

    // Retry failed images in parallel
    const retryPromises = failedSteps.map(async (step) => {
      try {
        const stepText = steps[step.index].description
        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: stepText,
            styleNote: 'autism-friendly visual schedule',
            size: imageSize,
          }),
        })

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text()
          console.error(`Retry failed for step ${step.index + 1}:`, {
            status: imageResponse.status,
            statusText: imageResponse.statusText,
            body: errorText
          })
          throw new Error(`Failed to generate image (Status: ${imageResponse.status})`)
        }

        const { image } = await imageResponse.json()
        return { index: step.index, image, error: null }
      } catch (error) {
        console.error(`Retry error for step ${step.index + 1}:`, error)
        return { index: step.index, image: '', error: 'Failed to generate image' }
      }
    })

    const results = await Promise.all(retryPromises)

    // Update steps with retry results
    setSteps((prev) =>
      prev.map((step, idx) => {
        const result = results.find(r => r.index === idx)
        if (result) {
          if (result.error) {
            toast({
              variant: 'destructive',
              title: 'Retry failed',
              description: `Could not generate image for step ${idx + 1}`,
            })
          }
          return { ...step, image: result.image || '', loading: false }
        }
        return step
      })
    )

    setIsGenerating(false)
  }

  const retrySingleImage = async (index: number) => {
    const step = steps[index]

    if (!step || step.loading) {
      return
    }

    setIsGenerating(true)
    setSteps((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, loading: true, image: '' } : item
      )
    )

    try {
      await fetchImageWithRetry(step.description, index)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = async () => {
    if (!activity.trim()) {
      toast({
        variant: 'destructive',
        title: 'Please enter an activity',
        description: 'Type an activity like "Washing hands" or "Brushing teeth"',
      })
      return
    }

    setIsGenerating(true)
    setSteps([])

    try {
      // Step 1: Generate steps using LLM
      const stepsResponse = await fetch('/api/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, numSteps }),
      })

      if (!stepsResponse.ok) {
        const errorData = await stepsResponse.json()
        console.error('Failed to generate steps:', errorData)
        throw new Error(`Failed to generate steps: ${errorData.details || errorData.error}`)
      }

      const { steps: generatedSteps } = await stepsResponse.json()

      // Initialize steps with loading state for images
      const initialSteps: Step[] = generatedSteps.map((step: { label: string; description: string }) => ({
        label: step.label,
        description: step.description,
        image: '',
        loading: true,
      }))

      setSteps(initialSteps)

      // Step 2: Generate all images in parallel with staggered timing
      generatedSteps.forEach(async (step: { label: string; description: string }, index: number) => {
        // Stagger the requests slightly to avoid overwhelming the API
        const delayMs = index * 1000
        await new Promise(resolve => setTimeout(resolve, delayMs))
        await fetchImageWithRetry(step.description, index)
      })

      toast({
        title: 'Visual schedule created!',
        description: 'Your activity schedule is ready.',
      })
    } catch (error) {
      console.error('Error generating schedule:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: errorMessage,
      })
      setSteps([])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClear = () => {
    setActivity('')
    setSteps([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-amber-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Visual Schedule Generator
            </h1>
          </div>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-300">
            Create step-by-step visual guides for autistic learners
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Card */}
          <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activity" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Enter an Activity
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Type any daily activity to create a visual schedule
                  </p>
                </div>
                <Input
                  id="activity"
                  placeholder="e.g., Washing hands, Brushing teeth, Getting dressed"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  disabled={isGenerating}
                  className="text-lg py-6 border-2 focus:border-amber-500 dark:bg-slate-700 dark:text-white"
                />
                <div className="space-y-2">
                  <Label htmlFor="numSteps" className="font-semibold text-gray-900 dark:text-white">
                    Number of Steps
                  </Label>
                  <Select
                    value={numSteps.toString()}
                    onValueChange={(value) => setNumSteps(parseInt(value))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="numSteps" className="border-2 focus:border-amber-500">
                      <SelectValue placeholder="Select number of steps" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 steps</SelectItem>
                      <SelectItem value="4">4 steps</SelectItem>
                      <SelectItem value="5">5 steps</SelectItem>
                      <SelectItem value="6">6 steps</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    How many steps in the visual schedule?
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageSize" className="font-semibold text-gray-900 dark:text-white">
                    Image Size
                  </Label>
                  <Select
                    value={imageSize}
                    onValueChange={setImageSize}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="imageSize" className="border-2 focus:border-amber-500">
                      <SelectValue placeholder="Select image size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="768x768">768 × 768</SelectItem>
                      <SelectItem value="1024x1024">1024 × 1024</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Higher resolution = better quality, slower generation
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Visual Schedule
                      </>
                    )}
                  </Button>
                  {steps.length > 0 && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      disabled={isGenerating}
                      className="py-6 px-8 text-lg"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examples Section */}
          {steps.length === 0 && !isGenerating && (
            <Card className="bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Try these examples:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Washing hands', 'Brushing teeth', 'Getting dressed', 'Packing bag', 'Making bed'].map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      onClick={() => setActivity(example)}
                      className="text-sm"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visual Schedule Display */}
          {steps.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-center sm:text-left text-gray-900 dark:text-white">
                  Your Visual Schedule
                </h2>
                <div className="flex gap-2">
                  {steps.some(s => !s.image && !s.loading) && (
                    <Button
                      onClick={retryFailedImages}
                      disabled={isGenerating}
                      variant="outline"
                      className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
                    >
                      <Loader2 className="mr-2 h-5 w-5" />
                      Retry Failed
                    </Button>
                  )}
                  <Button
                    onClick={downloadAllImages}
                    disabled={isGenerating || !steps.some(s => s.image)}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <DownloadCloud className="mr-2 h-5 w-5" />
                    Download All Images
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <Card
                    key={index}
                    className={`bg-white dark:bg-slate-800 border-2 shadow-lg overflow-hidden ${
                      !step.image && !step.loading
                        ? 'border-red-300 dark:border-red-700'
                        : 'border-amber-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center p-4">
                      {step.loading ? (
                        <Loader2 className="w-16 h-16 animate-spin text-amber-600 dark:text-amber-400" />
                      ) : step.image ? (
                        <img
                          src={step.image}
                          alt={step.label}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-3 text-red-500 dark:text-red-400">
                            <ImageIcon />
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            Failed to load
                          </p>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 text-center relative">
                      <Button
                        onClick={() => retrySingleImage(index)}
                        disabled={step.loading || isGenerating}
                        size="sm"
                        className="absolute top-2 left-2 p-2 h-8 w-8"
                        variant="secondary"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          const filename = `${activity.replace(/\s+/g, '-')}-step-${index + 1}.png`
                          downloadImage(step.image, filename)
                        }}
                        disabled={!step.image || step.loading}
                        size="sm"
                        className="absolute top-2 right-2 p-2 h-8 w-8"
                        variant="secondary"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Step {index + 1}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-amber-200 dark:border-slate-700 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Built with ❤️ for autistic learners
          </p>
        </div>
      </footer>
    </div>
  )
}
