import OpenAI from 'openai';

let _client: OpenAI | null = null;

export function openai() {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not set');
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

export function visionModel() {
  return process.env.OPENAI_VISION_MODEL ?? 'gpt-4o';
}
