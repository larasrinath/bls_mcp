import { test } from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client as BlsClient } from "../src/client.js";
import { registerSeriesTools } from "../src/tools/series.js";

class RecordingBlsClient extends BlsClient {
  public getSeriesDataCalls = 0;

  async getSeriesData(): Promise<unknown> {
    this.getSeriesDataCalls += 1;
    throw new Error("HTTP client should not be called when validation fails");
  }
}

async function buildServer() {
  const recording = new RecordingBlsClient();
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerSeriesTools(server, recording);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new McpClient({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return { client, server, recording };
}

test("get_multiple_series rejects start_year > end_year without calling the HTTP client", async () => {
  const { client, server, recording } = await buildServer();

  try {
    const result = (await client.callTool({
      name: "get_multiple_series",
      arguments: {
        series_ids: ["LAUCN040010000000005"],
        start_year: "2025",
        end_year: "2020",
      },
    })) as { isError?: boolean; content: { type: string; text: string }[] };

    assert.equal(result.isError, true);
    assert.equal(recording.getSeriesDataCalls, 0);
    assert.match(result.content[0].text, /^Error: start_year \(2025\) must not be after end_year \(2020\)$/);
    assert.doesNotMatch(result.content[0].text, /Unexpected error/);
  } finally {
    await Promise.all([client.close(), server.close()]);
  }
});
