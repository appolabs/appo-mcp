# @appolabs/appo-mcp

MCP (Model Context Protocol) server for improving developer experience when integrating the [@appolabs/appo](https://github.com/appolabs/appo) SDK into web applications.

## Features

This MCP server provides AI assistants with tools, resources, and prompts to help developers:

- **Generate Code** - Create hooks, components, and scaffolding for SDK features
- **Validate Setup** - Check SDK installation and configuration
- **Search Documentation** - Access API reference, examples, and best practices
- **Debug Issues** - Diagnose and fix common integration problems

## Installation

### For Claude Code / Cursor

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "appo": {
      "command": "npx",
      "args": ["-y", "@appolabs/appo-mcp"]
    }
  }
}
```

### For Development

```bash
git clone https://github.com/appolabs/appo-mcp.git
cd appo-mcp
pnpm install
pnpm build
pnpm start
```

## Available Tools

### Code Generation

| Tool | Description |
|------|-------------|
| `generate_hook` | Generate a React hook for any SDK feature |
| `generate_component` | Generate a UI component with SDK integration |
| `scaffold_feature` | Scaffold complete feature with hook, component, and types |

### Validation

| Tool | Description |
|------|-------------|
| `validate_setup` | Validate SDK installation and configuration |
| `check_permissions` | Analyze permission handling patterns |
| `diagnose_issue` | Diagnose common SDK integration issues |

## Available Resources

| URI | Description |
|-----|-------------|
| `appo://overview` | SDK overview and capabilities |
| `appo://api/{feature}` | API reference for each feature |
| `appo://examples/{feature}` | Code examples per feature |
| `appo://best-practices` | Integration best practices |
| `appo://troubleshooting` | Common issues and solutions |

**Features:** push, biometrics, camera, location, haptics, storage, share, network, device

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `setup_wizard` | Interactive setup guidance for new/existing projects |
| `integrate_feature` | Step-by-step feature integration guide |
| `debug_assistant` | Troubleshooting assistant for SDK issues |

## Usage Examples

### Generate a Hook

Ask your AI assistant:
> "Generate a push notifications hook using the appo SDK"

The assistant will use `generate_hook` with `feature: "push"`.

### Validate Setup

> "Check if my @appolabs/appo setup is correct"

The assistant will use `validate_setup` with your package.json.

### Debug an Issue

> "Push notifications always return denied"

The assistant will use `diagnose_issue` and `check_permissions` to help.

## SDK Features

The @appolabs/appo SDK provides access to:

- **Push Notifications** - Request permission, get tokens, receive notifications
- **Biometrics** - Face ID / Touch ID authentication
- **Camera** - Capture photos
- **Location** - GPS coordinates
- **Haptics** - Tactile feedback
- **Storage** - Persistent key-value storage
- **Share** - Native share sheet
- **Network** - Connectivity status
- **Device** - Platform and device info

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Run server
pnpm start

# Type check
pnpm typecheck

# Test
pnpm test
```

## License

MIT
