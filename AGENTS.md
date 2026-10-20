# Australian Proficiency — Agent Guidelines

## Language Policy
- **All source code, UI strings, comments, tests, documentation, and commit messages MUST be strictly in English.**

## Architecture Overview
- **Frontend**: React 19 + Vite + `vite-plugin-pwa`
- **Database**: Multi-tenant Supabase (`australian_proficiency` schema) with automatic `localStorage` fallback
- **AI Engine**: Gemini API (`gemini-3.5-flash` primary, `gemini-3.6-flash` fallback) for PTE Speaking/Writing rubric grading, dynamic PTE question generation, Aussie YouTube video analysis, and topic-based vocabulary card generation
- **PTE Scoring Engine**: Reverse-engineered Pearson PTE Academic scoring algorithms (`src/scoring/pteScoringEngine.js`) implementing exact partial credit (+1/-1 floor 0, adjacent pairs, word-level Levenshtein alignment, form gates, and 10-90 cross-module skill contributions)
- **Spaced Repetition**: FSRS-5 algorithm (`src/utils/fsrsEngine.js`)

## Commands
- `npm test` — Run Vitest unit & integration tests
- `npm run build` — Build production bundle in `dist/`
