import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { generateHook } from "./generate-hook.js";
import { generateComponent } from "./generate-component.js";
import { scaffoldFeature } from "./scaffold-feature.js";
import { validateSetup } from "./validate-setup.js";
import { checkPermissions } from "./check-permissions.js";
import { diagnoseIssue } from "./diagnose-issue.js";

export const SDK_FEATURES = [
  "push",
  "biometrics",
  "camera",
  "location",
  "haptics",
  "storage",
  "share",
  "network",
  "device",
] as const;

export type SdkFeature = (typeof SDK_FEATURES)[number];

export const tools: Tool[] = [
  {
    name: "generate_hook",
    description:
      "Generate a custom React hook for an @appolabs/appo SDK feature. Returns TypeScript code with types, error handling, and loading states.",
    inputSchema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          enum: SDK_FEATURES,
          description: "The SDK feature to generate a hook for",
        },
        hookName: {
          type: "string",
          description:
            "Custom hook name (optional, defaults to use{Feature})",
        },
        includeLoading: {
          type: "boolean",
          description: "Include loading state management (default: true)",
        },
        includeError: {
          type: "boolean",
          description: "Include error state management (default: true)",
        },
      },
      required: ["feature"],
    },
  },
  {
    name: "generate_component",
    description:
      "Generate a UI component that uses @appolabs/appo SDK features. Returns a complete React component with SDK integration.",
    inputSchema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          enum: SDK_FEATURES,
          description: "The SDK feature to build the component around",
        },
        componentName: {
          type: "string",
          description: "Component name (optional, defaults to {Feature}Button or similar)",
        },
        styling: {
          type: "string",
          enum: ["tailwind", "css", "none"],
          description: "Styling approach (default: tailwind)",
        },
        variant: {
          type: "string",
          enum: ["button", "card", "form", "status"],
          description: "Component variant/type",
        },
      },
      required: ["feature"],
    },
  },
  {
    name: "scaffold_feature",
    description:
      "Scaffold complete feature integration including hook, component, and types. Returns multiple files with integration instructions.",
    inputSchema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          enum: SDK_FEATURES,
          description: "The SDK feature to scaffold",
        },
        directory: {
          type: "string",
          description: "Target directory path for file suggestions",
        },
        includeTests: {
          type: "boolean",
          description: "Include test file scaffolding (default: true)",
        },
      },
      required: ["feature"],
    },
  },
  {
    name: "validate_setup",
    description:
      "Validate @appolabs/appo SDK installation and configuration. Analyzes package.json and optionally checks import patterns.",
    inputSchema: {
      type: "object",
      properties: {
        packageJson: {
          type: "string",
          description: "Content of package.json file to analyze",
        },
        tsConfig: {
          type: "string",
          description: "Content of tsconfig.json (optional)",
        },
        sampleCode: {
          type: "string",
          description: "Sample code to check for proper SDK usage patterns",
        },
      },
      required: ["packageJson"],
    },
  },
  {
    name: "check_permissions",
    description:
      "Analyze permission handling patterns in code for a specific SDK feature. Returns analysis with suggestions for proper permission flow.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to analyze for permission handling",
        },
        feature: {
          type: "string",
          enum: ["push", "camera", "location"],
          description: "Feature requiring permission (push, camera, or location)",
        },
      },
      required: ["code", "feature"],
    },
  },
  {
    name: "diagnose_issue",
    description:
      "Diagnose common @appolabs/appo SDK integration issues. Provides diagnosis with solutions and code fixes.",
    inputSchema: {
      type: "object",
      properties: {
        symptom: {
          type: "string",
          description: "Description of the issue or error",
        },
        feature: {
          type: "string",
          enum: SDK_FEATURES,
          description: "SDK feature related to the issue (if known)",
        },
        errorMessage: {
          type: "string",
          description: "Exact error message (if available)",
        },
        platform: {
          type: "string",
          enum: ["ios", "android", "web", "unknown"],
          description: "Platform where issue occurs",
        },
      },
      required: ["symptom"],
    },
  },
];

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  switch (name) {
    case "generate_hook":
      return generateHook(args);
    case "generate_component":
      return generateComponent(args);
    case "scaffold_feature":
      return scaffoldFeature(args);
    case "validate_setup":
      return validateSetup(args);
    case "check_permissions":
      return checkPermissions(args);
    case "diagnose_issue":
      return diagnoseIssue(args);
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
      };
  }
}
