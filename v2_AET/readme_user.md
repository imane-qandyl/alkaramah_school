# Z SDK API Server - User Guide

This guide explains how to use the service, manage API keys, and call the API endpoints.


## Environment Setup

Create a `.env` file:

```env
DATABASE_URL="your_database_url"
SDK_BASE_URL="https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk"
SDK_API_KEY="zk_live_your_api_key_here"
```




### Getting an API Key

Request an API key from your account owner or admin. Keep it secure and do not share it publicly.

### API Key Scopes

- all - full access to all services
- llm - language model chat/text
- vlm - vision language model
- tts - text-to-speech
- asr - speech recognition
- image - image generation
- video - video generation
- read - content read/extract
- search - search

## Authentication

All SDK endpoints require authentication via the `X-API-Key` header.

```
X-API-Key: $SDK_API_KEY
```

## Security Notes

- API keys are secrets. Treat them like passwords and store them securely.
- Use long, random keys. If you generate keys outside the service, use high-entropy values.
- Brute force protection should be enabled via rate limits and request logging.
- Only the SDK endpoints should be accessible with API keys. Lock down the web UI and other routes with authentication.
- Invalid paths and missing files should return 404. Do not expose directory listings or server file paths.

## Base URL

Use the `SDK_BASE_URL` value from your `.env` file:

```
https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk
```

## Implementation Notes

### Currently Enabled Services

The project is integrated with the Z SDK server and uses the following services:

| Service | Endpoint | Status | Purpose |
|---------|----------|--------|---------|
| **Text Chat** | `POST /llm/chat` | ✅ Active | General text conversations |
| **Vision Chat** | `POST /vlm/chat` | ✅ Active | Image analysis and understanding |
| **Image Generation** | `POST /image/generate` | ✅ Active | Creating images from text |
| **Image Editing** | `POST /image/generate` | ✅ Active | Editing images (uses generation) |

### Future Enhanced Services

The following specialized endpoints are available on the SDK server and documented below for reference:

- `POST /image/edit` - Dedicated image editing service
- `POST /image/understand` - Dedicated image analysis service

These services provide optimized implementations for their specific use cases. The project will be updated to use these endpoints once they are fully integrated.

---

## API Endpoints

### 1) LLM Chat

Endpoint: POST /api/sdk/llm/chat
Required scope: llm or all

Request:
```json
{
  "model": "your-model",
  "messages": [
    { "role": "user", "content": "Hello, how are you?" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

cURL:
```bash
curl -X POST "$SDK_BASE_URL/llm/chat" \
  -H "X-API-Key: $SDK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-model",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

JavaScript:
```javascript
const response = await fetch(`${process.env.SDK_BASE_URL}/llm/chat`, {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.SDK_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'your-model',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const data = await response.json();
console.log(data);
```

Python:
```python
import os
import requests

response = requests.post(
  f"{os.getenv('SDK_BASE_URL')}/llm/chat",
    headers={
    'X-API-Key': os.getenv('SDK_API_KEY'),
        'Content-Type': 'application/json'
    },
    json={
        'model': 'your-model',
        'messages': [{'role': 'user', 'content': 'Hello!'}]
    }
)

print(response.json())
```

### 2) VLM Chat

Endpoint: POST /api/sdk/vlm/chat
Required scope: vlm or all

Request:
```json
{
  "model": "your-vision-model",
  "messages": [
    {
      "role": "user",
      "content": "What's in this image?",
      "image_url": "https://example.com/image.jpg"
    }
  ]
}
```

### 3) Text-to-Speech

Endpoint: POST /api/sdk/tts/synthesize
Required scope: tts or all

Request:
```json
{
  "text": "Hello, this is a text to speech example.",
  "voice": "nova",
  "model": "tts-1"
}
```

JavaScript:
```javascript
const response = await fetch(`${process.env.SDK_BASE_URL}/tts/synthesize`, {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.SDK_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hello world',
    voice: 'nova',
    model: 'tts-1'
  })
});

const audioBlob = await response.blob();
```

### 4) Speech Recognition

Endpoint: POST /api/sdk/asr/transcribe
Required scope: asr or all

Request:
```json
{
  "audio_url": "https://example.com/audio.mp3",
  "model": "whisper-1",
  "language": "en"
}
```

### 5) Image Generation

Endpoint: POST /api/sdk/image/generate
Required scope: image or all

Request:
```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1
}
```

cURL:
```bash
curl -X POST "$SDK_BASE_URL/image/generate" \
  -H "X-API-Key: $SDK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset",
    "model": "dall-e-3",
    "size": "1024x1024"
  }'
```

### 5.1) Image Editing (NEW)

Endpoint: POST /api/sdk/image/edit
Required scope: image-edit or all

