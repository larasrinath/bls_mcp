# Code Style & Conventions

## TypeScript
- Strict mode enabled
- Target: ES2022, Module: Node16, ModuleResolution: Node16
- ESM modules: `"type": "module"` in package.json
- Imports use `.js` extensions for compiled output compatibility

## Patterns
- **Tool registration**: Each tool module exports a `register*Tools(server, client)` function
- **Validation**: Zod schemas for MCP tool parameters
- **Series ID validation**: Regex pattern `/^[A-Z0-9_#-]+$/`
- **Survey abbreviations**: Exactly 2 uppercase letters
- **Error handling**: Each tool module defines a local `wrapError()` helper that adds rate-limit hints
- **API client**: `Client` class wraps axios, auto-injects `registrationkey` into POST payloads when `BLS_API_KEY` is set
- **Custom errors**: `BlsApiError` class with `isRateLimit` and `statusCode` properties

## Naming
- MCP tool names use snake_case (e.g., `get_latest_series`, `get_all_surveys`)
- TypeScript follows standard camelCase for variables/methods, PascalCase for classes/interfaces
