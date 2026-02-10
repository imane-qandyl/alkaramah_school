/**
 * Z AI SDK Client
 * Wrapper for Z AI SDK with enhanced error handling and configuration
 */

class ZaiClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  get chat() {
    return {
      completions: {
        create: async (params) => {
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            throw new Error(`Chat completion failed: ${response.status} ${response.statusText}`);
          }

          return await response.json();
        }
      }
    };
  }

  get images() {
    return {
      generations: {
        create: async (params) => {
          const response = await fetch(`${this.baseUrl}/images/generations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            throw new Error(`Image generation failed: ${response.status} ${response.statusText}`);
          }

          return await response.json();
        }
      }
    };
  }
}

export async function createZaiClient() {
  // Load configuration from environment or config file
  const baseUrl = process.env.SDK_BASE_URL || process.env.ZAI_BASE_URL;
  const apiKey = process.env.SDK_API_KEY || process.env.ZAI_API_KEY;

  if (!baseUrl || !apiKey) {
    // Try to load from config file
    try {
      const configModule = await import('../config/imageGeneration.json');
      const config = configModule.default;
      
      return new ZaiClient({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey
      });
    } catch (error) {
      throw new Error('Z AI SDK configuration not found. Please set SDK_BASE_URL and SDK_API_KEY environment variables or configure imageGeneration.json');
    }
  }

  return new ZaiClient({ baseUrl, apiKey });
}