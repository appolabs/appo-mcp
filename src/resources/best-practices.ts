export function getBestPractices(): string {
  return `# @appolabs/appo Best Practices

## 1. Always Check Native Context

Before using native-only features, check if running in native app:

\`\`\`typescript
const appo = getAppo();

if (appo.isNative) {
  // Full native features available
  const token = await appo.push.getToken();
} else {
  // Running in browser - show alternative
  console.log('Native app required for push notifications');
}
\`\`\`

## 2. Request Permissions Properly

### Explain Before Requesting

Always explain WHY you need permission before requesting:

\`\`\`tsx
function LocationRequest() {
  const [showExplanation, setShowExplanation] = useState(true);

  if (showExplanation) {
    return (
      <div>
        <p>We need your location to find stores near you.</p>
        <button onClick={() => {
          setShowExplanation(false);
          requestPermission();
        }}>
          Continue
        </button>
      </div>
    );
  }

  return null;
}
\`\`\`

### Handle All Permission States

\`\`\`typescript
const status = await appo.push.requestPermission();

switch (status) {
  case 'granted':
    // Proceed with feature
    break;
  case 'denied':
    // Show instructions to enable in Settings
    break;
  case 'undetermined':
    // Initial state - will prompt user
    break;
}
\`\`\`

## 3. Implement Graceful Fallbacks

Design for both native and web contexts:

\`\`\`tsx
function ShareButton() {
  const appo = getAppo();

  const handleShare = async () => {
    if (appo.isNative) {
      await appo.share.open({ url: window.location.href });
    } else {
      // Web fallback - copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard');
    }
  };

  return <button onClick={handleShare}>Share</button>;
}
\`\`\`

## 4. Handle Errors Gracefully

Always wrap SDK calls in try/catch:

\`\`\`typescript
async function getLocation() {
  const appo = getAppo();

  try {
    const position = await appo.location.getCurrentPosition();
    return position;
  } catch (error) {
    console.error('Location error:', error);
    // Show user-friendly message
    return null;
  }
}
\`\`\`

## 5. Clean Up Event Listeners

Always unsubscribe from listeners in useEffect:

\`\`\`tsx
useEffect(() => {
  const unsubscribe = appo.push.onMessage((message) => {
    // Handle message
  });

  return () => {
    unsubscribe(); // Clean up on unmount
  };
}, []);
\`\`\`

## 6. Use Loading States

Show loading indicators for async operations:

\`\`\`tsx
function BiometricAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      await appo.biometrics.authenticate('Verify identity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleAuth} disabled={isLoading}>
      {isLoading ? 'Authenticating...' : 'Login with Face ID'}
    </button>
  );
}
\`\`\`

## 7. Store Sensitive Data Securely

Use storage for session data, not credentials:

\`\`\`typescript
// Good: Store session token
await appo.storage.set('session-token', token);

// Bad: Don't store passwords
// await appo.storage.set('password', password); // Don't do this!
\`\`\`

## 8. Test on Real Devices

- Simulator/Emulator: Good for development
- Real Device: Required for testing:
  - Biometrics (Face ID, Touch ID)
  - Push notifications
  - Haptics
  - Actual camera behavior

## 9. Handle Network Changes

Implement offline-first patterns:

\`\`\`tsx
function App() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const appo = getAppo();

    return appo.network.onChange((status) => {
      setIsOnline(status?.isConnected ?? true);

      if (status?.isConnected) {
        // Sync pending changes
        syncQueue.process();
      }
    });
  }, []);

  return (
    <NetworkContext.Provider value={isOnline}>
      {/* App content */}
    </NetworkContext.Provider>
  );
}
\`\`\`

## 10. Type Your SDK Usage

Leverage TypeScript for safety:

\`\`\`typescript
import { getAppo, type PermissionStatus, type PushMessage } from '@appolabs/appo';

function handlePermission(status: PermissionStatus) {
  // TypeScript ensures status is valid
}

function handleMessage(message: PushMessage) {
  // Full type inference on message properties
}
\`\`\`

## 11. Centralize SDK Initialization

Create a hook or context for SDK access:

\`\`\`tsx
// hooks/useAppo.ts
import { useMemo } from 'react';
import { getAppo } from '@appolabs/appo';

export function useAppo() {
  return useMemo(() => getAppo(), []);
}

// Usage
function MyComponent() {
  const appo = useAppo();
  // ...
}
\`\`\`

## 12. Log Important Events

Track SDK usage for debugging:

\`\`\`typescript
async function requestPushPermission() {
  const appo = getAppo();

  console.log('Requesting push permission...');
  const status = await appo.push.requestPermission();
  console.log('Push permission result:', status);

  if (status === 'granted') {
    const token = await appo.push.getToken();
    console.log('Push token received:', token?.slice(0, 20) + '...');
  }

  return status;
}
\`\`\`

## Summary Checklist

- [ ] Check \`appo.isNative\` before native-only features
- [ ] Explain why permissions are needed
- [ ] Handle all permission states
- [ ] Implement web fallbacks
- [ ] Wrap calls in try/catch
- [ ] Clean up event listeners
- [ ] Show loading states
- [ ] Test on real devices
- [ ] Handle offline scenarios
- [ ] Use TypeScript types
`;
}
