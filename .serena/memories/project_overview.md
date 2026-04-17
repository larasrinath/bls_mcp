# Project Overview

**bls-mcp** — An MCP (Model Context Protocol) server that wraps the U.S. Bureau of Labor Statistics Public Data API v2, exposing 6 tools for querying labor statistics over stdio transport.

## Tech Stack
- **Language**: TypeScript (strict mode, target ES2022)
- **Module system**: ESM (`"type": "module"`, imports use `.js` extensions)
- **Runtime**: Node.js
- **Key dependencies**: `@modelcontextprotocol/sdk`, `axios`, `zod`
- **Dev tools**: `tsx` (for dev mode), TypeScript compiler

## Project Structure
```
src/
  index.ts          — Entry point: creates McpServer, registers tools, connects stdio transport
  client.ts         — Client class wrapping axios for BLS API; BlsApiError with rate-limit detection
  tools/
    series.ts       — registerSeriesTools(): get_latest_series, get_single_series, get_multiple_series
    surveys.ts      — registerSurveyTools(): get_all_surveys, get_survey, get_popular_series
skills/
  bls-query/        — Claude skill for mapping natural language to BLS series IDs
    SKILL.md        — Skill definition with workflow instructions
    references/
      series-catalog.md — ~100 common series ID mappings
dist/               — Compiled output (gitignored)
```

## Environment
- `BLS_API_KEY` (optional env var): Without it, 25 queries/day and 25 series/query. With it, 500/day and 50/query.
