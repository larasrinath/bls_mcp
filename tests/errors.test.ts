import { test } from "node:test";
import assert from "node:assert/strict";
import { BlsApiError } from "../src/client.js";
import { wrapError, wrapValidationError } from "../src/tools/errors.js";

test("wrapError: BlsApiError with rate limit includes hint and marks isError", () => {
  const result = wrapError(new BlsApiError("Rate limit exceeded", 429));
  assert.equal(result.isError, true);
  assert.equal(result.content.length, 1);
  assert.equal(result.content[0].type, "text");
  assert.match(result.content[0].text, /^Error: Rate limit exceeded/);
  assert.match(result.content[0].text, /Consider setting BLS_API_KEY/);
});

test("wrapError: BlsApiError without rate limit omits hint", () => {
  const result = wrapError(new BlsApiError("Bad request", 400));
  assert.equal(result.isError, true);
  assert.equal(result.content[0].text, "Error: Bad request");
});

test("wrapError: non-BlsApiError produces unexpected-error shape", () => {
  const result = wrapError(new Error("boom"));
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /^Unexpected error:/);
});

test("wrapError: non-Error input is coerced via String()", () => {
  const result = wrapError("raw string failure");
  assert.equal(result.isError, true);
  assert.equal(result.content[0].text, "Unexpected error: raw string failure");
});

test("wrapValidationError: produces clean validation message", () => {
  const result = wrapValidationError("start_year (2025) must not be after end_year (2020)");
  assert.equal(result.isError, true);
  assert.equal(result.content.length, 1);
  assert.equal(result.content[0].type, "text");
  assert.equal(
    result.content[0].text,
    "Error: start_year (2025) must not be after end_year (2020)"
  );
  assert.doesNotMatch(result.content[0].text, /Unexpected error/);
});
