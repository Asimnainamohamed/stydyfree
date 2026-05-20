import axios from 'axios';

export async function askAI(messages, systemPrompt) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  if (!apiKey) {
    throw new Error('OpenRouter API key is missing.');
  }

  try {
    const { data } = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': appOrigin,
          'X-Title': 'StudyNest',
        },
      },
    );

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('The AI assistant returned an empty response.');
    }

    return reply;
  } catch (error) {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Unable to reach the AI assistant.';

    throw new Error(message);
  }
}
