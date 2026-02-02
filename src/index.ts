import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as SchedulingService from "./scheduling";
import * as SearchingService from "./searching";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import process from "node:process";

// Create server instance
export const server = new McpServer({
  name: "jarvis",
  version: "1.0.0",
  description: "Personal AI Assistant to help with bored tasks"
});

server.registerTool(
  SchedulingService.SERVICE_NAME,
  SchedulingService.SERVICE_CONFIG,
  SchedulingService.SERVICE_HANDLER as any
);

server.registerTool(
  SearchingService.SERVICE_NAME,
  SearchingService.SERVICE_CONFIG,
  SearchingService.SERVICE_HANDLER as any
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch(error => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
