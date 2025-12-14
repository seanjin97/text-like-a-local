# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev       # Start development server with HMR
pnpm build     # Type-check with tsc, then build with Vite
pnpm lint      # Run ESLint
pnpm preview   # Preview production build
```

## Tech Stack

- React 19 with React Compiler enabled (babel-plugin-react-compiler)
- TypeScript 5.9
- Vite via rolldown-vite (experimental Rolldown-powered Vite)
- Tailwind CSS v4 with @tailwindcss/vite plugin
- ESLint with typescript-eslint, react-hooks, and react-refresh plugins
- Prettier for formatting

## Code Style

Prettier is configured with:
- 4-space indentation
- Single quotes
- Semicolons
- ES5 trailing commas

## Design System

Minimalistic, clean design with:
- Inter font family
- Light mode with neutral color palette (neutral-50 to neutral-900)
- Subtle shadows and borders
- Rounded corners (rounded-lg, rounded-xl)
- Consistent spacing and typography
- Minimal visual hierarchy with careful use of color and weight

## Architecture

Pure frontend app with BYOK (Bring Your Own Key) pattern. No backend - all API calls go directly to Gemini.

```
src/
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/              # API clients and utilities
└── App.tsx           # Main app with state management
```

**Key patterns:**
- API key stored in localStorage via `useApiKey` hook
- Gemini 2.5 Flash (gemini-2.5-flash) for vision analysis (direct REST API, no SDK)
- Images converted to base64 via FileReader API
- Discriminated union for app state (`{ status: 'idle' | 'processing' | 'success' | 'error', ... }`)
- Optional conversation goal feature to steer AI replies toward specific objectives

## Features

1. **Image Upload**: Supports drag-drop, click to browse, and paste from clipboard (Ctrl/Cmd+V)
2. **Conversation Goal**: Persistent optional text input at the top to guide all AI replies (e.g., "schedule a meeting", "decline politely")
3. **Conversation History**: Maintains context across multiple screenshot uploads - each new reply considers all previous messages for coherent responses
4. **Natural Reply Generation**: AI analyzes the chat screenshot, detects language and writing style, and generates contextually appropriate replies
5. **Auto-Translation**: When replies are generated in non-English languages, an English translation is automatically provided below the reply
6. **New Conversation**: Clear button to reset conversation history and start fresh

## Conversation Flow

- Set a goal (optional, persists across uploads)
- Upload first chat screenshot → Generate reply
- Upload next screenshot → AI considers previous context + generates coherent follow-up
- History is displayed showing all generated replies
- Click "New Conversation" to reset and start over
