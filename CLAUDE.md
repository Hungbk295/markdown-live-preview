# Markdown Live Preview Project

## MCP Servers

### Excalidraw MCP Server
Interactive diagram creation with hand-drawn style animations.

```json
{
  "mcpServers": {
    "excalidraw": {
      "command": "node",
      "args": ["/Users/jc/excalidraw-mcp/dist/index.js", "--stdio"]
    }
  }
}
```

## Project Context

This is a markdown live preview application that allows users to:
- Preview markdown files in real-time
- Share markdown content publicly
- Live edit with instant preview

The Excalidraw MCP integration allows creating diagrams and flowcharts directly within the markdown workflow.

## Available Tools

After MCP setup, these Excalidraw tools will be available:
- `read_me` - Get cheat sheet for Excalidraw elements format
- `create_view` - Create interactive diagrams from JSON elements