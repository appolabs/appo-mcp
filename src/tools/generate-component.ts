import type { SdkFeature } from "./index.js";

interface GenerateComponentArgs {
  feature: SdkFeature;
  componentName?: string;
  styling?: "tailwind" | "css" | "none";
  variant?: "button" | "card" | "form" | "status";
}

const componentTemplates: Record<
  SdkFeature,
  (args: GenerateComponentArgs) => string
> = {
  push: ({ componentName = "PushNotificationButton", styling = "tailwind" }) => {
    const buttonClass =
      styling === "tailwind"
        ? 'className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"'
        : styling === "css"
          ? 'className="push-button"'
          : "";

    return `
import { useState } from 'react';
import { getAppo, type PermissionStatus } from '@appolabs/appo';

interface ${componentName}Props {
  onTokenReceived?: (token: string) => void;
  onPermissionChange?: (status: PermissionStatus) => void;
}

export function ${componentName}({ onTokenReceived, onPermissionChange }: ${componentName}Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<PermissionStatus | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const appo = getAppo();

  const handleEnablePush = async () => {
    setIsLoading(true);
    try {
      const status = await appo.push.requestPermission();
      setPermission(status);
      onPermissionChange?.(status);

      if (status === 'granted') {
        const pushToken = await appo.push.getToken();
        if (pushToken) {
          setToken(pushToken);
          onTokenReceived?.(pushToken);
        }
      }
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (token) {
    return (
      <div ${styling === "tailwind" ? 'className="flex items-center gap-2 text-green-600"' : ""}>
        <svg ${styling === "tailwind" ? 'className="h-5 w-5"' : ""} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Push notifications enabled</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnablePush}
      disabled={isLoading || permission === 'denied'}
      ${buttonClass}
    >
      {isLoading ? (
        <>
          <svg ${styling === "tailwind" ? 'className="h-4 w-4 animate-spin"' : ""} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Enabling...
        </>
      ) : permission === 'denied' ? (
        'Notifications blocked'
      ) : (
        'Enable push notifications'
      )}
    </button>
  );
}
`.trim();
  },

  biometrics: ({ componentName = "BiometricAuthButton", styling = "tailwind" }) => {
    const buttonClass =
      styling === "tailwind"
        ? 'className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"'
        : "";

    return `
import { useState, useEffect } from 'react';
import { getAppo } from '@appolabs/appo';

interface ${componentName}Props {
  reason?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function ${componentName}({
  reason = 'Authenticate to continue',
  onSuccess,
  onError,
}: ${componentName}Props) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const appo = getAppo();

  useEffect(() => {
    appo.biometrics.isAvailable().then(setIsAvailable);
  }, []);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      const success = await appo.biometrics.authenticate(reason);
      if (success) {
        onSuccess?.();
      } else {
        onError?.(new Error('Authentication failed'));
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Authentication error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isAvailable === null) {
    return <div ${styling === "tailwind" ? 'className="text-gray-500"' : ""}>Checking biometrics...</div>;
  }

  if (!isAvailable) {
    return <div ${styling === "tailwind" ? 'className="text-gray-500"' : ""}>Biometric auth not available</div>;
  }

  return (
    <button
      onClick={handleAuthenticate}
      disabled={isLoading}
      ${buttonClass}
    >
      {isLoading ? (
        'Authenticating...'
      ) : (
        <>
          <svg ${styling === "tailwind" ? 'className="h-5 w-5"' : ""} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          Authenticate with biometrics
        </>
      )}
    </button>
  );
}
`.trim();
  },

  camera: ({ componentName = "CameraCapture", styling = "tailwind" }) => `
import { useState } from 'react';
import { getAppo, type PermissionStatus } from '@appolabs/appo';

interface Photo {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

interface ${componentName}Props {
  onCapture?: (photo: Photo) => void;
}

export function ${componentName}({ onCapture }: ${componentName}Props) {
  const [permission, setPermission] = useState<PermissionStatus | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const appo = getAppo();

  const handleRequestPermission = async () => {
    const status = await appo.camera.requestPermission();
    setPermission(status);
  };

  const handleTakePicture = async () => {
    setIsLoading(true);
    try {
      const result = await appo.camera.takePicture();
      if (result) {
        setPhoto(result);
        onCapture?.(result);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (permission === null) {
    return (
      <button
        onClick={handleRequestPermission}
        ${styling === "tailwind" ? 'className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"' : ""}
      >
        Allow camera access
      </button>
    );
  }

  if (permission === 'denied') {
    return <p ${styling === "tailwind" ? 'className="text-red-500"' : ""}>Camera access denied</p>;
  }

  return (
    <div ${styling === "tailwind" ? 'className="space-y-4"' : ""}>
      {photo ? (
        <div ${styling === "tailwind" ? 'className="space-y-2"' : ""}>
          <img
            src={photo.uri}
            alt="Captured"
            ${styling === "tailwind" ? 'className="max-w-full rounded-lg"' : ""}
          />
          <button
            onClick={() => setPhoto(null)}
            ${styling === "tailwind" ? 'className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"' : ""}
          >
            Clear
          </button>
        </div>
      ) : (
        <button
          onClick={handleTakePicture}
          disabled={isLoading}
          ${styling === "tailwind" ? 'className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"' : ""}
        >
          {isLoading ? 'Capturing...' : 'Take photo'}
        </button>
      )}
    </div>
  );
}
`.trim(),

  location: ({ componentName = "LocationButton", styling = "tailwind" }) => `
import { useState } from 'react';
import { getAppo, type PermissionStatus } from '@appolabs/appo';

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface ${componentName}Props {
  onLocation?: (position: Position) => void;
}

export function ${componentName}({ onLocation }: ${componentName}Props) {
  const [permission, setPermission] = useState<PermissionStatus | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const appo = getAppo();

  const handleGetLocation = async () => {
    setIsLoading(true);
    try {
      if (permission !== 'granted') {
        const status = await appo.location.requestPermission();
        setPermission(status);
        if (status !== 'granted') return;
      }

      const pos = await appo.location.getCurrentPosition();
      if (pos) {
        setPosition(pos);
        onLocation?.(pos);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ${styling === "tailwind" ? 'className="space-y-2"' : ""}>
      <button
        onClick={handleGetLocation}
        disabled={isLoading || permission === 'denied'}
        ${styling === "tailwind" ? 'className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:opacity-50"' : ""}
      >
        <svg ${styling === "tailwind" ? 'className="h-5 w-5"' : ""} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {isLoading ? 'Getting location...' : 'Get my location'}
      </button>
      {position && (
        <p ${styling === "tailwind" ? 'className="text-sm text-gray-600"' : ""}>
          {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
`.trim(),

  haptics: ({ componentName = "HapticButtons", styling = "tailwind" }) => `
import { getAppo } from '@appolabs/appo';

export function ${componentName}() {
  const appo = getAppo();

  return (
    <div ${styling === "tailwind" ? 'className="flex flex-wrap gap-2"' : ""}>
      <button
        onClick={() => appo.haptics.impact('light')}
        ${styling === "tailwind" ? 'className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"' : ""}
      >
        Light tap
      </button>
      <button
        onClick={() => appo.haptics.impact('medium')}
        ${styling === "tailwind" ? 'className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300"' : ""}
      >
        Medium tap
      </button>
      <button
        onClick={() => appo.haptics.impact('heavy')}
        ${styling === "tailwind" ? 'className="rounded bg-gray-300 px-3 py-2 text-sm hover:bg-gray-400"' : ""}
      >
        Heavy tap
      </button>
      <button
        onClick={() => appo.haptics.notification('success')}
        ${styling === "tailwind" ? 'className="rounded bg-green-100 px-3 py-2 text-sm text-green-700 hover:bg-green-200"' : ""}
      >
        Success
      </button>
      <button
        onClick={() => appo.haptics.notification('warning')}
        ${styling === "tailwind" ? 'className="rounded bg-yellow-100 px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-200"' : ""}
      >
        Warning
      </button>
      <button
        onClick={() => appo.haptics.notification('error')}
        ${styling === "tailwind" ? 'className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200"' : ""}
      >
        Error
      </button>
    </div>
  );
}
`.trim(),

  storage: ({ componentName = "StorageDemo", styling = "tailwind" }) => `
import { useState } from 'react';
import { getAppo } from '@appolabs/appo';

interface ${componentName}Props {
  storageKey?: string;
}

export function ${componentName}({ storageKey = 'demo-value' }: ${componentName}Props) {
  const [value, setValue] = useState('');
  const [stored, setStored] = useState<string | null>(null);

  const appo = getAppo();

  const handleSave = async () => {
    await appo.storage.set(storageKey, value);
    setStored(value);
  };

  const handleLoad = async () => {
    const loaded = await appo.storage.get(storageKey);
    setStored(loaded);
    if (loaded) setValue(loaded);
  };

  const handleDelete = async () => {
    await appo.storage.delete(storageKey);
    setStored(null);
    setValue('');
  };

  return (
    <div ${styling === "tailwind" ? 'className="space-y-4"' : ""}>
      <div ${styling === "tailwind" ? 'className="flex gap-2"' : ""}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a value"
          ${styling === "tailwind" ? 'className="flex-1 rounded border px-3 py-2"' : ""}
        />
        <button onClick={handleSave} ${styling === "tailwind" ? 'className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"' : ""}>
          Save
        </button>
      </div>
      <div ${styling === "tailwind" ? 'className="flex gap-2"' : ""}>
        <button onClick={handleLoad} ${styling === "tailwind" ? 'className="rounded bg-gray-200 px-3 py-2 hover:bg-gray-300"' : ""}>
          Load
        </button>
        <button onClick={handleDelete} ${styling === "tailwind" ? 'className="rounded bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"' : ""}>
          Delete
        </button>
      </div>
      {stored !== null && (
        <p ${styling === "tailwind" ? 'className="text-sm text-gray-600"' : ""}>Stored: {stored}</p>
      )}
    </div>
  );
}
`.trim(),

  share: ({ componentName = "ShareButton", styling = "tailwind" }) => `
import { useState } from 'react';
import { getAppo } from '@appolabs/appo';

interface ${componentName}Props {
  title?: string;
  message?: string;
  url?: string;
}

export function ${componentName}({
  title = 'Check this out!',
  message = '',
  url = window.location.href,
}: ${componentName}Props) {
  const [isLoading, setIsLoading] = useState(false);

  const appo = getAppo();

  const handleShare = async () => {
    setIsLoading(true);
    try {
      await appo.share.open({ title, message, url });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      ${styling === "tailwind" ? 'className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"' : ""}
    >
      <svg ${styling === "tailwind" ? 'className="h-5 w-5"' : ""} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      {isLoading ? 'Sharing...' : 'Share'}
    </button>
  );
}
`.trim(),

  network: ({ componentName = "NetworkStatus", styling = "tailwind" }) => `
import { useState, useEffect } from 'react';
import { getAppo } from '@appolabs/appo';

interface NetworkState {
  isConnected: boolean;
  type: string;
}

export function ${componentName}() {
  const [network, setNetwork] = useState<NetworkState | null>(null);

  const appo = getAppo();

  useEffect(() => {
    appo.network.getStatus().then(setNetwork);
    return appo.network.onChange(setNetwork);
  }, []);

  if (!network) return null;

  return (
    <div ${styling === "tailwind" ? `className={\`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm \${network.isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}` : ""}>
      <span ${styling === "tailwind" ? `className={\`h-2 w-2 rounded-full \${network.isConnected ? 'bg-green-500' : 'bg-red-500'}\`}` : ""} />
      {network.isConnected ? \`Online (\${network.type})\` : 'Offline'}
    </div>
  );
}
`.trim(),

  device: ({ componentName = "DeviceInfo", styling = "tailwind" }) => `
import { useState, useEffect } from 'react';
import { getAppo } from '@appolabs/appo';

interface DeviceData {
  platform: string;
  osVersion: string;
  appVersion: string;
  deviceName: string;
  isTablet: boolean;
}

export function ${componentName}() {
  const [device, setDevice] = useState<DeviceData | null>(null);

  const appo = getAppo();

  useEffect(() => {
    appo.device.getInfo().then(setDevice);
  }, []);

  if (!device) {
    return <div ${styling === "tailwind" ? 'className="animate-pulse text-gray-400"' : ""}>Loading device info...</div>;
  }

  return (
    <div ${styling === "tailwind" ? 'className="rounded-lg bg-gray-50 p-4"' : ""}>
      <h3 ${styling === "tailwind" ? 'className="mb-3 font-semibold"' : ""}>Device Information</h3>
      <dl ${styling === "tailwind" ? 'className="space-y-2 text-sm"' : ""}>
        <div ${styling === "tailwind" ? 'className="flex justify-between"' : ""}>
          <dt ${styling === "tailwind" ? 'className="text-gray-500"' : ""}>Platform</dt>
          <dd ${styling === "tailwind" ? 'className="font-medium"' : ""}>{device.platform}</dd>
        </div>
        <div ${styling === "tailwind" ? 'className="flex justify-between"' : ""}>
          <dt ${styling === "tailwind" ? 'className="text-gray-500"' : ""}>OS Version</dt>
          <dd ${styling === "tailwind" ? 'className="font-medium"' : ""}>{device.osVersion}</dd>
        </div>
        <div ${styling === "tailwind" ? 'className="flex justify-between"' : ""}>
          <dt ${styling === "tailwind" ? 'className="text-gray-500"' : ""}>App Version</dt>
          <dd ${styling === "tailwind" ? 'className="font-medium"' : ""}>{device.appVersion}</dd>
        </div>
        <div ${styling === "tailwind" ? 'className="flex justify-between"' : ""}>
          <dt ${styling === "tailwind" ? 'className="text-gray-500"' : ""}>Device</dt>
          <dd ${styling === "tailwind" ? 'className="font-medium"' : ""}>{device.deviceName}</dd>
        </div>
        <div ${styling === "tailwind" ? 'className="flex justify-between"' : ""}>
          <dt ${styling === "tailwind" ? 'className="text-gray-500"' : ""}>Type</dt>
          <dd ${styling === "tailwind" ? 'className="font-medium"' : ""}>{device.isTablet ? 'Tablet' : 'Phone'}</dd>
        </div>
      </dl>
      {appo.isNative && (
        <p ${styling === "tailwind" ? 'className="mt-3 text-xs text-green-600"' : ""}>Running in native app</p>
      )}
    </div>
  );
}
`.trim(),
};

export async function generateComponent(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const {
    feature,
    componentName,
    styling = "tailwind",
    variant,
  } = args as GenerateComponentArgs;

  if (!feature || !componentTemplates[feature]) {
    return {
      content: [
        {
          type: "text",
          text: `Invalid feature. Available features: ${Object.keys(componentTemplates).join(", ")}`,
        },
      ],
    };
  }

  const code = componentTemplates[feature]({
    feature,
    componentName,
    styling,
    variant,
  });

  const defaultName =
    componentName ||
    feature.charAt(0).toUpperCase() + feature.slice(1) + "Component";

  return {
    content: [
      {
        type: "text",
        text: `\`\`\`tsx
${code}
\`\`\`

## Usage

\`\`\`tsx
import { ${defaultName} } from './components/${feature}';

function App() {
  return <${defaultName} />;
}
\`\`\``,
      },
    ],
  };
}
