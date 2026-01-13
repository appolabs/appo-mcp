type PermissionFeature = "push" | "camera" | "location";

interface CheckPermissionsArgs {
  code: string;
  feature: PermissionFeature;
}

interface PermissionAnalysis {
  hasPermissionRequest: boolean;
  hasStatusCheck: boolean;
  hasDeniedHandling: boolean;
  hasUndeterminedHandling: boolean;
  hasErrorHandling: boolean;
  hasUserExplanation: boolean;
  issues: string[];
  suggestions: string[];
}

const featureApiMap: Record<PermissionFeature, { api: string; protectedMethods: string[] }> = {
  push: {
    api: "appo.push",
    protectedMethods: ["getToken"],
  },
  camera: {
    api: "appo.camera",
    protectedMethods: ["takePicture"],
  },
  location: {
    api: "appo.location",
    protectedMethods: ["getCurrentPosition"],
  },
};

export async function checkPermissions(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const { code, feature } = args as unknown as CheckPermissionsArgs;

  if (!code || !feature) {
    return {
      content: [
        {
          type: "text",
          text: "Please provide both `code` and `feature` (push, camera, or location) parameters.",
        },
      ],
    };
  }

  if (!featureApiMap[feature]) {
    return {
      content: [
        {
          type: "text",
          text: `Invalid feature. Permission-required features are: ${Object.keys(featureApiMap).join(", ")}`,
        },
      ],
    };
  }

  const analysis = analyzePermissionPatterns(code, feature);
  const output = buildAnalysisOutput(feature, analysis);

  return {
    content: [{ type: "text", text: output }],
  };
}

function analyzePermissionPatterns(
  code: string,
  feature: PermissionFeature
): PermissionAnalysis {
  const analysis: PermissionAnalysis = {
    hasPermissionRequest: false,
    hasStatusCheck: false,
    hasDeniedHandling: false,
    hasUndeterminedHandling: false,
    hasErrorHandling: false,
    hasUserExplanation: false,
    issues: [],
    suggestions: [],
  };

  const { protectedMethods } = featureApiMap[feature];

  // Check for permission request
  if (code.includes("requestPermission")) {
    analysis.hasPermissionRequest = true;
  }

  // Check for status/permission variable handling
  if (
    code.includes("permission") ||
    code.includes("status") ||
    code.includes("'granted'") ||
    code.includes('"granted"')
  ) {
    analysis.hasStatusCheck = true;
  }

  // Check for denied handling
  if (
    code.includes("'denied'") ||
    code.includes('"denied"') ||
    code.includes("=== 'denied'") ||
    code.includes('=== "denied"')
  ) {
    analysis.hasDeniedHandling = true;
  }

  // Check for undetermined handling
  if (
    code.includes("'undetermined'") ||
    code.includes('"undetermined"') ||
    code.includes("null")
  ) {
    analysis.hasUndeterminedHandling = true;
  }

  // Check for error handling
  if (code.includes("try") && code.includes("catch")) {
    analysis.hasErrorHandling = true;
  }

  // Check for user explanation (common patterns)
  if (
    code.includes("modal") ||
    code.includes("Modal") ||
    code.includes("dialog") ||
    code.includes("Dialog") ||
    code.includes("alert") ||
    code.includes("confirm") ||
    code.includes("explanation") ||
    code.includes("why") ||
    code.includes("permission needed")
  ) {
    analysis.hasUserExplanation = true;
  }

  // Check for issues
  for (const method of protectedMethods) {
    if (code.includes(`.${method}(`) && !code.includes("requestPermission")) {
      analysis.issues.push(
        `Protected method \`${method}\` is used without requesting permission first.`
      );
    }
  }

  if (!analysis.hasPermissionRequest) {
    analysis.issues.push(
      `No \`requestPermission()\` call found for ${feature}.`
    );
  }

  if (!analysis.hasDeniedHandling) {
    analysis.issues.push(
      "No handling for 'denied' permission status. Users who deny permission won't see helpful feedback."
    );
  }

  // Add suggestions
  if (!analysis.hasUserExplanation) {
    analysis.suggestions.push(
      "Consider explaining to users WHY you need this permission before requesting it. This improves acceptance rates."
    );
  }

  if (!analysis.hasErrorHandling) {
    analysis.suggestions.push(
      "Add try/catch blocks to handle potential errors during permission requests."
    );
  }

  if (!analysis.hasUndeterminedHandling) {
    analysis.suggestions.push(
      "Handle the 'undetermined' state - this is the initial state before the user makes a choice."
    );
  }

  return analysis;
}

