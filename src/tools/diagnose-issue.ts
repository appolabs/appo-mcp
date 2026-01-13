import type { SdkFeature } from "./index.js";

interface DiagnoseIssueArgs {
  symptom: string;
  feature?: SdkFeature;
  errorMessage?: string;
  platform?: "ios" | "android" | "web" | "unknown";
}

interface Issue {
  title: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  codeExample?: string;
}

const knownIssues: Issue[] = [
  {
    title: "SDK not working in browser",
    symptoms: [
      "not working",
      "doesn't work",
      "nothing happens",
      "no response",
      "undefined",
      "browser",
      "web",
    ],
    causes: [
      "The SDK is designed for React Native WebViews and provides graceful fallbacks in browsers",
      "Native features require the host app to be running",
    ],
    solutions: [
      "Check `appo.isNative` before using native-only features",
      "Implement fallback UI for web browsers",
      "Test in the actual React Native WebView environment",
    ],
    codeExample: `const appo = getAppo();

if (appo.isNative) {
  // Full native functionality available
  const token = await appo.push.getToken();
} else {
  // Running in browser - show fallback
  console.log('Push notifications require the native app');
}`,
  },
  {
    title: "Permission always denied",
    symptoms: [
      "permission denied",
      "always denied",
      "can't get permission",
      "requestPermission returns denied",
    ],
    causes: [
      "Running in a browser (fallback returns 'denied')",
      "User previously denied permission",
      "Permission not configured in app.json/Info.plist",
    ],
    solutions: [
      "Check if running in native context with `appo.isNative`",
      "For iOS: Add usage description in Info.plist",
      "For Android: Ensure permissions in AndroidManifest.xml",
      "Guide users to enable permissions in device Settings",
    ],
    codeExample: `const status = await appo.push.requestPermission();

if (status === 'denied') {
  // Check if we're in native
  if (!appo.isNative) {
    console.log('Native app required for push notifications');
  } else {
    // User denied - prompt to enable in Settings
    alert('Please enable notifications in your device Settings');
  }
}`,
  },
  {
    title: "Push token is null",
    symptoms: [
      "token null",
      "token is null",
      "getToken returns null",
      "no push token",
      "undefined token",
    ],
    causes: [
      "Permission not granted before requesting token",
      "Running in browser (fallback returns null)",
      "Push notification service not configured",
      "Network connectivity issues",
    ],
    solutions: [
      "Always request permission before getting token",
      "Verify Expo push notification setup",
      "Check network connectivity",
      "Ensure `appo.isNative` is true",
    ],
    codeExample: `async function getPushToken() {
  const appo = getAppo();

  if (!appo.isNative) {
    console.log('Push requires native app');
    return null;
  }

  const permission = await appo.push.requestPermission();
  if (permission !== 'granted') {
    console.log('Permission not granted');
    return null;
  }

  const token = await appo.push.getToken();
  if (!token) {
    console.log('Could not get push token - check Expo config');
  }

  return token;
}`,
  },
  {
    title: "Biometrics not available",
    symptoms: [
      "biometrics not available",
      "face id not working",
      "touch id not working",
      "isAvailable returns false",
    ],
    causes: [
      "Device doesn't have biometric hardware",
      "Biometrics not enrolled on device",
      "Running in browser/simulator",
      "Permission not granted in app settings",
    ],
    solutions: [
      "Check `isAvailable()` before offering biometric auth",
      "Test on physical device with enrolled biometrics",
      "Provide password/PIN fallback",
    ],
    codeExample: `async function setupBiometrics() {
  const appo = getAppo();

  const available = await appo.biometrics.isAvailable();

  if (!available) {
    // Fallback to PIN or password
    return { method: 'password' };
  }

  return { method: 'biometrics' };
}`,
  },
  {
    title: "Camera not capturing",
    symptoms: [
      "camera not working",
      "takePicture returns null",
      "camera black screen",
      "no photo",
    ],
    causes: [
      "Permission not granted",
      "Camera in use by another app",
      "Running in browser",
      "User cancelled capture",
    ],
    solutions: [
      "Request and verify camera permission first",
      "Handle null return from takePicture()",
      "Check `appo.isNative` before camera operations",
    ],
    codeExample: `async function capturePhoto() {
  const appo = getAppo();

  if (!appo.isNative) {
    // Could use file input fallback
    return null;
  }

  const permission = await appo.camera.requestPermission();
  if (permission !== 'granted') {
    console.log('Camera permission required');
    return null;
  }

  const photo = await appo.camera.takePicture();
  if (!photo) {
    console.log('Photo capture cancelled or failed');
    return null;
  }

  return photo;
}`,
  },
  {
    title: "Location inaccurate or slow",
    symptoms: [
      "location inaccurate",
      "wrong location",
      "location slow",
      "takes long time",
      "accuracy",
    ],
    causes: [
      "GPS not available (indoors)",
      "Low accuracy mode enabled",
      "Device location services disabled",
    ],
    solutions: [
      "Check the accuracy property in the returned position",
      "Request high accuracy if needed",
      "Handle timeout gracefully",
      "Show loading state to user",
    ],
    codeExample: `async function getLocation() {
  const appo = getAppo();

  const position = await appo.location.getCurrentPosition();

  if (position) {
    if (position.accuracy > 100) {
      console.log('Low accuracy:', position.accuracy, 'meters');
      // Consider retrying or warning user
    }
    return position;
  }

  return null;
}`,
  },
  {
    title: "Storage not persisting",
    symptoms: [
      "storage not saving",
      "data lost",
      "storage cleared",
      "values disappear",
    ],
    causes: [
      "Using browser localStorage (cleared on app reinstall)",
      "Async timing issues",
      "Storage quota exceeded",
    ],
    solutions: [
      "Verify storage key consistency",
      "Await storage operations",
      "Handle storage errors",
    ],
    codeExample: `async function saveSettings(settings: object) {
  const appo = getAppo();

  try {
    await appo.storage.set('user-settings', JSON.stringify(settings));
    console.log('Settings saved');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

async function loadSettings() {
  const appo = getAppo();

  const stored = await appo.storage.get('user-settings');
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}`,
  },
  {
    title: "Network status incorrect",
    symptoms: [
      "network status wrong",
      "shows offline when online",
      "network not updating",
    ],
    causes: [
      "Browser fallback using navigator.onLine (limited accuracy)",
      "Network change listener not set up",
    ],
    solutions: [
      "Use onChange listener for real-time updates",
      "Don't rely solely on initial status",
      "Test actual network requests as backup",
    ],
    codeExample: `import { useEffect, useState } from 'react';
import { getAppo } from '@appolabs/appo';

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const appo = getAppo();

  useEffect(() => {
    // Initial status
    appo.network.getStatus().then(s => setIsOnline(s?.isConnected ?? true));

    // Listen for changes
    return appo.network.onChange(status => {
      setIsOnline(status?.isConnected ?? true);
    });
  }, []);

  return isOnline;
}`,
  },
  {
    title: "Types not working",
    symptoms: [
      "typescript error",
      "type error",
      "types not found",
      "cannot find module",
    ],
    causes: [
      "Package not properly installed",
      "TypeScript configuration issues",
      "IDE cache needs refresh",
    ],
    solutions: [
      "Reinstall the package: `pnpm add @appolabs/appo`",
      "Ensure moduleResolution is 'bundler' or 'node16'",
      "Restart your IDE/TypeScript server",
    ],
    codeExample: `// Make sure to import types explicitly if needed
import { getAppo } from '@appolabs/appo';
import type { PermissionStatus, PushMessage } from '@appolabs/appo';

const appo = getAppo();
// appo should now have full type inference`,
  },
];

