import type { Prompt, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { SDK_FEATURES } from "../tools/index.js";

export const prompts: Prompt[] = [
  {
    name: "setup_wizard",
    description:
      "Interactive setup guidance for integrating @appolabs/appo SDK into a new or existing project",
    arguments: [
      {
        name: "projectType",
        description: "Is this a new project or existing project?",
        required: true,
      },
      {
        name: "framework",
        description: "Frontend framework (react, next, vue, other)",
        required: false,
      },
    ],
  },
  {
    name: "integrate_feature",
    description:
      "Step-by-step guide for integrating a specific SDK feature",
    arguments: [
      {
        name: "feature",
        description: `SDK feature to integrate (${SDK_FEATURES.join(", ")})`,
        required: true,
      },
      {
        name: "requirements",
        description: "Any specific requirements or constraints",
        required: false,
      },
    ],
  },
  {
    name: "debug_assistant",
    description:
      "Interactive troubleshooting assistant for SDK issues",
    arguments: [
      {
        name: "issue",
        description: "Description of the issue you're experiencing",
        required: true,
      },
      {
        name: "logs",
        description: "Any error logs or console output",
        required: false,
      },
    ],
  },
];

export async function handlePromptGet(
  name: string,
  args: Record<string, string>
): Promise<GetPromptResult> {
  switch (name) {
    case "setup_wizard":
      return getSetupWizardPrompt(args);
    case "integrate_feature":
      return getIntegrateFeaturePrompt(args);
    case "debug_assistant":
      return getDebugAssistantPrompt(args);
    default:
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Unknown prompt: ${name}`,
            },
          },
        ],
      };
  }
}

function getSetupWizardPrompt(args: Record<string, string>): GetPromptResult {
  const { projectType, framework = "react" } = args;

  const isNew = projectType === "new";

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `# @appolabs/appo SDK Setup Wizard

I need help setting up the @appolabs/appo SDK in my ${isNew ? "new" : "existing"} ${framework} project.

## Context

- **Project Type:** ${isNew ? "New project" : "Existing project"}
- **Framework:** ${framework}

## What I Need

Please guide me through:

1. **Installation**
   - How to install the @appolabs/appo package
   - Any peer dependencies needed

2. **Basic Setup**
   - How to initialize and use the SDK
   - TypeScript configuration if needed

3. **First Feature**
   - Help me implement a simple feature to verify the setup works
   - Suggest checking \`appo.isNative\` and \`appo.device.getInfo()\`

4. **Next Steps**
   - What features are available
   - How to test in development vs native app

Please provide step-by-step instructions with code examples. Use the generate_hook and generate_component tools to create any needed code.`,
        },
      },
    ],
  };
}

function getIntegrateFeaturePrompt(args: Record<string, string>): GetPromptResult {
  const { feature, requirements = "" } = args;

  const featureNames: Record<string, string> = {
    push: "Push Notifications",
    biometrics: "Biometric Authentication",
    camera: "Camera Capture",
    location: "Location Services",
    haptics: "Haptic Feedback",
    storage: "Persistent Storage",
    share: "Native Share",
    network: "Network Status",
    device: "Device Information",
  };

  const featureName = featureNames[feature] || feature;

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `# Integrate ${featureName} with @appolabs/appo

I want to add ${featureName.toLowerCase()} functionality to my app using the @appolabs/appo SDK.

## Feature: ${feature}

${requirements ? `## Specific Requirements\n${requirements}\n` : ""}

## What I Need

Please help me:

1. **Understand the API**
   - What methods are available for \`appo.${feature}\`
   - What are the return types and parameters

2. **Create a Custom Hook**
   - Use the \`generate_hook\` tool with feature="${feature}"
   - Include loading and error states

3. **Create a UI Component**
   - Use the \`generate_component\` tool with feature="${feature}"
   - Use Tailwind CSS for styling

4. **Handle Edge Cases**
   ${feature === "push" || feature === "camera" || feature === "location" ? "- Use `check_permissions` tool to review permission handling" : ""}
   - What happens in web browsers (fallback behavior)
   - Error handling best practices

5. **Testing**
   - How to test in development
   - What to test on actual devices

Please read the \`appo://api/${feature}\` and \`appo://examples/${feature}\` resources first, then generate the code.`,
        },
      },
    ],
  };
}

function getDebugAssistantPrompt(args: Record<string, string>): GetPromptResult {
  const { issue, logs = "" } = args;

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `# Debug @appolabs/appo Issue

I'm having trouble with the @appolabs/appo SDK and need help debugging.

## Issue Description

${issue}

${logs ? `## Error Logs / Console Output\n\`\`\`\n${logs}\n\`\`\`\n` : ""}

## What I Need

Please help me:

1. **Diagnose the Issue**
   - Use the \`diagnose_issue\` tool with the symptom description
   - Identify the most likely cause

2. **Verify Setup**
   - Check if the SDK is properly installed
   - Confirm we're in the right context (native vs web)

3. **Debug Steps**
   - Provide specific code to add for debugging
   - What to check in the console

4. **Solution**
   - Provide a fix or workaround
   - Explain why this happened

Please also check the \`appo://troubleshooting\` resource for known issues.

## Debug Snippet to Start

\`\`\`typescript
import { getAppo } from '@appolabs/appo';

const appo = getAppo();
console.log('SDK Version:', appo.version);
console.log('Is Native:', appo.isNative);

appo.device.getInfo().then(info => {
  console.log('Device:', info);
});
\`\`\``,
        },
      },
    ],
  };
}
