import type { SdkFeature } from "./index.js";

interface GenerateHookArgs {
  feature: SdkFeature;
  hookName?: string;
  includeLoading?: boolean;
  includeError?: boolean;
}

const hookTemplates: Record<SdkFeature, (args: GenerateHookArgs) => string> = {
  push: ({ hookName = "usePushNotifications", includeLoading = true, includeError = true }) => `
import { useState, useEffect, useCallback } from 'react';
import { getAppo, type PushMessage, type PermissionStatus } from '@appolabs/appo';

interface UsePushNotificationsReturn {
  permission: PermissionStatus | null;
  token: string | null;
  ${includeLoading ? "isLoading: boolean;" : ""}
  ${includeError ? "error: Error | null;" : ""}
  requestPermission: () => Promise<PermissionStatus>;
  getToken: () => Promise<string | null>;
}

export function ${hookName}(
  onMessage?: (message: PushMessage) => void
): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<PermissionStatus | null>(null);
  const [token, setToken] = useState<string | null>(null);
  ${includeLoading ? "const [isLoading, setIsLoading] = useState(false);" : ""}
  ${includeError ? "const [error, setError] = useState<Error | null>(null);" : ""}

  const appo = getAppo();

  useEffect(() => {
    if (!onMessage) return;
    return appo.push.onMessage(onMessage);
  }, [onMessage]);

  const requestPermission = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const status = await appo.push.requestPermission();
      setPermission(status);
      return status;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to request permission'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  const getTokenFn = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const pushToken = await appo.push.getToken();
      setToken(pushToken);
      return pushToken;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to get token'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  return {
    permission,
    token,
    ${includeLoading ? "isLoading," : ""}
    ${includeError ? "error," : ""}
    requestPermission,
    getToken: getTokenFn,
  };
}
`.trim(),

  biometrics: ({ hookName = "useBiometrics", includeLoading = true, includeError = true }) => `
import { useState, useCallback } from 'react';
import { getAppo } from '@appolabs/appo';

interface UseBiometricsReturn {
  isAvailable: boolean | null;
  isAuthenticated: boolean;
  ${includeLoading ? "isLoading: boolean;" : ""}
  ${includeError ? "error: Error | null;" : ""}
  checkAvailability: () => Promise<boolean>;
  authenticate: (reason: string) => Promise<boolean>;
}

export function ${hookName}(): UseBiometricsReturn {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  ${includeLoading ? "const [isLoading, setIsLoading] = useState(false);" : ""}
  ${includeError ? "const [error, setError] = useState<Error | null>(null);" : ""}

  const appo = getAppo();

  const checkAvailability = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const available = await appo.biometrics.isAvailable();
      setIsAvailable(available);
      return available;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to check biometrics'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  const authenticate = useCallback(async (reason: string) => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const success = await appo.biometrics.authenticate(reason);
      setIsAuthenticated(success);
      return success;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Biometric authentication failed'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  return {
    isAvailable,
    isAuthenticated,
    ${includeLoading ? "isLoading," : ""}
    ${includeError ? "error," : ""}
    checkAvailability,
    authenticate,
  };
}
`.trim(),

  camera: ({ hookName = "useCamera", includeLoading = true, includeError = true }) => `
import { useState, useCallback } from 'react';
import { getAppo, type PermissionStatus } from '@appolabs/appo';

interface Photo {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

interface UseCameraReturn {
  permission: PermissionStatus | null;
  photo: Photo | null;
  ${includeLoading ? "isLoading: boolean;" : ""}
  ${includeError ? "error: Error | null;" : ""}
  requestPermission: () => Promise<PermissionStatus>;
  takePicture: () => Promise<Photo | null>;
  clearPhoto: () => void;
}

export function ${hookName}(): UseCameraReturn {
  const [permission, setPermission] = useState<PermissionStatus | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  ${includeLoading ? "const [isLoading, setIsLoading] = useState(false);" : ""}
  ${includeError ? "const [error, setError] = useState<Error | null>(null);" : ""}

  const appo = getAppo();

  const requestPermission = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const status = await appo.camera.requestPermission();
      setPermission(status);
      return status;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to request camera permission'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  const takePicture = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const result = await appo.camera.takePicture();
      if (result) {
        setPhoto(result);
      }
      return result;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to take picture'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
  }, []);

  return {
    permission,
    photo,
    ${includeLoading ? "isLoading," : ""}
    ${includeError ? "error," : ""}
    requestPermission,
    takePicture,
    clearPhoto,
  };
}
`.trim(),

  location: ({ hookName = "useLocation", includeLoading = true, includeError = true }) => `
import { useState, useCallback } from 'react';
import { getAppo, type PermissionStatus } from '@appolabs/appo';

interface Position {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  timestamp: number;
}

interface UseLocationReturn {
  permission: PermissionStatus | null;
  position: Position | null;
  ${includeLoading ? "isLoading: boolean;" : ""}
  ${includeError ? "error: Error | null;" : ""}
  requestPermission: () => Promise<PermissionStatus>;
  getCurrentPosition: () => Promise<Position | null>;
}

export function ${hookName}(): UseLocationReturn {
  const [permission, setPermission] = useState<PermissionStatus | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  ${includeLoading ? "const [isLoading, setIsLoading] = useState(false);" : ""}
  ${includeError ? "const [error, setError] = useState<Error | null>(null);" : ""}

  const appo = getAppo();

  const requestPermission = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const status = await appo.location.requestPermission();
      setPermission(status);
      return status;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to request location permission'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  const getCurrentPosition = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const pos = await appo.location.getCurrentPosition();
      if (pos) {
        setPosition(pos);
      }
      return pos;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to get location'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  return {
    permission,
    position,
    ${includeLoading ? "isLoading," : ""}
    ${includeError ? "error," : ""}
    requestPermission,
    getCurrentPosition,
  };
}
`.trim(),

  haptics: ({ hookName = "useHaptics" }) => `
import { useCallback } from 'react';
import { getAppo } from '@appolabs/appo';

type ImpactStyle = 'light' | 'medium' | 'heavy';
type NotificationType = 'success' | 'warning' | 'error';

interface UseHapticsReturn {
  impact: (style?: ImpactStyle) => void;
  notification: (type: NotificationType) => void;
  success: () => void;
  warning: () => void;
  error: () => void;
}

export function ${hookName}(): UseHapticsReturn {
  const appo = getAppo();

  const impact = useCallback((style: ImpactStyle = 'medium') => {
    appo.haptics.impact(style);
  }, []);

  const notification = useCallback((type: NotificationType) => {
    appo.haptics.notification(type);
  }, []);

  const success = useCallback(() => {
    appo.haptics.notification('success');
  }, []);

  const warning = useCallback(() => {
    appo.haptics.notification('warning');
  }, []);

  const error = useCallback(() => {
    appo.haptics.notification('error');
  }, []);

  return {
    impact,
    notification,
    success,
    warning,
    error,
  };
}
`.trim(),

  storage: ({ hookName = "useStorage", includeLoading = true, includeError = true }) => `
import { useState, useCallback } from 'react';
import { getAppo } from '@appolabs/appo';

interface UseStorageReturn<T> {
  value: T | null;
  ${includeLoading ? "isLoading: boolean;" : ""}
  ${includeError ? "error: Error | null;" : ""}
  get: () => Promise<T | null>;
  set: (value: T) => Promise<void>;
  remove: () => Promise<void>;
}

export function ${hookName}<T = string>(key: string): UseStorageReturn<T> {
  const [value, setValue] = useState<T | null>(null);
  ${includeLoading ? "const [isLoading, setIsLoading] = useState(false);" : ""}
  ${includeError ? "const [error, setError] = useState<Error | null>(null);" : ""}

  const appo = getAppo();

  const get = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const stored = await appo.storage.get(key);
      const parsed = stored ? JSON.parse(stored) as T : null;
      setValue(parsed);
      return parsed;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to get storage value'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, [key]);

  const set = useCallback(async (newValue: T) => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      await appo.storage.set(key, JSON.stringify(newValue));
      setValue(newValue);
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to set storage value'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, [key]);

  const remove = useCallback(async () => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      await appo.storage.delete(key);
      setValue(null);
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to delete storage value'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, [key]);

  return {
    value,
    ${includeLoading ? "isLoading," : ""}
    ${includeError ? "error," : ""}
    get,
    set,
    remove,
  };
}
`.trim(),

  share: ({ hookName = "useShare", includeLoading = true, includeError = true }) => `
import { useState, useCallback } from 'react';
import { getAppo } from '@appolabs/appo';

interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
}

interface ShareResult {
  success: boolean;
  action?: string;
}

interface UseShareReturn {
  ${includeLoading ? "isLoading: boolean;" : ""}
  ${includeError ? "error: Error | null;" : ""}
  share: (options: ShareOptions) => Promise<ShareResult>;
}

export function ${hookName}(): UseShareReturn {
  ${includeLoading ? "const [isLoading, setIsLoading] = useState(false);" : ""}
  ${includeError ? "const [error, setError] = useState<Error | null>(null);" : ""}

  const appo = getAppo();

  const share = useCallback(async (options: ShareOptions) => {
    ${includeLoading ? "setIsLoading(true);" : ""}
    ${includeError ? "setError(null);" : ""}
    try {
      const result = await appo.share.open(options);
      return result;
    } catch (err) {
      ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to share'));" : ""}
      throw err;
    } finally {
      ${includeLoading ? "setIsLoading(false);" : ""}
    }
  }, []);

  return {
    ${includeLoading ? "isLoading," : ""}
    ${includeError ? "error," : ""}
    share,
  };
}
`.trim(),

  network: ({ hookName = "useNetwork" }) => `
import { useState, useEffect, useCallback } from 'react';
import { getAppo } from '@appolabs/appo';

interface NetworkStatus {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'unknown' | 'none';
}

interface UseNetworkReturn {
  status: NetworkStatus | null;
  isOnline: boolean;
  refresh: () => Promise<NetworkStatus | null>;
}

export function ${hookName}(): UseNetworkReturn {
  const [status, setStatus] = useState<NetworkStatus | null>(null);

  const appo = getAppo();

  const refresh = useCallback(async () => {
    const networkStatus = await appo.network.getStatus();
    setStatus(networkStatus);
    return networkStatus;
  }, []);

  useEffect(() => {
    refresh();
    return appo.network.onChange((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  return {
    status,
    isOnline: status?.isConnected ?? true,
    refresh,
  };
}
`.trim(),

  device: ({ hookName = "useDevice", includeLoading = true, includeError = true }) => `
import { useState, useEffect } from 'react';
import { getAppo } from '@appolabs/appo';

interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
  deviceId: string;
  deviceName: string;
  isTablet: boolean;
}

interface UseDeviceReturn {
  info: DeviceInfo | null;
  isNative: boolean;
  ${includeLoading ? "isLoading: boolean;" : ""}
  ${includeError ? "error: Error | null;" : ""}
}

export function ${hookName}(): UseDeviceReturn {
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  ${includeLoading ? "const [isLoading, setIsLoading] = useState(true);" : ""}
  ${includeError ? "const [error, setError] = useState<Error | null>(null);" : ""}

  const appo = getAppo();

  useEffect(() => {
    const fetchInfo = async () => {
      ${includeLoading ? "setIsLoading(true);" : ""}
      ${includeError ? "setError(null);" : ""}
      try {
        const deviceInfo = await appo.device.getInfo();
        setInfo(deviceInfo);
      } catch (err) {
        ${includeError ? "setError(err instanceof Error ? err : new Error('Failed to get device info'));" : ""}
      } finally {
        ${includeLoading ? "setIsLoading(false);" : ""}
      }
    };
    fetchInfo();
  }, []);

  return {
    info,
    isNative: appo.isNative,
    ${includeLoading ? "isLoading," : ""}
    ${includeError ? "error," : ""}
  };
}
`.trim(),
};

export async function generateHook(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const { feature, hookName, includeLoading = true, includeError = true } = args as unknown as GenerateHookArgs;

  if (!feature || !hookTemplates[feature]) {
    return {
      content: [
        {
          type: "text",
          text: `Invalid feature. Available features: ${Object.keys(hookTemplates).join(", ")}`,
        },
      ],
    };
  }

  const code = hookTemplates[feature]({
    feature,
    hookName,
    includeLoading,
    includeError,
  });

  return {
    content: [
      {
        type: "text",
        text: `\`\`\`typescript
${code}
\`\`\`

## Usage Example

\`\`\`tsx
import { ${hookName || `use${feature.charAt(0).toUpperCase() + feature.slice(1)}`} } from './hooks/${feature}';

function MyComponent() {
  const hook = ${hookName || `use${feature.charAt(0).toUpperCase() + feature.slice(1)}`}();

  // Use the hook methods and state
  return <div>...</div>;
}
\`\`\``,
      },
    ],
  };
}