export async function diagnoseIssue(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const { symptom, feature, errorMessage, platform } = args as unknown as DiagnoseIssueArgs;

  if (!symptom) {
    return {
      content: [
        {
          type: "text",
          text: "Please describe the issue you're experiencing in the `symptom` parameter.",
        },
      ],
    };
  }

  // Find matching issues
  const searchTerms = symptom.toLowerCase();
  const matchedIssues = knownIssues.filter((issue) =>
    issue.symptoms.some((s) => searchTerms.includes(s.toLowerCase()))
  );

  // Also filter by feature if provided
  const featureIssues = feature
    ? matchedIssues.filter(
        (issue) =>
          issue.title.toLowerCase().includes(feature) ||
          issue.symptoms.some((s) => s.includes(feature))
      )
    : matchedIssues;

  const relevantIssues = featureIssues.length > 0 ? featureIssues : matchedIssues;

  if (relevantIssues.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: buildGenericDiagnosis(symptom, feature, errorMessage, platform),
        },
      ],
    };
  }

  const output = buildDiagnosisOutput(relevantIssues, platform);

  return {
    content: [{ type: "text", text: output }],
  };
}

function buildDiagnosisOutput(issues: Issue[], platform?: string): string {
  const sections: string[] = [];

  sections.push("## Diagnosis Results\n");

  if (platform) {
    sections.push(`Platform: **${platform}**\n`);
  }

  for (const issue of issues.slice(0, 3)) {
    sections.push(`### ${issue.title}\n`);

    sections.push("**Possible Causes:**");
    issue.causes.forEach((c) => sections.push(`- ${c}`));
    sections.push("");

    sections.push("**Solutions:**");
    issue.solutions.forEach((s) => sections.push(`- ${s}`));
    sections.push("");

    if (issue.codeExample) {
      sections.push("**Example Fix:**");
      sections.push("```tsx");
      sections.push(issue.codeExample);
      sections.push("```");
      sections.push("");
    }
  }

  sections.push("---");
  sections.push(
    "\nIf none of these solutions work, please provide more details about your setup (package versions, platform, full error message)."
  );

  return sections.join("\n");
}

function buildGenericDiagnosis(
  symptom: string,
  feature?: SdkFeature,
  errorMessage?: string,
  platform?: string
): string {
  const sections: string[] = [];

  sections.push("## Diagnosis\n");
  sections.push(`**Symptom:** ${symptom}\n`);

  if (feature) sections.push(`**Feature:** ${feature}`);
  if (errorMessage) sections.push(`**Error:** ${errorMessage}`);
  if (platform) sections.push(`**Platform:** ${platform}`);
  sections.push("");

  sections.push("### General Troubleshooting Steps\n");
  sections.push("1. **Check native context:** Verify `appo.isNative` is true");
  sections.push("2. **Check permissions:** Ensure required permissions are granted");
  sections.push("3. **Check installation:** Verify `@appolabs/appo` is properly installed");
  sections.push("4. **Check console:** Look for errors in the console/logs");
  sections.push("5. **Test on device:** Some features only work on physical devices");
  sections.push("");

  sections.push("### Debug Code\n");
  sections.push("```tsx");
  sections.push("import { getAppo } from '@appolabs/appo';");
  sections.push("");
  sections.push("function debugSdk() {");
  sections.push("  const appo = getAppo();");
  sections.push("  console.log('SDK Version:', appo.version);");
  sections.push("  console.log('Is Native:', appo.isNative);");
  sections.push("  appo.device.getInfo().then(info => {");
  sections.push("    console.log('Device:', info);");
  sections.push("  });");
  sections.push("}");
  sections.push("```");
  sections.push("");

  sections.push(
    "Please provide more details (error messages, code snippets) for a more specific diagnosis."
  );

  return sections.join("\n");
}
