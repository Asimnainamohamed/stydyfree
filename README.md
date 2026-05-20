# StudyNest

StudyNest is a React + Vite study platform with Supabase auth/storage, YouTube search, and an OpenRouter-powered study assistant.

## Setup

1. Install dependencies with `npm install`.
2. Fill in `.env` with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`
   - `VITE_YOUTUBE_API_KEY`
   - `VITE_OPENROUTER_API_KEY`
   - `VITE_OPENROUTER_MODEL` optional, defaults to `openrouter/free`
3. Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.
4. Start the app with `npm run dev`.

## Routes

- `/login`
- `/signup`
- `/dashboard`
- `/search`
- `/watch?videoId=VIDEO_ID`
- `/notes`

## Deploy

Build command: `npm run build`

Publish/output directory: `dist`

Add these environment variables on your hosting provider:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`
- `VITE_YOUTUBE_API_KEY`
- `VITE_OPENROUTER_API_KEY`
- `VITE_OPENROUTER_MODEL` optional, defaults to `openrouter/free`
