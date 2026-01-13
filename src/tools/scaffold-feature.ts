import type { SdkFeature } from "./index.js";

interface ScaffoldFeatureArgs {
  feature: SdkFeature;
  directory?: string;
  includeTests?: boolean;
}

const featureDescriptions: Record<SdkFeature, string> = {
  push: "Push Notifications - Request permission, get device token, receive notifications",
  biometrics: "Biometric Authentication - Face ID / Touch ID authentication",
  camera: "Camera - Request permission and capture photos",
  location: "Location - Request permission and get GPS coordinates",
  haptics: "Haptic Feedback - Trigger tactile feedback (impact, notifications)",
  storage: "Persistent Storage - Key-value storage with native backing",
  share: "Native Share Sheet - Share content using the native share dialog",
  network: "Network Status - Monitor connectivity and network type",
  device: "Device Info - Get platform, OS version, device details",
};

const permissionFeatures = ["push", "camera", "location"] as const;

export async function scaffoldFeature(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const {
    feature,
    directory = "src",
    includeTests = true,
  } = args as unknown as ScaffoldFeatureArgs;

  if (!feature || !featureDescriptions[feature]) {
    return {
      content: [
        {
          type: "text",
          text: `Invalid feature. Available features:\n${Object.entries(featureDescriptions)
            .map(([key, desc]) => `- ${key}: ${desc}`)
            .join("\n")}`,
        },
      ],
    };
  }

  const capitalizedFeature = feature.charAt(0).toUpperCase() + feature.slice(1);
  const hookName = `use${capitalizedFeature}`;
  const componentName = `${capitalizedFeature}Component`;
  const requiresPermission = permissionFeatures.includes(feature as typeof permissionFeatures[number]);

  const files = generateScaffoldFiles(feature, capitalizedFeature, hookName, componentName, directory, includeTests, requiresPermission);

  return {
    content: [
      {
        type: "text",
        text: `# ${capitalizedFeature} Feature Scaffold

${featureDescriptions[feature]}

## Files to Create

${files.map((f) => `### ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join("\n\n")}

## Integration Steps

1. **Install the SDK** (if not already installed):
   \`\`\`bash
   npm install @appolabs/appo
   # or
   pnpm add @appolabs/appo
   \`\`\`

2. **Create the files** listed above in your project

3. **Import and use** in your app:
   \`\`\`tsx
   import { ${componentName} } from './${directory}/components/${feature}';

   function App() {
     return <${componentName} />;
   }
   \`\`\`

${requiresPermission ? `## Permission Handling

This feature requires user permission. The scaffold includes:
- Permission request on first interaction
- Graceful handling of denied permissions
- Loading states during permission checks

**Important:** Always explain to users WHY you need this permission before requesting it.` : ""}

## Native vs Web Behavior

The SDK provides automatic fallbacks for web browsers:
${getNativeFallbackInfo(feature)}`,
      },
    ],
  };
}

function generateScaffoldFiles(
  feature: SdkFeature,
  _capitalizedFeature: string,
  hookName: string,
  componentName: string,
  directory: string,
  includeTests: boolean,
  _requiresPermission: boolean
): Array<{ path: string; language: string; content: string }> {
  const files: Array<{ path: string; language: string; content: string }> = [];

  // Types file
  files.push({
    path: `${directory}/types/${feature}.ts`,
    language: "typescript",
    content: generateTypesFile(feature),
  });

  // Hook file
  files.push({
    path: `${directory}/hooks/${hookName}.ts`,
    language: "typescript",
    content: generateHookFile(feature, hookName, _requiresPermission),
  });

  // Component file
  files.push({
    path: `${directory}/components/${componentName}.tsx`,
    language: "tsx",
    content: generateComponentFile(feature, componentName, hookName),
  });

  // Test file
  if (includeTests) {
    files.push({
      path: `${directory}/__tests__/${hookName}.test.ts`,
      language: "typescript",
      content: generateTestFile(feature, hookName),
    });
  }

  return files;
}

