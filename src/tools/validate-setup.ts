interface ValidateSetupArgs {
  packageJson: string;
  tsConfig?: string;
  sampleCode?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export async function validateSetup(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const { packageJson, tsConfig, sampleCode } = args as ValidateSetupArgs;

  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  // Parse package.json
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(packageJson);
  } catch {
    return {
      content: [
        {
          type: "text",
          text: "**Error:** Invalid package.json - could not parse JSON",
        },
      ],
    };
  }

  // Check for @appolabs/appo installation
  const dependencies = (pkg.dependencies || {}) as Record<string, string>;
  const devDependencies = (pkg.devDependencies || {}) as Record<string, string>;
  const allDeps = { ...dependencies, ...devDependencies };

  if (!allDeps["@appolabs/appo"]) {
    result.isValid = false;
    result.errors.push(
      "@appolabs/appo is not installed. Run: `npm install @appolabs/appo` or `pnpm add @appolabs/appo`"
    );
  } else {
    const version = allDeps["@appolabs/appo"];
    // Check version (basic semver check)
    if (version.startsWith("^0.") || version.startsWith("0.")) {
      result.warnings.push(
        `You're using version ${version} which may be a pre-release. Consider upgrading to stable v1.x.`
      );
    }
  }

  // Check for React (required for hooks)
  if (!allDeps["react"]) {
    result.warnings.push(
      "React is not listed as a dependency. The SDK hooks require React 16.8+."
    );
  } else {
    const reactVersion = allDeps["react"];
    const majorVersion = parseInt(reactVersion.replace(/[\^~]/, "").split(".")[0], 10);
    if (majorVersion < 16) {
      result.errors.push(
        `React ${reactVersion} is too old. The SDK requires React 16.8+ for hooks support.`
      );
      result.isValid = false;
    }
  }

  // Check for TypeScript (recommended)
  if (!allDeps["typescript"]) {
    result.suggestions.push(
      "Consider adding TypeScript for better type safety. The SDK provides full TypeScript definitions."
    );
  }

  // Validate tsconfig if provided
  if (tsConfig) {
    try {
      const ts = JSON.parse(tsConfig);
      const compilerOptions = ts.compilerOptions || {};

      // Check module resolution
      if (
        compilerOptions.moduleResolution &&
        !["node", "node16", "nodenext", "bundler"].includes(
          compilerOptions.moduleResolution.toLowerCase()
        )
      ) {
        result.warnings.push(
          `moduleResolution is set to "${compilerOptions.moduleResolution}". Consider using "bundler" or "node16" for better ESM support.`
        );
      }

      // Check strict mode
      if (!compilerOptions.strict) {
        result.suggestions.push(
          "Enable strict mode in tsconfig.json for better type checking with the SDK."
        );
      }

      // Check esModuleInterop
      if (!compilerOptions.esModuleInterop) {
        result.warnings.push(
          "Enable esModuleInterop in tsconfig.json for proper module imports."
        );
      }
    } catch {
      result.warnings.push("Could not parse tsconfig.json");
    }
  }

  // Validate sample code if provided
  if (sampleCode) {
    validateCodePatterns(sampleCode, result);
  }

  // Build output
  const output = buildValidationOutput(result);

  return {
    content: [{ type: "text", text: output }],
  };
}

function validateCodePatterns(code: string, result: ValidationResult): void {
  // Check for correct import
  if (code.includes("@appolabs/appo")) {
    if (!code.includes("getAppo") && !code.includes("from '@appolabs/appo'")) {
      result.warnings.push(
        "Make sure to import `getAppo` from '@appolabs/appo' to access the SDK instance."
      );
    }
  }

  // Check for direct window.appo access
  if (code.includes("window.appo")) {
    result.warnings.push(
      "Avoid accessing `window.appo` directly. Use `getAppo()` from the SDK for type safety and proper initialization."
    );
  }

  // Check for async/await usage with SDK methods
  const asyncMethods = [
    "requestPermission",
    "getToken",
    "authenticate",
    "takePicture",
    "getCurrentPosition",
    "getStatus",
    "getInfo",
  ];

  for (const method of asyncMethods) {
    const regex = new RegExp(`\\.${method}\\(.*\\)(?!\\s*\\.then)(?!\\s*;?\\s*$)`, "g");
    if (code.includes(`.${method}(`) && !code.includes(`await`) && !code.includes(".then(")) {
      result.warnings.push(
        `The method \`${method}\` returns a Promise. Make sure to use \`await\` or \`.then()\`.`
      );
      break;
    }
  }

  // Check for permission handling
  if (
    (code.includes("push.getToken") || code.includes("camera.takePicture") || code.includes("location.getCurrentPosition")) &&
    !code.includes("requestPermission")
  ) {
    result.suggestions.push(
      "Consider requesting permission before accessing protected features (push token, camera, location)."
    );
  }

  // Check for error handling
  if (code.includes("getAppo()") && !code.includes("try") && !code.includes("catch")) {
    result.suggestions.push(
      "Consider adding try/catch blocks around SDK calls to handle potential errors gracefully."
    );
  }

  // Check for cleanup in useEffect
  if (code.includes("useEffect") && code.includes("onMessage") && !code.includes("return")) {
    result.warnings.push(
      "When using `appo.push.onMessage()` in useEffect, make sure to return the unsubscribe function for cleanup."
    );
  }
}

function buildValidationOutput(result: ValidationResult): string {
  const sections: string[] = [];

  // Status header
  if (result.isValid && result.errors.length === 0) {
    sections.push("## ✅ Setup Validation Passed\n");
  } else {
    sections.push("## ❌ Setup Validation Failed\n");
  }

  // Errors
  if (result.errors.length > 0) {
    sections.push("### Errors\n");
    result.errors.forEach((e) => sections.push(`- ❌ ${e}`));
    sections.push("");
  }

  // Warnings
  if (result.warnings.length > 0) {
    sections.push("### Warnings\n");
    result.warnings.forEach((w) => sections.push(`- ⚠️ ${w}`));
    sections.push("");
  }

  // Suggestions
  if (result.suggestions.length > 0) {
    sections.push("### Suggestions\n");
    result.suggestions.forEach((s) => sections.push(`- 💡 ${s}`));
    sections.push("");
  }

  // If everything is good
  if (
    result.errors.length === 0 &&
    result.warnings.length === 0 &&
    result.suggestions.length === 0
  ) {
    sections.push(
      "Your @appolabs/appo setup looks good! The SDK is properly installed and configured."
    );
  }

  // Next steps
  sections.push("\n### Quick Start\n");
  sections.push("```tsx");
  sections.push("import { getAppo } from '@appolabs/appo';");
  sections.push("");
  sections.push("function MyComponent() {");
  sections.push("  const appo = getAppo();");
  sections.push("");
  sections.push("  // Check if running in native app");
  sections.push("  if (appo.isNative) {");
  sections.push("    // Use native features");
  sections.push("  }");
  sections.push("}");
  sections.push("```");

  return sections.join("\n");
}
