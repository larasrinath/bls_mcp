# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
npm run build      # Compile TypeScript → dist/
npm run dev        # Run directly via tsx (no build needed)
npm start          # Run compiled dist/index.js
```

There is no test suite. No linter is configured.

## Architecture

This is an MCP server that wraps the [BLS Public Data API v2](https://www.bls.gov/developers/), exposing 6 tools for querying U.S. labor statistics over stdio transport.

**Entry point** (`src/index.ts`): Creates `McpServer`, reads `BLS_API_KEY` from env, instantiates `Client`, registers tools via `registerSeriesTools()` and `registerSurveyTools()`, connects stdio transport.

**API client** (`src/client.ts`): `Client` class wraps axios against `https://api.bls.gov/publicAPI/v2`. Automatically injects `registrationkey` into POST payloads when `BLS_API_KEY` is set. Custom `BlsApiError` class detects rate-limit responses (HTTP 429) to surface actionable messages.

**Tool modules** (`src/tools/series.ts`, `src/tools/surveys.ts`): Each exports a `register*Tools(server, client)` function that registers MCP tools with Zod-validated parameters. Series IDs are validated against `/^[A-Z0-9_#-]+$/`. Survey abbreviations must be exactly 2 uppercase letters. Both modules define a local `wrapError()` helper that adds rate-limit hints to error responses.

## Key Conventions

- **ESM modules** — `"type": "module"` in package.json; imports use `.js` extensions for compiled output
- **TypeScript strict mode** — target ES2022, module Node16
- **Environment variable** — `BLS_API_KEY` is optional; without it, the API allows 25 queries/day and 25 series/query (vs 500/day and 50/query with a key)

## Bundled Skill

`skills/bls-query/` contains a Claude skill that maps natural-language economic queries to BLS series IDs and tools. The series catalog at `skills/bls-query/references/series-catalog.md` has ~100 common series ID mappings (CPI, unemployment, employment, JOLTS, PPI, wages, productivity, etc.).
