import type { SdkFeature } from "../tools/index.js";

const examples: Record<SdkFeature, string> = {
  push: `# Push Notifications Examples

## Basic Push Setup

\`\`\`tsx
import { useState, useEffect } from 'react';
import { getAppo } from '@appolabs/appo';

function PushSetup() {
  const [token, setToken] = useState<string | null>(null);
  const appo = getAppo();

  useEffect(() => {
    async function setup() {
      const status = await appo.push.requestPermission();
      if (status === 'granted') {
        const pushToken = await appo.push.getToken();
        setToken(pushToken);
        // Send to your backend
      }
    }
    setup();
  }, []);

  return <p>{token ? 'Push enabled' : 'Setting up...'}</p>;
}
\`\`\`

## Handling Incoming Notifications

\`\`\`tsx
import { useEffect } from 'react';
import { getAppo, type PushMessage } from '@appolabs/appo';
import { useNavigate } from 'react-router-dom';

function NotificationHandler() {
  const navigate = useNavigate();
  const appo = getAppo();

  useEffect(() => {
    return appo.push.onMessage((message: PushMessage) => {
      // Handle different notification types
      if (message.data?.type === 'order_update') {
        navigate(\`/orders/\${message.data.orderId}\`);
      } else if (message.data?.type === 'chat') {
        navigate(\`/chat/\${message.data.conversationId}\`);
      }
    });
  }, [navigate]);

  return null;
}
\`\`\`

## Push with React Query

\`\`\`tsx
import { useMutation } from '@tanstack/react-query';
import { getAppo } from '@appolabs/appo';

function usePushRegistration() {
  const appo = getAppo();

  return useMutation({
    mutationFn: async () => {
      const status = await appo.push.requestPermission();
      if (status !== 'granted') {
        throw new Error('Permission denied');
      }

      const token = await appo.push.getToken();
      if (!token) {
        throw new Error('Could not get token');
      }

      // Register with backend
      await fetch('/api/devices', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      return token;
    },
  });
}
\`\`\`
`,

  biometrics: `# Biometrics Examples

## Biometric Login

\`\`\`tsx
import { useState, useEffect } from 'react';
import { getAppo } from '@appolabs/appo';

function BiometricLogin({ onSuccess }: { onSuccess: () => void }) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const appo = getAppo();

  useEffect(() => {
    appo.biometrics.isAvailable().then((result) => {
      setAvailable(result);
      setLoading(false);
    });
  }, []);

  const handleBiometricLogin = async () => {
    const success = await appo.biometrics.authenticate(
      'Login with Face ID / Touch ID'
    );
    if (success) {
      onSuccess();
    }
  };

  if (loading) return null;
  if (!available) return null;

  return (
    <button onClick={handleBiometricLogin}>
      Login with Face ID / Touch ID
    </button>
  );
}
\`\`\`

## Protect Sensitive Actions

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function confirmTransaction(amount: number) {
  const appo = getAppo();

  // Require biometric auth for large transactions
  if (amount > 1000) {
    const authenticated = await appo.biometrics.authenticate(
      \`Confirm transaction of $\${amount}\`
    );

    if (!authenticated) {
      throw new Error('Authentication required');
    }
  }

  // Proceed with transaction
  return processTransaction(amount);
}
\`\`\`
`,

  camera: `# Camera Examples

## Photo Capture Component

\`\`\`tsx
import { useState } from 'react';
import { getAppo } from '@appolabs/appo';

function PhotoCapture({ onPhoto }: { onPhoto: (uri: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const appo = getAppo();

  const handleCapture = async () => {
    setLoading(true);
    try {
      const permission = await appo.camera.requestPermission();
      if (permission !== 'granted') return;

      const photo = await appo.camera.takePicture();
      if (photo) {
        setPreview(photo.uri);
        onPhoto(photo.uri);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {preview && <img src={preview} alt="Preview" />}
      <button onClick={handleCapture} disabled={loading}>
        {loading ? 'Capturing...' : 'Take Photo'}
      </button>
    </div>
  );
}
\`\`\`

## Profile Photo Upload

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function updateProfilePhoto() {
  const appo = getAppo();

  const photo = await appo.camera.takePicture();
  if (!photo || !photo.base64) return;

  // Upload to server
  const response = await fetch('/api/profile/photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: photo.base64 }),
  });

  return response.json();
}
\`\`\`
`,

  location: `# Location Examples

## Get Current Location

\`\`\`tsx
import { useState } from 'react';
import { getAppo } from '@appolabs/appo';

function LocationDisplay() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const appo = getAppo();

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      const permission = await appo.location.requestPermission();
      if (permission !== 'granted') return;

      const position = await appo.location.getCurrentPosition();
      if (position) {
        setCoords({
          lat: position.latitude,
          lng: position.longitude,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGetLocation} disabled={loading}>
        {loading ? 'Getting location...' : 'Get Location'}
      </button>
      {coords && (
        <p>
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
\`\`\`

## Find Nearby Stores

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function findNearbyStores() {
  const appo = getAppo();

  const position = await appo.location.getCurrentPosition();
  if (!position) {
    throw new Error('Could not get location');
  }

  // Search for nearby stores
  const response = await fetch(
    \`/api/stores/nearby?lat=\${position.latitude}&lng=\${position.longitude}&radius=10\`
  );

  return response.json();
}
\`\`\`
`,

  haptics: `# Haptics Examples

## Button Feedback

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

function HapticButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const appo = getAppo();

  const handleClick = () => {
    appo.haptics.impact('light');
    onClick();
  };

  return <button onClick={handleClick}>{children}</button>;
}
\`\`\`

## Form Validation Feedback

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

function Form() {
  const appo = getAppo();

  const handleSubmit = async (data: FormData) => {
    try {
      await submitForm(data);
      appo.haptics.notification('success');
    } catch (error) {
      appo.haptics.notification('error');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
\`\`\`

## Pull-to-Refresh Feedback

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

function RefreshableList() {
  const appo = getAppo();

  const handleRefresh = async () => {
    appo.haptics.impact('medium');
    await fetchData();
  };

  return <PullToRefresh onRefresh={handleRefresh}>...</PullToRefresh>;
}
\`\`\`
`,

  storage: `# Storage Examples

## User Preferences

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

interface UserPrefs {
  theme: 'light' | 'dark';
  notifications: boolean;
}

async function savePreferences(prefs: UserPrefs) {
  const appo = getAppo();
  await appo.storage.set('user-prefs', JSON.stringify(prefs));
}

async function loadPreferences(): Promise<UserPrefs | null> {
  const appo = getAppo();
  const stored = await appo.storage.get('user-prefs');
  return stored ? JSON.parse(stored) : null;
}
\`\`\`

## Offline Data Cache

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const appo = getAppo();

  // Try cache first
  const cached = await appo.storage.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch fresh data
  const data = await fetcher();
  await appo.storage.set(key, JSON.stringify(data));
  return data;
}
\`\`\`

## Session Token Storage

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

const TOKEN_KEY = 'auth-token';

export async function setAuthToken(token: string) {
  const appo = getAppo();
  await appo.storage.set(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  const appo = getAppo();
  return appo.storage.get(TOKEN_KEY);
}

export async function clearAuthToken() {
  const appo = getAppo();
  await appo.storage.delete(TOKEN_KEY);
}
\`\`\`
`,

  share: `# Share Examples

## Share Page

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

function ShareButton({ title, url }: { title: string; url: string }) {
  const appo = getAppo();

  const handleShare = async () => {
    await appo.share.open({
      title,
      url,
    });
  };

  return <button onClick={handleShare}>Share</button>;
}
\`\`\`

## Share Product

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function shareProduct(product: { name: string; price: number; url: string }) {
  const appo = getAppo();

  return appo.share.open({
    title: product.name,
    message: \`Check out \${product.name} for $\${product.price}!\`,
    url: product.url,
  });
}
\`\`\`

## Share with Result Tracking

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function shareWithTracking(content: ShareContent) {
  const appo = getAppo();

  const result = await appo.share.open(content);

  if (result.success) {
    // Track share event
    analytics.track('content_shared', {
      action: result.action,
      url: content.url,
    });
  }

  return result;
}
\`\`\`
`,

  network: `# Network Examples

## Offline Banner

\`\`\`tsx
import { useState, useEffect } from 'react';
import { getAppo } from '@appolabs/appo';

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const appo = getAppo();

  useEffect(() => {
    appo.network.getStatus().then((s) => setIsOnline(s?.isConnected ?? true));

    return appo.network.onChange((status) => {
      setIsOnline(status?.isConnected ?? true);
    });
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500 text-center py-2">
      You are offline. Some features may be unavailable.
    </div>
  );
}
\`\`\`

## Conditional Data Fetching

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function fetchWithNetworkCheck<T>(url: string): Promise<T> {
  const appo = getAppo();
  const status = await appo.network.getStatus();

  if (!status?.isConnected) {
    throw new Error('No network connection');
  }

  const response = await fetch(url);
  return response.json();
}
\`\`\`

## Network-Aware Sync

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

function useAutoSync() {
  const appo = getAppo();

  useEffect(() => {
    return appo.network.onChange(async (status) => {
      // Sync when coming back online
      if (status?.isConnected) {
        await syncPendingChanges();
      }
    });
  }, []);
}
\`\`\`
`,

  device: `# Device Examples

## Platform-Specific UI

\`\`\`tsx
import { useState, useEffect } from 'react';
import { getAppo } from '@appolabs/appo';

function PlatformAwareComponent() {
  const [platform, setPlatform] = useState<string>('web');
  const appo = getAppo();

  useEffect(() => {
    appo.device.getInfo().then((info) => {
      setPlatform(info.platform);
    });
  }, []);

  if (platform === 'ios') {
    return <IOSLayout />;
  } else if (platform === 'android') {
    return <AndroidLayout />;
  }

  return <WebLayout />;
}
\`\`\`

## Analytics Context

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function trackEvent(name: string, properties: Record<string, unknown>) {
  const appo = getAppo();
  const deviceInfo = await appo.device.getInfo();

  analytics.track(name, {
    ...properties,
    platform: deviceInfo.platform,
    appVersion: deviceInfo.appVersion,
    osVersion: deviceInfo.osVersion,
    isTablet: deviceInfo.isTablet,
    isNative: appo.isNative,
  });
}
\`\`\`

## Feature Flags by Platform

\`\`\`tsx
import { getAppo } from '@appolabs/appo';

async function getFeatureFlags() {
  const appo = getAppo();
  const info = await appo.device.getInfo();

  const response = await fetch('/api/feature-flags', {
    method: 'POST',
    body: JSON.stringify({
      platform: info.platform,
      appVersion: info.appVersion,
    }),
  });

  return response.json();
}
\`\`\`
`,
};

export function getExamples(feature: SdkFeature): string {
  return examples[feature] || `No examples found for feature: ${feature}`;
}