function generateTypesFile(feature: SdkFeature): string {
  const types: Record<SdkFeature, string> = {
    push: `export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface UsePushReturn {
  permission: PermissionStatus | null;
  token: string | null;
  isLoading: boolean;
  error: Error | null;
  requestPermission: () => Promise<PermissionStatus>;
  getToken: () => Promise<string | null>;
}`,
    biometrics: `export interface UseBiometricsReturn {
  isAvailable: boolean | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  checkAvailability: () => Promise<boolean>;
  authenticate: (reason: string) => Promise<boolean>;
}`,
    camera: `export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface Photo {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

export interface UseCameraReturn {
  permission: PermissionStatus | null;
  photo: Photo | null;
  isLoading: boolean;
  error: Error | null;
  requestPermission: () => Promise<PermissionStatus>;
  takePicture: () => Promise<Photo | null>;
  clearPhoto: () => void;
}`,
    location: `export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface Position {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  timestamp: number;
}

export interface UseLocationReturn {
  permission: PermissionStatus | null;
  position: Position | null;
  isLoading: boolean;
  error: Error | null;
  requestPermission: () => Promise<PermissionStatus>;
  getCurrentPosition: () => Promise<Position | null>;
}`,
    haptics: `export type ImpactStyle = 'light' | 'medium' | 'heavy';
export type NotificationType = 'success' | 'warning' | 'error';

export interface UseHapticsReturn {
  impact: (style?: ImpactStyle) => void;
  notification: (type: NotificationType) => void;
  success: () => void;
  warning: () => void;
  error: () => void;
}`,
    storage: `export interface UseStorageReturn<T> {
  value: T | null;
  isLoading: boolean;
  error: Error | null;
  get: () => Promise<T | null>;
  set: (value: T) => Promise<void>;
  remove: () => Promise<void>;
}`,
    share: `export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  action?: string;
}

export interface UseShareReturn {
  isLoading: boolean;
  error: Error | null;
  share: (options: ShareOptions) => Promise<ShareResult>;
}`,
    network: `export interface NetworkStatus {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'unknown' | 'none';
}

export interface UseNetworkReturn {
  status: NetworkStatus | null;
  isOnline: boolean;
  refresh: () => Promise<NetworkStatus | null>;
}`,
    device: `export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
  deviceId: string;
  deviceName: string;
  isTablet: boolean;
}

export interface UseDeviceReturn {
  info: DeviceInfo | null;
  isNative: boolean;
  isLoading: boolean;
  error: Error | null;
}`,
  };

  return types[feature];
}

function generateHookFile(
  feature: SdkFeature,
  hookName: string,
  _requiresPermission: boolean
): string {
  return `import { useState, useCallback${feature === "network" || feature === "device" ? ", useEffect" : ""} } from 'react';
import { getAppo } from '@appolabs/appo';
import type { Use${feature.charAt(0).toUpperCase() + feature.slice(1)}Return } from '../types/${feature}';

export function ${hookName}(): Use${feature.charAt(0).toUpperCase() + feature.slice(1)}Return {
  const appo = getAppo();

  // TODO: Implement hook logic for ${feature}
  // See @appolabs/appo-mcp generate_hook tool for full implementation

  throw new Error('${hookName} not implemented - use generate_hook tool');
}
`;
}

function generateComponentFile(
  feature: SdkFeature,
  componentName: string,
  hookName: string
): string {
  return `import { ${hookName} } from '../hooks/${hookName}';

export function ${componentName}() {
  const hook = ${hookName}();

  // TODO: Implement component UI for ${feature}
  // See @appolabs/appo-mcp generate_component tool for full implementation

  return (
    <div>
      <p>${feature} component placeholder</p>
    </div>
  );
}
`;
}

function generateTestFile(feature: SdkFeature, hookName: string): string {
  return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ${hookName} } from '../hooks/${hookName}';

// Mock @appolabs/appo
vi.mock('@appolabs/appo', () => ({
  getAppo: () => ({
    isNative: false,
    ${feature}: {
      // Add mock methods for ${feature} API
    },
  }),
}));

describe('${hookName}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => ${hookName}());

    // Add assertions based on feature
    expect(result.current).toBeDefined();
  });

  // Add more tests for ${feature} functionality
});
`;
}

function getNativeFallbackInfo(feature: SdkFeature): string {
  const fallbacks: Record<SdkFeature, string> = {
    push: "- Web: Returns 'denied' permission, null token",
    biometrics: "- Web: Returns false for availability",
    camera: "- Web: Returns 'denied' permission",
    location: "- Web: Returns 'denied' permission (consider using browser Geolocation API)",
    haptics: "- Web: Silent no-op (no vibration API used)",
    storage: "- Web: Falls back to localStorage",
    share: "- Web: Uses navigator.share() if available, otherwise fails gracefully",
    network: "- Web: Uses navigator.onLine and online/offline events",
    device: "- Web: Parses user agent for basic device info",
  };

  return fallbacks[feature];
}
