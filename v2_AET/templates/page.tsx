'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { 
  Plus, 
  Minus, 
  Equal, 
  Check, 
  ArrowRight, 
  Lightbulb,
  Edit,
  Sparkles,
  Info,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Download
} from 'lucide-react'

interface GeneratedContent {
  type: string
  data: any
}

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Count and Add state
  const [countAddNum1, setCountAddNum1] = useState(3)
  const [countAddNum2, setCountAddNum2] = useState(2)
  const [countAddEmoji, setCountAddEmoji] = useState('🍎')
  const [countAddOperation, setCountAddOperation] = useState('+')
  
  // Match Number state
  const [matchNumber, setMatchNumber] = useState(4)
  const [matchEmoji, setMatchEmoji] = useState('🟦')
  
  // Step by Step state
  const [stepNum1, setStepNum1] = useState(2)
  const [stepNum2, setStepNum2] = useState(3)
  const [stepEmoji, setStepEmoji] = useState('🍪')
  
  // Choice state
  const [choiceNum1, setChoiceNum1] = useState(2)
  const [choiceNum2, setChoiceNum2] = useState(1)
  const [choiceEmoji, setChoiceEmoji] = useState('🍪')
  
  // Sequence state
  const [sequenceType, setSequenceType] = useState('morning')
  const [customSequence, setCustomSequence] = useState('')

  const emojiOptions = [
    { value: '🍎', label: 'Apple' },
    { value: '🍪', label: 'Cookie' },
    { value: '⭐', label: 'Star' },
    { value: '🟦', label: 'Blue Square' },
    { value: '❤️', label: 'Heart' },
    { value: '🌸', label: 'Flower' },
    { value: '🎈', label: 'Balloon' },
    { value: '🦋', label: 'Butterfly' }
  ]

  const sequenceOptions: Record<string, Array<{emoji: string, text: string}>> = {
    morning: [
      { emoji: '🌅', text: 'Wake up' },
      { emoji: '🪥', text: 'Brush teeth' },
      { emoji: '👕', text: 'Get dressed' },
      { emoji: '🏫', text: 'Go to school' }
    ],
    bedtime: [
      { emoji: '🛁', text: 'Take bath' },
      { emoji: '👕', text: 'Put pajamas' },
      { emoji: '📖', text: 'Read book' },
      { emoji: '😴', text: 'Sleep' }
    ],
    lunch: [
      { emoji: '🧼', text: 'Wash hands' },
      { emoji: '🍽️', text: 'Get food' },
      { emoji: '😋', text: 'Eat lunch' },
      { emoji: '🧹', text: 'Clean up' }
    ]
  }

  const calculateResult = () => {
    if (countAddOperation === '+') {
      return countAddNum1 + countAddNum2
    } else {
      return Math.max(0, countAddNum1 - countAddNum2)
    }
  }

  const choiceResult = choiceNum1 + choiceNum2
  const generateWrongAnswers = (correct: number) => {
    const wrong1 = Math.max(1, correct - 1)
    const wrong2 = correct + 1
    return [wrong1, wrong2]
  }

  // Randomize functions
  const randomizeCountAdd = () => {
    setCountAddNum1(Math.floor(Math.random() * 5) + 1)
    setCountAddNum2(Math.floor(Math.random() * 5) + 1)
    setCountAddEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)].value)
    setCountAddOperation(Math.random() > 0.5 ? '+' : '-')
    toast({
      title: 'Randomized!',
      description: 'New counting problem generated',
    })
  }

  const randomizeMatch = () => {
    setMatchNumber(Math.floor(Math.random() * 5) + 1)
    setMatchEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)].value)
    toast({
      title: 'Randomized!',
      description: 'New matching problem generated',
    })
  }

  const randomizeSteps = () => {
    setStepNum1(Math.floor(Math.random() * 5) + 1)
    setStepNum2(Math.floor(Math.random() * 5) + 1)
    setStepEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)].value)
    toast({
      title: 'Randomized!',
      description: 'New step-by-step problem generated',
    })
  }

  const randomizeChoice = () => {
    setChoiceNum1(Math.floor(Math.random() * 5) + 1)
    setChoiceNum2(Math.floor(Math.random() * 5) + 1)
    setChoiceEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)].value)
    toast({
      title: 'Randomized!',
      description: 'New choice problem generated',
    })
  }

  // Download functions
  const handleExport = (templateType: string) => {
    toast({
      title: 'Export Started',
      description: `Preparing ${templateType} template for download...`,
    })
    // In a real implementation, this would generate a PDF or image
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <div>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Generator
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="mb-2" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            AET-Aligned Learning
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Learning Templates
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Structured, visual, and predictable learning patterns designed for autism education
          </p>
        </div>

        {/* Core Idea Section */}
        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              Core Idea: AET-Aligned Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              A template is a structured learning pattern that provides consistency, clarity, and predictability for autistic learners.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Each Template Has:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Aligns to one AET target</li>
                  <li>✓ Visual, predictable layout</li>
                  <li>✓ Can be auto-generated by AI</li>
                  <li>✓ Editable by teachers</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Template Components:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Goal (AET statement)</li>
                  <li>• Visual structure</li>
                  <li>• Minimal text (1–3 words)</li>
                  <li>• Clear outcome</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Tabs */}
        <Tabs defaultValue="counting" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="counting" className="flex flex-col py-3">
              <span className="text-2xl mb-1">🔢</span>
              <span className="text-xs">Count & Add</span>
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex flex-col py-3">
              <span className="text-2xl mb-1">🎯</span>
              <span className="text-xs">Match Numbers</span>
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex flex-col py-3">
              <span className="text-2xl mb-1">📝</span>
              <span className="text-xs">Step-by-Step</span>
            </TabsTrigger>
            <TabsTrigger value="choice" className="flex flex-col py-3">
              <span className="text-2xl mb-1">✅</span>
              <span className="text-xs">Choose Answer</span>
            </TabsTrigger>
            <TabsTrigger value="sequence" className="flex flex-col py-3">
              <span className="text-2xl mb-1">📅</span>
              <span className="text-xs">Daily Sequence</span>
            </TabsTrigger>
          </TabsList>

          {/* Template 1: Count and Add */}
          <TabsContent value="counting" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Count and Add</CardTitle>
                    <CardDescription>Visual counting & addition template - Customize and Generate</CardDescription>
                  </div>
                  <Badge>Maths Template</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AET Focus */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">AET Focus:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Understanding number concepts</li>
                    <li>• Using visual supports for problem solving</li>
                  </ul>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Control Panel */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Customize Template
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emoji-select">Object Type</Label>
                        <Select value={countAddEmoji} onValueChange={setCountAddEmoji}>
                          <SelectTrigger id="emoji-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {emojiOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.value} {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="operation">Operation</Label>
                        <Select value={countAddOperation} onValueChange={setCountAddOperation}>
                          <SelectTrigger id="operation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+">Addition (+)</SelectItem>
                            <SelectItem value="-">Subtraction (−)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="num1">First Number (1-5)</Label>
                        <Input
                          id="num1"
                          type="number"
                          min="1"
                          max="5"
                          value={countAddNum1}
                          onChange={(e) => setCountAddNum1(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="num2">Second Number (1-5)</Label>
                        <Input
                          id="num2"
                          type="number"
                          min="1"
                          max="5"
                          value={countAddNum2}
                          onChange={(e) => setCountAddNum2(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>

                      <Button className="w-full gap-2" variant="outline" onClick={randomizeCountAdd}>
                        <RefreshCw className="w-4 h-4" />
                        Randomize
                      </Button>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Template Rules:</h4>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>✓ Max 5 objects per group</li>
                        <li>✓ Same object type</li>
                        <li>✓ High contrast</li>
                        <li>✓ No clutter</li>
                      </ul>
                    </div>
                  </div>

                  {/* Generated Preview */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-semibold">Generated Problem</h4>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleExport('Count and Add')}>
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                      
                      <div className="flex flex-col items-center gap-6">
                        {/* Row 1 */}
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2 bg-purple-50 p-4 rounded-lg">
                            {Array.from({ length: countAddNum1 }).map((_, i) => (
                              <span key={i} className="text-4xl">{countAddEmoji}</span>
                            ))}
                          </div>
                          <span className="text-3xl font-bold text-purple-600">({countAddNum1})</span>
                        </div>

                        {/* Operation Sign */}
                        {countAddOperation === '+' ? (
                          <Plus className="w-8 h-8 text-gray-600" />
                        ) : (
                          <Minus className="w-8 h-8 text-gray-600" />
                        )}

                        {/* Row 2 */}
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2 bg-purple-50 p-4 rounded-lg">
                            {Array.from({ length: countAddNum2 }).map((_, i) => (
                              <span key={i} className="text-4xl">{countAddEmoji}</span>
                            ))}
                          </div>
                          <span className="text-3xl font-bold text-purple-600">({countAddNum2})</span>
                        </div>

                        {/* Equals Sign */}
                        <Equal className="w-8 h-8 text-gray-600" />

                        {/* Row 3 - Answer */}
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2 bg-green-50 p-4 rounded-lg border-2 border-green-300">
                            {Array.from({ length: calculateResult() }).map((_, i) => (
                              <span key={i} className="text-4xl">{countAddEmoji}</span>
                            ))}
                          </div>
                          <span className="text-3xl font-bold text-green-600">({calculateResult()})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template 2: Match the Number */}
          <TabsContent value="matching" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Match the Number</CardTitle>
                    <CardDescription>Matching number to quantity template - Customize and Generate</CardDescription>
                  </div>
                  <Badge>Maths Template</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AET Focus */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">Structure:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Left side: number (1–5)</li>
                    <li>• Right side: images to count</li>
                    <li>• Student task: match number to image group</li>
                  </ul>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Control Panel */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Customize Template
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="match-emoji">Object Type</Label>
                        <Select value={matchEmoji} onValueChange={setMatchEmoji}>
                          <SelectTrigger id="match-emoji">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {emojiOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.value} {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="match-num">Number (1-5)</Label>
                        <Input
                          id="match-num"
                          type="number"
                          min="1"
                          max="5"
                          value={matchNumber}
                          onChange={(e) => setMatchNumber(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>

                      <Button className="w-full gap-2" variant="outline" onClick={randomizeMatch}>
                        <RefreshCw className="w-4 h-4" />
                        Randomize
                      </Button>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">AI Rules:</h4>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>✓ One correct answer</li>
                        <li>✓ Avoid abstract icons</li>
                        <li>✓ Consistent spacing</li>
                      </ul>
                    </div>
                  </div>

                  {/* Generated Preview */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-semibold">Generated Matching</h4>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleExport('Match Number')}>
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-center gap-12">
                        {/* Left: Number */}
                        <div className="w-32 h-32 bg-blue-100 rounded-2xl flex items-center justify-center border-4 border-blue-300">
                          <span className="text-7xl font-bold text-blue-600">{matchNumber}</span>
                        </div>

                        {/* Center: Arrow */}
                        <ArrowRight className="w-12 h-12 text-gray-400" />

                        {/* Right: Images */}
                        <div className="grid grid-cols-2 gap-3 bg-purple-50 p-6 rounded-2xl border-2 border-purple-200">
                          {Array.from({ length: matchNumber }).map((_, i) => (
                            <span key={i} className="text-5xl">{matchEmoji}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template 3: Step-by-Step */}
          <TabsContent value="steps" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Solve in Steps</CardTitle>
                    <CardDescription>Step-by-step problem solving template - Customize and Generate</CardDescription>
                  </div>
                  <Badge>Maths Template</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Purpose */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Purpose:</strong> Reduce cognitive load by breaking problems into manageable steps
                  </AlertDescription>
                </Alert>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Control Panel */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Customize Template
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="step-emoji">Object Type</Label>
                        <Select value={stepEmoji} onValueChange={setStepEmoji}>
                          <SelectTrigger id="step-emoji">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {emojiOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.value} {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="step-num1">First Group (1-5)</Label>
                        <Input
                          id="step-num1"
                          type="number"
                          min="1"
                          max="5"
                          value={stepNum1}
                          onChange={(e) => setStepNum1(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="step-num2">Second Group (1-5)</Label>
                        <Input
                          id="step-num2"
                          type="number"
                          min="1"
                          max="5"
                          value={stepNum2}
                          onChange={(e) => setStepNum2(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>

                      <Button className="w-full gap-2" variant="outline" onClick={randomizeSteps}>
                        <RefreshCw className="w-4 h-4" />
                        Randomize
                      </Button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Text Rules:</h4>
                      <p className="text-xs text-gray-700 mb-2">One word per step:</p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">Count</Badge>
                        <Badge variant="outline" className="text-xs">Add</Badge>
                        <Badge variant="outline" className="text-xs">Total</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Generated Preview */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-semibold">Generated Steps</h4>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleExport('Step-by-Step')}>
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Step 1 */}
                        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 text-center space-y-3">
                          <div className="text-sm font-bold text-blue-900 mb-2">Step 1</div>
                          <div className="text-3xl flex gap-1 justify-center flex-wrap">
                            {Array.from({ length: stepNum1 }).map((_, i) => (
                              <span key={i}>{stepEmoji}</span>
                            ))}
                          </div>
                          <ArrowRight className="w-6 h-6 mx-auto text-blue-600" />
                          <div className="text-sm font-semibold text-blue-800">Count</div>
                          <div className="text-2xl font-bold text-blue-600">{stepNum1}</div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200 text-center space-y-3">
                          <div className="text-sm font-bold text-purple-900 mb-2">Step 2</div>
                          <div className="text-3xl flex gap-1 justify-center flex-wrap">
                            {Array.from({ length: stepNum2 }).map((_, i) => (
                              <span key={i}>{stepEmoji}</span>
                            ))}
                          </div>
                          <ArrowRight className="w-6 h-6 mx-auto text-purple-600" />
                          <div className="text-sm font-semibold text-purple-800">Count</div>
                          <div className="text-2xl font-bold text-purple-600">{stepNum2}</div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200 text-center space-y-3">
                          <div className="text-sm font-bold text-orange-900 mb-2">Step 3</div>
                          <Plus className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                          <div className="text-sm font-semibold text-orange-800">Add</div>
                          <div className="text-2xl font-bold text-orange-600">{stepNum1} + {stepNum2}</div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-green-50 p-6 rounded-xl border-2 border-green-300 text-center space-y-3">
                          <div className="text-sm font-bold text-green-900 mb-2">Step 4</div>
                          <Check className="w-8 h-8 mx-auto text-green-600 mb-2" />
                          <div className="text-sm font-semibold text-green-800">Total</div>
                          <div className="text-3xl font-bold text-green-600">{stepNum1 + stepNum2}</div>
                        </div>
                      </div>

                      {/* Visual Flow */}
                      <div className="mt-6 flex justify-center items-center gap-3 text-gray-400">
                        <ArrowRight className="w-6 h-6" />
                        <Plus className="w-6 h-6" />
                        <ArrowRight className="w-6 h-6" />
                        <Check className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template 4: Choice-Based */}
          <TabsContent value="choice" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Choose the Answer</CardTitle>
                    <CardDescription>Choice-based answer template (autism-friendly) - Customize and Generate</CardDescription>
                  </div>
                  <Badge>Maths Template</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Structure Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">Why It Works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Predictable format</li>
                    <li>✓ Low anxiety decision-making</li>
                    <li>✓ Clear visual feedback</li>
                  </ul>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Control Panel */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Customize Template
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="choice-emoji">Object Type</Label>
                        <Select value={choiceEmoji} onValueChange={setChoiceEmoji}>
                          <SelectTrigger id="choice-emoji">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {emojiOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.value} {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="choice-num1">First Number (1-5)</Label>
                        <Input
                          id="choice-num1"
                          type="number"
                          min="1"
                          max="5"
                          value={choiceNum1}
                          onChange={(e) => setChoiceNum1(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="choice-num2">Second Number (1-5)</Label>
                        <Input
                          id="choice-num2"
                          type="number"
                          min="1"
                          max="5"
                          value={choiceNum2}
                          onChange={(e) => setChoiceNum2(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>

                      <Button className="w-full gap-2" variant="outline" onClick={randomizeChoice}>
                        <RefreshCw className="w-4 h-4" />
                        Randomize
                      </Button>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Structure:</h4>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>✓ Problem at top</li>
                        <li>✓ 2-3 answer options</li>
                        <li>✓ Only one correct</li>
                      </ul>
                    </div>
                  </div>

                  {/* Generated Preview */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-xl border-2 border-gray-200 space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Generated Choice</h4>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleExport('Choose Answer')}>
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                      
                      {/* Problem */}
                      <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center justify-center gap-4 text-5xl flex-wrap">
                          <div className="flex gap-1">
                            {Array.from({ length: choiceNum1 }).map((_, i) => (
                              <span key={i}>{choiceEmoji}</span>
                            ))}
                          </div>
                          <Plus className="w-8 h-8 text-gray-600" />
                          <div className="flex gap-1">
                            {Array.from({ length: choiceNum2 }).map((_, i) => (
                              <span key={i}>{choiceEmoji}</span>
                            ))}
                          </div>
                          <span className="text-gray-600 text-3xl">=</span>
                          <span className="text-4xl">❓</span>
                        </div>
                      </div>

                      {/* Answer Options */}
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Correct Answer */}
                        <button className="group bg-green-50 hover:bg-green-100 p-6 rounded-xl border-2 border-green-300 transition-all hover:scale-105">
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-4xl flex gap-1 flex-wrap justify-center">
                              {Array.from({ length: choiceResult }).map((_, i) => (
                                <span key={i}>{choiceEmoji}</span>
                              ))}
                            </div>
                            <span className="text-2xl font-bold text-green-600">({choiceResult})</span>
                            <Check className="w-6 h-6 text-green-600" />
                          </div>
                        </button>

                        {/* Wrong Answer 1 */}
                        <button className="group bg-gray-50 hover:bg-gray-100 p-6 rounded-xl border-2 border-gray-200 transition-all hover:scale-105">
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-4xl flex gap-1 flex-wrap justify-center">
                              {Array.from({ length: generateWrongAnswers(choiceResult)[0] }).map((_, i) => (
                                <span key={i}>{choiceEmoji}</span>
                              ))}
                            </div>
                            <span className="text-2xl font-bold text-gray-600">({generateWrongAnswers(choiceResult)[0]})</span>
                          </div>
                        </button>

                        {/* Wrong Answer 2 */}
                        <button className="group bg-gray-50 hover:bg-gray-100 p-6 rounded-xl border-2 border-gray-200 transition-all hover:scale-105">
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-4xl flex gap-1 flex-wrap justify-center">
                              {Array.from({ length: generateWrongAnswers(choiceResult)[1] }).map((_, i) => (
                                <span key={i}>{choiceEmoji}</span>
                              ))}
                            </div>
                            <span className="text-2xl font-bold text-gray-600">({generateWrongAnswers(choiceResult)[1]})</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template 5: Daily Sequence */}
          <TabsContent value="sequence" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Daily Sequence</CardTitle>
                    <CardDescription>Non-math template showing scalability - Customize and Generate</CardDescription>
                  </div>
                  <Badge variant="secondary">Life Skills Template</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AET Focus */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">AET Focus:</h4>
                  <p className="text-sm text-blue-800">Understanding routines and sequences</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Control Panel */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Customize Template
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sequence-type">Routine Type</Label>
                        <Select value={sequenceType} onValueChange={setSequenceType}>
                          <SelectTrigger id="sequence-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning Routine</SelectItem>
                            <SelectItem value="bedtime">Bedtime Routine</SelectItem>
                            <SelectItem value="lunch">Lunchtime Routine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button className="w-full gap-2" variant="outline">
                        <Sparkles className="w-4 h-4" />
                        AI Generate Custom
                      </Button>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Template Rules:</h4>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>✓ One image per step</li>
                        <li>✓ 1-3 words only</li>
                        <li>✓ Sequential numbering</li>
                        <li>✓ Clear progression</li>
                      </ul>
                    </div>
                  </div>

                  {/* Generated Preview */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-semibold capitalize">{sequenceType.replace('-', ' ')} Routine</h4>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleExport('Daily Sequence')}>
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sequenceOptions[sequenceType].map((step, index) => (
                          <div key={index} className={`p-6 rounded-xl border-2 text-center space-y-3 ${
                            index === 0 ? 'bg-blue-50 border-blue-200' :
                            index === 1 ? 'bg-green-50 border-green-200' :
                            index === 2 ? 'bg-purple-50 border-purple-200' :
                            'bg-orange-50 border-orange-200'
                          }`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold text-white ${
                              index === 0 ? 'bg-blue-600' :
                              index === 1 ? 'bg-green-600' :
                              index === 2 ? 'bg-purple-600' :
                              'bg-orange-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="text-6xl">{step.emoji}</div>
                            <div className={`text-sm font-semibold ${
                              index === 0 ? 'text-blue-900' :
                              index === 1 ? 'text-green-900' :
                              index === 2 ? 'text-purple-900' :
                              'text-orange-900'
                            }`}>{step.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Universal Template Rules */}
        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-600" />
              Universal Template Rules
              <Badge variant="destructive" className="ml-2">Critical for Judges</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Design Principles:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>✓ No text inside images</li>
                  <li>✓ Simple, real-world images</li>
                  <li>✓ Consistent layout across all templates</li>
                  <li>✓ Same visual language every time</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Flexibility:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>✓ Age-adjustable (objects change, structure stays)</li>
                  <li>✓ Subject-adaptable</li>
                  <li>✓ Culturally responsive</li>
                  <li>✓ AI-generated with teacher oversight</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How AI Uses Templates */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              How AI Uses These Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Input:</h4>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>📋 AET statement</li>
                  <li>📚 Subject (e.g. Maths)</li>
                  <li>📊 Student level</li>
                  <li>🎯 Learning objective</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">AI Outputs:</h4>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>🖼️ Image set (3–5 images)</li>
                  <li>📝 Simple text labels</li>
                  <li>✏️ Editable layout</li>
                  <li>🎨 Consistent visual style</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why This Is Powerful */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-green-900">Why This Is Powerful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">👨‍🏫</div>
                <div className="font-semibold text-sm mb-1">Teacher Efficiency</div>
                <div className="text-xs text-gray-600">
                  Teachers don't design from scratch
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold text-sm mb-1">Consistency</div>
                <div className="text-xs text-gray-600">
                  Templates ensure uniform quality
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">🤖</div>
                <div className="font-semibold text-sm mb-1">AI Personalization</div>
                <div className="text-xs text-gray-600">
                  AI personalizes without complexity
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">👧</div>
                <div className="font-semibold text-sm mb-1">Student Clarity</div>
                <div className="text-xs text-gray-600">
                  Students get clarity and structure
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
