import { Link2, SendHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { askAI } from '../lib/openrouter';

function buildSystemPrompt(videoUrl) {
  return `You are a helpful study assistant for students preparing for placements and competitive exams.
The student is watching this YouTube video: ${videoUrl}.
Answer their questions clearly with:
- Simple explanation
- Key formulas if applicable
- Step by step approach with example
- Tips and shortcuts if available
Reply in the same language the student uses. If they write in Tamil, reply in Tamil. If English, reply in English.`;
}

export default function ChatPanel({ currentVideoUrl }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [draftContextUrl, setDraftContextUrl] = useState(currentVideoUrl);
  const [contextUrl, setContextUrl] = useState(currentVideoUrl);

  const systemPrompt = useMemo(() => buildSystemPrompt(contextUrl), [contextUrl]);

  useEffect(() => {
    setDraftContextUrl(currentVideoUrl);
    setContextUrl(currentVideoUrl);
  }, [currentVideoUrl]);

  async function handleSend(event) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: trimmedQuestion }];
    setMessages(nextMessages);
    setQuestion('');
    setLoading(true);

    try {
      const reply = await askAI(nextMessages, systemPrompt);
      setMessages((value) => [...value, { role: 'assistant', content: reply }]);
    } catch (error) {
      toast.error(error.message);
      setMessages((value) => [
        ...value,
        {
          role: 'assistant',
          content: `I could not connect to the AI assistant. ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleContextSubmit(event) {
    event.preventDefault();
    const nextUrl = draftContextUrl.trim();

    if (!nextUrl) {
      toast.error('Paste a YouTube link first.');
      return;
    }

    setContextUrl(nextUrl);
    setShowLinkInput(false);
    toast.success('Video context updated.');
  }

  return (
    <section className="flex min-h-[32rem] flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">Ask questions about the current lesson.</p>
        <button
          type="button"
          onClick={() => setShowLinkInput((value) => !value)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Link2 className="h-4 w-4" />
          <span>Paste YouTube Link</span>
        </button>
      </div>

      {showLinkInput ? (
        <form onSubmit={handleContextSubmit} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={draftContextUrl}
            onChange={(event) => setDraftContextUrl(event.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="min-h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Set Context
          </button>
        </form>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-52 items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
              Ask for an explanation, formula, worked example, or a quick revision summary.
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6',
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100',
                  ].join(' ')}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}

          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-lg bg-white px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                Thinking...
              </div>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-end gap-2">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask your doubt..."
              rows={2}
              className="min-h-12 flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Send message"
              title="Send"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
