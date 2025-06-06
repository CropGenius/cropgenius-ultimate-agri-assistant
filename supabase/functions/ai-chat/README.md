# AI Chat Edge Function

This Edge Function provides AI-powered agricultural advice to farmers. It processes user questions and returns expert farming recommendations.

## Features

- Natural language processing for agricultural queries
- Category-specific expertise (crops, diseases, machinery, market)
- Fallback responses when API services are unavailable

## Technical Implementation

In production, this function would:

1. Securely store and use API keys for services like Google Gemini and OpenAI
2. Implement proper rate limiting and error handling
3. Maintain conversation context for multi-turn discussions
4. Include specialized agricultural knowledge databases
5. Provide multilingual support for farmers across Africa

## Required Environment Variables

- `GEMINI_API_KEY`: API key for Google's Gemini AI model
- `OPENAI_API_KEY`: Backup API key for OpenAI's models
- `AGRICULTURE_DATA_API_KEY`: For accessing specialized agricultural databases

## Security

This function includes proper CORS settings and authentication checks to ensure secure operation.
