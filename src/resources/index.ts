import type { Resource } from "@modelcontextprotocol/sdk/types.js";
import { SDK_FEATURES, type SdkFeature } from "../tools/index.js";
import { getApiReference } from "./api-reference.js";
import { getExamples } from "./examples.js";
import { getBestPractices } from "./best-practices.js";
import { getTroubleshooting } from "./troubleshooting.js";

// Generate resources list
export const resources: Resource[] = [
  // API Reference per feature
  ...SDK_FEATURES.map((feature) => ({
    uri: `appo://api/${feature}`,
    name: `API: ${feature}`,
    description: `API reference for appo.${feature}`,
    mimeType: "text/markdown",
  })),

  // Examples per feature
  ...SDK_FEATURES.map((feature) => ({
    uri: `appo://examples/${feature}`,
    name: `Examples: ${feature}`,
    description: `Code examples for ${feature} feature`,
    mimeType: "text/markdown",
  })),

  // Guides
  {
    uri: "appo://best-practices",
    name: "Best Practices",
    description: "Integration best practices and patterns",
    mimeType: "text/markdown",
  },
  {
    uri: "appo://troubleshooting",
    name: "Troubleshooting",
    description: "Common issues and solutions",
    mimeType: "text/markdown",
  },
  {
    uri: "appo://overview",
    name: "SDK Overview",
    description: "Overview of @appolabs/appo SDK capabilities",
    mimeType: "text/markdown",
  },
];

export async function handleResourceRead(
  uri: string
): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
  const parsed = parseUri(uri);

  if (!parsed) {
    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: `Unknown resource: ${uri}`,
        },
      ],
    };
  }

  let content: string;

  switch (parsed.type) {
    case "api":
      content = getApiReference(parsed.feature as SdkFeature);
      break;
    case "examples":
      content = getExamples(parsed.feature as SdkFeature);
      break;
    case "best-practices":
      content = getBestPractices();
      break;
    case "troubleshooting":
      content = getTroubleshooting();
      break;
    case "overview":
      content = getOverview();
      break;
    default:
      content = `Unknown resource type: ${parsed.type}`;
  }

  return {
    contents: [
      {
        uri,
        mimeType: "text/markdown",
        text: content,
      },
    ],
  };
}

function parseUri(
  uri: string
): { type: string; feature?: string } | null {
  const match = uri.match(/^appo:\/\/(.+)$/);
  if (!match) return null;

  const path = match[1];
  const parts = path.split("/");

  if (parts.length === 1) {
    return { type: parts[0] };
  }

  if (parts.length === 2) {
    return { type: parts[0], feature: parts[1] };
  }

  return null;
}

function getOverview(): string {
  return `# @appolabs/appo SDK Overview

## What is Appo?

@appolabs/appo is a JavaScript SDK that provides a bridge between your web application and native mobile features when running inside an Appo-powered React Native WebView.

## Key Features

The SDK provides access to 9 native feature categories:

| Feature | Description |
|---------|-------------|
| **Push Notifications** | Request permission, get device token, receive notifications |
| **Biometrics** | Face ID / Touch ID authentication |
| **Camera** | Capture photos with the device camera |
| **Location** | Access GPS coordinates |
| **Haptics** | Trigger tactile feedback |
| **Storage** | Persistent key-value storage |
| **Share** | Native share sheet |
| **Network** | Monitor connectivity status |
| **Device** | Get device information |

## Installation

\`\`\`bash
npm install @appolabs/appo
# or
pnpm add @appolabs/appo
\`\`\`

## Basic Usage

\`\`\`typescript
import { getAppo } from '@appolabs/appo';

const appo = getAppo();

// Check if running in native app
if (appo.isNative) {
  // Full native functionality available
  const token = await appo.push.getToken();
} else {
  // Running in browser - fallbacks active
}
\`\`\`

## Architecture

The SDK uses a message-passing protocol to communicate with the React Native host:

1. Your web code calls SDK methods
2. SDK sends structured messages to React Native
3. React Native processes requests and sends responses
4. SDK resolves promises with results

## Graceful Fallbacks

All SDK methods work in both native and web contexts:

- **Native**: Full functionality via React Native bridge
- **Web**: Sensible fallbacks (localStorage, navigator APIs, or null returns)

This means you can develop and test in a browser, then deploy to the native app.

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

\`\`\`typescript
import { getAppo, type PermissionStatus, type PushMessage } from '@appolabs/appo';
\`\`\`

## Next Steps

- Read the API reference for each feature
- Check the examples for common patterns
- Review best practices for production apps
`;
}