Use this service to edit and modify images using AI. Describe the changes you want and the service will apply them.

Request:
```json
{
  "image": "base64_encoded_image_string",
  "prompt": "Make the sky more colorful and add clouds",
  "size": "1024x1024"
}
```

Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | string | Yes | Base64 encoded image string |
| `prompt` | string | Yes | Description of how to edit the image |
| `size` | string | No | Output image size (default: "1024x1024") |

cURL:
```bash
curl -X POST "$SDK_BASE_URL/image/edit" \
  -H "X-API-Key: $SDK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "iVBORw0KGgoAAAANSUhEUgAA...",
    "prompt": "Change the background to a sunset",
    "size": "1024x1024"
  }'
```

JavaScript:
```javascript
const response = await fetch(`${process.env.SDK_BASE_URL}/image/edit`, {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.SDK_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image: base64ImageString,
    prompt: 'Make the image look like a painting',
    size: '1024x1024'
  })
})

const result = await response.json()
console.log(result.image) // Edited image data
```

Common Edit Prompts:
- "Make the sky more colorful and dramatic"
- "Add professional lighting"
- "Change the style to watercolor"
- "Remove the background"
- "Make it look like it was taken at sunset"
- "Enhance the colors and contrast"

Response:
```json
{
  "success": true,
  "data": {
    "image": "base64_encoded_edited_image",
    "prompt": "Make the sky more colorful and add clouds",
    "size": "1024x1024"
  }
}
```

### 5.2) Image Analysis (NEW)

Endpoint: POST /api/sdk/image/understand
Required scope: image-understand or all

Use this service to analyze and understand images. Get detailed information about what's in an image, extract text, detect objects, and more.

Request:
```json
{
  "image": "base64_encoded_image_string",
  "prompt": "Analyze this image and describe all the details",
  "detail": "auto"
}
```

Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | string | Yes | Base64 encoded image string |
| `prompt` | string | Yes | What analysis you want from the image |
| `detail` | string | No | Detail level: "low", "auto", or "high" (default: "auto") |

cURL:
```bash
curl -X POST "$SDK_BASE_URL/image/understand" \
  -H "X-API-Key: $SDK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "iVBORw0KGgoAAAANSUhEUgAA...",
    "prompt": "What objects are in this image and where are they located?",
    "detail": "high"
  }'
```

JavaScript:
```javascript
const response = await fetch(`${process.env.SDK_BASE_URL}/image/understand`, {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.SDK_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image: base64ImageString,
    prompt: 'Extract all text from this image',
    detail: 'high'
  })
})

const result = await response.json()
console.log(result.analysis) // Analysis results
```

Common Analysis Prompts:

**General Analysis:**
- "Describe everything you see in this image in detail"
- "What is the main subject of this image?"
- "What is the mood or atmosphere of this image?"

**Object Detection:**
- "List all objects in this image"
- "What type of product is shown?"
- "Identify all vehicles in the image"

**Text Extraction:**
- "Extract all text from this image"
- "What does the sign say?"
- "Read any numbers or codes visible"

**Color Analysis:**
- "What are the dominant colors in this image?"
- "Describe the color scheme"
- "What is the primary color theme?"

**Scene Understanding:**
- "Where was this photo taken?"
- "What time of day is depicted?"
- "What is the setting or location?"

Response:
```json
{
  "success": true,
  "data": {
    "analysis": "This image shows a beautiful sunset over the ocean with...",
    "objects": ["sky", "ocean", "sun", "clouds"],
    "colors": ["orange", "blue", "purple"],
    "confidence": 0.95
  }
}
```

### 6) Video Generation

Endpoint: POST /api/sdk/video/generate
Required scope: video or all

Request:
```json
{
  "prompt": "A cat playing with a ball",
  "duration": 5,
  "resolution": "1080p"
}
```

### 7) Read/Extract

Endpoint: POST /api/sdk/read
Required scope: read or all

Request:
```json
{
  "url": "https://example.com/article",
  "format": "markdown"
}
```

### 8) Search

Endpoint: POST /api/sdk/search
Required scope: search or all

Request:
```json
{
  "query": "artificial intelligence trends 2024",
  "limit": 10
}
```

## Rate Limiting

Each API key can set hourly and daily limits. When limits are exceeded:

```json
{
  "error": "Rate Limit Exceeded",
  "message": "You have exceeded your hourly/daily limit",
  "retry_after": 3600
}
```

## Response Format

Success response:
```json
{
  "success": true,
  "data": { ... },
  "usage": {
    "tokens": 150,
    "cost": 0.003
  }
}
```

Error response:
```json
{
  "error": "Bad Request",
  "message": "Invalid parameters provided",
  "details": { ... }
}
```


