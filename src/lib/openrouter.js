import axios from 'axios';

export async function askAI(messages, systemPrompt) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/free';
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  if (!apiKey) {
    throw new Error('OpenRouter API key is missing.');
  }

  try {
    const { data } = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
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
    const status = error.response?.status;
    let message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Unable to reach the AI assistant.';

    if (status === 401) {
      message = 'OpenRouter API key is invalid or expired. Create a new key and update VITE_OPENROUTER_API_KEY.';
    } else if (status === 402) {
      message = 'OpenRouter account has no available credits, or this model is not free for your account.';
    } else if (status === 429) {
      message = 'OpenRouter rate limit reached. Wait a few minutes and try again.';
    }

    throw new Error(message);
  }
}
