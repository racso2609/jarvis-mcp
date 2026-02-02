import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as SchedulingService from "./scheduling";

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
