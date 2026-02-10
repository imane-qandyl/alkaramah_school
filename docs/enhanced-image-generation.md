# Enhanced Image Generation for Autism-Friendly Educational Content

## Overview

The enhanced image generation system provides advanced capabilities for creating autism-friendly educational images with specialized features for visual schedules, social stories, and progressive learning sequences.

## Key Features

### 1. Advanced Style Presets

- **autism-friendly**: Soft pastel colors, uncluttered composition, clear subjects
- **visual-schedule**: Educational card style with consistent formatting
- **sensory-friendly**: Calming colors, minimal stimulation, smooth textures
- **social-story**: Realistic social contexts with clear emotional cues

### 2. Quality Enhancement Levels

- **child-friendly**: Cartoon-like, approachable, non-threatening
- **high-detail**: Crisp, professional illustration quality
- **realistic**: Photorealistic while maintaining simplicity
- **minimalist**: Clean, essential elements only
- **inclusive**: Diverse representation across abilities and backgrounds

### 3. Specialized Generation Types

#### Single Enhanced Images
```javascript
POST /generate-image
{
  "action": "brushing teeth",
  "stylePreset": "autism-friendly",
  "qualityLevel": "child-friendly",
  "size": "768x768",
  "generateVariations": false,
  "negativePrompt": "cluttered, busy, text",
  "seed": null
}
```

#### Style Variations
```javascript
POST /generate-image
{
  "action": "washing hands",
  "generateVariations": true
}
```

#### Enhanced Steps with Images
```javascript
POST /generate-steps
{
  "activity": "making a sandwich",
  "numSteps": 5,
  "generateImages": true,
  "stylePreset": "visual-schedule",
  "difficultyLevel": "simple",
  "includeContext": true
}
```

#### Social Stories
```javascript
POST /generate-social-story
{
  "scenario": "going to the grocery store",
  "contexts": ["home", "community"],
  "includeEmotions": true,
  "includeSocialCues": true,
  "generateImages": true,
  "targetAge": "elementary"
}
```

#### Progressive Learning Sequences
```javascript
POST /generate-progressive-sequence
{
  "baseActivity": "tying shoes",
  "difficultyLevels": ["simple", "intermediate", "complex"],
  "generateImages": true,
  "includePrerequisites": true,
  "targetSkillLevel": "beginner"
}
```

## API Endpoints

### `/generate-image` (Enhanced)
Generates single images or style variations with advanced prompting.

**Parameters:**
- `action` (required): Description of the action to illustrate
- `stylePreset`: Style preset to use (default: "autism-friendly")
- `qualityLevel`: Quality enhancement level (default: "child-friendly")
- `size`: Image dimensions (default: "768x768")
- `generateVariations`: Generate multiple style variations (default: false)
- `negativePrompt`: Elements to avoid in the image
- `seed`: Random seed for reproducible results

### `/generate-steps` (Enhanced)
Generates step-by-step instructions with optional images.

**Parameters:**
- `activity` (required): Activity to break down into steps
- `numSteps`: Number of steps (3-8, default: 4)
- `generateImages`: Generate images for each step (default: false)
- `stylePreset`: Style for generated images (default: "visual-schedule")
- `difficultyLevel`: Complexity level ("simple", "intermediate", "complex")
- `includeContext`: Include contextual information (default: false)

### `/generate-social-story`
Creates comprehensive social stories with contextual images.

**Parameters:**
- `scenario` (required): Social situation to address
- `contexts`: Environments to include (default: ["home", "school", "community"])
- `includeEmotions`: Include emotional guidance (default: true)
- `includeSocialCues`: Include social cue explanations (default: true)
- `generateImages`: Generate images for situations (default: true)
- `targetAge`: Age group ("preschool", "elementary", "middle", "high")

### `/generate-progressive-sequence`
Creates skill-building sequences with increasing complexity.

**Parameters:**
- `baseActivity` (required): Core skill to develop
- `difficultyLevels`: Progression levels (default: ["simple", "intermediate", "complex"])
- `generateImages`: Generate images for each step (default: true)
- `includePrerequisites`: Include prerequisite skills (default: true)
- `targetSkillLevel`: Starting skill level ("beginner", "intermediate", "advanced")

## Enhanced Image Service

The `EnhancedImageService` provides additional high-level functionality:

### Visual Schedule Generation
```javascript
import { enhancedImageService } from './services/enhancedImageService.js'

const schedule = await enhancedImageService.generateVisualSchedule(
  ['wake up', 'brush teeth', 'eat breakfast'],
  {
    stylePreset: 'visual-schedule',
    includeTransitions: true,
    generateVariations: false
  }
)
```

### Sensory-Friendly Image Sets
```javascript
const sensorySet = await enhancedImageService.generateSensoryFriendlySet(
  ['quiet time', 'deep breathing', 'listening to music'],
  {
    avoidBrightColors: true,
    minimizeClutter: true,
    softTextures: true,
    calmingElements: true
  }
)
```

### Emotion Regulation Aids
```javascript
const emotionAids = await enhancedImageService.generateEmotionRegulationAids([
  'happy', 'sad', 'angry', 'calm', 'excited', 'worried'
])
```

## Testing

Run comprehensive tests with:
```bash
npm run test-enhanced-images
```

This tests all enhanced features including:
- Basic enhanced image generation
- Style variations
- Enhanced steps with images
- Social story generation
- Progressive sequences

## Configuration

The system uses the existing Z AI SDK configuration from:
- Environment variables: `SDK_BASE_URL`, `SDK_API_KEY`
- Configuration file: `config/imageGeneration.json`

## Best Practices

### For Autism-Friendly Images
1. Use soft, muted colors
2. Keep compositions uncluttered
3. Ensure clear, recognizable subjects
4. Avoid text overlays
5. Use consistent visual style across sequences

### For Visual Schedules
1. Maintain consistent image sizes
2. Use clear, sequential actions
3. Include transition steps when helpful
4. Consider the child's perspective and abilities

### For Social Stories
1. Include relevant environmental context
2. Show clear emotional expressions
3. Represent diverse individuals
4. Focus on positive outcomes

### For Progressive Learning
1. Ensure logical skill progression
2. Include prerequisite skills
3. Provide clear success criteria
4. Allow for individual pacing

## Error Handling

The enhanced system includes comprehensive error handling:
- Automatic retries for failed generations
- Quality assessment and re-generation
- Graceful degradation when images can't be generated
- Detailed error reporting and logging

## Performance Considerations

- Batch processing for multiple images
- Quality control with automatic retries
- Configurable timeout settings
- Efficient prompt optimization
- Parallel generation when possible

## Future Enhancements

Planned improvements include:
- Custom style training
- Advanced quality metrics
- Real-time generation feedback
- Integration with learning analytics
- Personalized style preferences
- Multi-language support