function buildAnalysisOutput(
  feature: PermissionFeature,
  analysis: PermissionAnalysis
): string {
  const sections: string[] = [];

  sections.push(`## ${feature.charAt(0).toUpperCase() + feature.slice(1)} Permission Analysis\n`);

  // Checklist
  sections.push("### Permission Flow Checklist\n");
  sections.push(
    `- [${analysis.hasPermissionRequest ? "x" : " "}] Calls \`requestPermission()\``
  );
  sections.push(
    `- [${analysis.hasStatusCheck ? "x" : " "}] Checks permission status`
  );
  sections.push(
    `- [${analysis.hasDeniedHandling ? "x" : " "}] Handles 'denied' status`
  );
  sections.push(
    `- [${analysis.hasUndeterminedHandling ? "x" : " "}] Handles initial/undetermined state`
  );
  sections.push(
    `- [${analysis.hasErrorHandling ? "x" : " "}] Has error handling`
  );
  sections.push(
    `- [${analysis.hasUserExplanation ? "x" : " "}] Explains why permission is needed`
  );
  sections.push("");

  // Issues
  if (analysis.issues.length > 0) {
    sections.push("### Issues Found\n");
    analysis.issues.forEach((issue) => sections.push(`- ❌ ${issue}`));
    sections.push("");
  }

  // Suggestions
  if (analysis.suggestions.length > 0) {
    sections.push("### Suggestions\n");
    analysis.suggestions.forEach((s) => sections.push(`- 💡 ${s}`));
    sections.push("");
  }

  // Best practice example
  sections.push("### Recommended Pattern\n");
  sections.push("```tsx");
  sections.push(getRecommendedPattern(feature));
  sections.push("```");

  return sections.join("\n");
}

function getRecommendedPattern(feature: PermissionFeature): string {
  const patterns: Record<PermissionFeature, string> = {
    push: `import { useState } from 'react';
import { getAppo, type PermissionStatus } from '@appolabs/appo';

function PushNotificationSetup() {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);
  const appo = getAppo();

  const handleEnable = async () => {
    try {
      const result = await appo.push.requestPermission();
      setStatus(result);

      if (result === 'granted') {
        const token = await appo.push.getToken();
        // Send token to your backend
      }
    } catch (error) {
      console.error('Push permission error:', error);
    }
  };

  if (status === 'denied') {
    return <p>Push notifications are disabled. Enable them in Settings.</p>;
  }

  if (showExplanation) {
    return (
      <div>
        <p>We'll send you updates about your orders and exclusive offers.</p>
        <button onClick={() => { setShowExplanation(false); handleEnable(); }}>
          Enable Notifications
        </button>
      </div>
    );
  }

  return null;
}`,
    camera: `import { useState } from 'react';
import { getAppo, type PermissionStatus } from '@appolabs/appo';

function CameraCapture() {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const appo = getAppo();

  const handleCapture = async () => {
    try {
      // Request permission first
      if (status !== 'granted') {
        const result = await appo.camera.requestPermission();
        setStatus(result);
        if (result !== 'granted') return;
      }

      // Now safe to capture
      const photo = await appo.camera.takePicture();
      if (photo) {
        // Handle photo
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  if (status === 'denied') {
    return <p>Camera access denied. Please enable in Settings.</p>;
  }

  return <button onClick={handleCapture}>Take Photo</button>;
}`,
    location: `import { useState } from 'react';
import { getAppo, type PermissionStatus } from '@appolabs/appo';

function LocationAccess() {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [showRationale, setShowRationale] = useState(true);
  const appo = getAppo();

  const handleGetLocation = async () => {
    try {
      if (status !== 'granted') {
        const result = await appo.location.requestPermission();
        setStatus(result);
        if (result !== 'granted') return;
      }

      const position = await appo.location.getCurrentPosition();
      if (position) {
        // Use location
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  if (status === 'denied') {
    return <p>Location access denied. Enable in Settings to use this feature.</p>;
  }

  if (showRationale) {
    return (
      <div>
        <p>We need your location to find nearby stores.</p>
        <button onClick={() => { setShowRationale(false); handleGetLocation(); }}>
          Share Location
        </button>
      </div>
    );
  }

  return null;
}`,
  };

  return patterns[feature];
}
