# UzzapBot Control Center

Admin dashboard for monitoring and managing the production UzzapBot Supabase backend.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Supabase JS
- shadcn/ui-compatible components

## Production architecture
UzzapAndroid → Supabase → UzzapBot Edge Function → Supabase

This repository is the management UI only. It is not the bot runtime.

## Environment
Create a `.env.local` with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never expose a Supabase service-role key in browser code.
