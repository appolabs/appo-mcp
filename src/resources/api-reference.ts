import type { SdkFeature } from "../tools/index.js";

const apiDocs: Record<SdkFeature, string> = {
  push: `# Push Notifications API

## appo.push

Access push notification functionality.

### Methods

#### \`requestPermission(): Promise<PermissionStatus>\`

Request permission to send push notifications.

**Returns:** \`'granted' | 'denied' | 'undetermined'\`

**Example:**
\`\`\`typescript
const status = await appo.push.requestPermission();
if (status === 'granted') {
  // User accepted
}
\`\`\`

**Web fallback:** Returns \`'denied'\`

---

#### \`getToken(): Promise<string | null>\`

Get the Expo push notification token for this device.

**Returns:** Expo push token string or \`null\`

**Example:**
\`\`\`typescript
const token = await appo.push.getToken();
if (token) {
  // Send token to your backend
  await api.registerDevice(token);
}
\`\`\`

**Web fallback:** Returns \`null\`

---

#### \`onMessage(callback: (message: PushMessage) => void): () => void\`

Subscribe to incoming push notifications.

**Parameters:**
- \`callback\`: Function called when a notification is received

**Returns:** Unsubscribe function

**Example:**
\`\`\`typescript
const unsubscribe = appo.push.onMessage((message) => {
  console.log('Notification:', message.title, message.body);
  console.log('Data:', message.data);
});

// Later: cleanup
unsubscribe();
\`\`\`

### Types

\`\`\`typescript
type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}
\`\`\`
`,

  biometrics: `# Biometrics API

## appo.biometrics

Access Face ID / Touch ID authentication.

### Methods

#### \`isAvailable(): Promise<boolean>\`

Check if biometric authentication is available on the device.

**Returns:** \`true\` if biometrics available, \`false\` otherwise

**Example:**
\`\`\`typescript
const available = await appo.biometrics.isAvailable();
if (available) {
  // Show biometric login option
}
\`\`\`

**Web fallback:** Returns \`false\`

---

#### \`authenticate(reason: string): Promise<boolean>\`

Prompt user for biometric authentication.

**Parameters:**
- \`reason\`: Message shown to user explaining why authentication is needed

**Returns:** \`true\` if authenticated successfully, \`false\` otherwise

**Example:**
\`\`\`typescript
const success = await appo.biometrics.authenticate(
  'Authenticate to access your account'
);

if (success) {
  // User authenticated
  unlockApp();
}
\`\`\`

**Web fallback:** Returns \`false\`
`,

  camera: `# Camera API

## appo.camera

Access device camera for photo capture.

### Methods

#### \`requestPermission(): Promise<PermissionStatus>\`

Request permission to access the camera.

**Returns:** \`'granted' | 'denied' | 'undetermined'\`

**Example:**
\`\`\`typescript
const status = await appo.camera.requestPermission();
\`\`\`

**Web fallback:** Returns \`'denied'\`

---

#### \`takePicture(): Promise<Photo | null>\`

Open camera and capture a photo.

**Returns:** Photo object with URI, dimensions, and optional base64 data

**Example:**
\`\`\`typescript
const photo = await appo.camera.takePicture();
if (photo) {
  console.log('Photo URI:', photo.uri);
  console.log('Dimensions:', photo.width, 'x', photo.height);
}
\`\`\`

**Web fallback:** Returns \`null\`

### Types

\`\`\`typescript
interface Photo {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}
\`\`\`
`,

  location: `# Location API

## appo.location

Access device GPS location.

### Methods

#### \`requestPermission(): Promise<PermissionStatus>\`

Request permission to access device location.

**Returns:** \`'granted' | 'denied' | 'undetermined'\`

**Example:**
\`\`\`typescript
const status = await appo.location.requestPermission();
\`\`\`

**Web fallback:** Returns \`'denied'\`

---

#### \`getCurrentPosition(): Promise<Position | null>\`

Get the current GPS position.

**Returns:** Position object with coordinates and accuracy

**Example:**
\`\`\`typescript
const pos = await appo.location.getCurrentPosition();
if (pos) {
  console.log('Lat:', pos.latitude);
  console.log('Lng:', pos.longitude);
  console.log('Accuracy:', pos.accuracy, 'meters');
}
\`\`\`

**Web fallback:** Returns \`null\`

### Types

\`\`\`typescript
interface Position {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  timestamp: number;
}
\`\`\`
`,

  haptics: `# Haptics API

## appo.haptics

Trigger tactile/haptic feedback.

### Methods

#### \`impact(style: ImpactStyle): void\`

Trigger an impact haptic feedback.

**Parameters:**
- \`style\`: \`'light' | 'medium' | 'heavy'\`

**Example:**
\`\`\`typescript
// Light tap for selections
appo.haptics.impact('light');

// Medium tap for confirmations
appo.haptics.impact('medium');

// Heavy tap for emphasis
appo.haptics.impact('heavy');
\`\`\`

**Web fallback:** No-op (silent)

---

#### \`notification(type: NotificationType): void\`

Trigger a notification haptic feedback.

**Parameters:**
- \`type\`: \`'success' | 'warning' | 'error'\`

**Example:**
\`\`\`typescript
// Success feedback
appo.haptics.notification('success');

// Warning feedback
appo.haptics.notification('warning');

// Error feedback
appo.haptics.notification('error');
\`\`\`

**Web fallback:** No-op (silent)

### Types

\`\`\`typescript
type ImpactStyle = 'light' | 'medium' | 'heavy';
type NotificationType = 'success' | 'warning' | 'error';
\`\`\`
`,

  storage: `# Storage API

## appo.storage

Persistent key-value storage with native backing.

### Methods

#### \`get(key: string): Promise<string | null>\`

Retrieve a value from storage.

**Parameters:**
- \`key\`: Storage key

**Returns:** Stored value or \`null\` if not found

**Example:**
\`\`\`typescript
const value = await appo.storage.get('user-preferences');
if (value) {
  const prefs = JSON.parse(value);
}
\`\`\`

**Web fallback:** Uses \`localStorage\`

---

#### \`set(key: string, value: string): Promise<void>\`

Store a value.

**Parameters:**
- \`key\`: Storage key
- \`value\`: Value to store (must be string)

**Example:**
\`\`\`typescript
await appo.storage.set('user-preferences', JSON.stringify(prefs));
\`\`\`

**Web fallback:** Uses \`localStorage\`

---

#### \`delete(key: string): Promise<void>\`

Remove a value from storage.

**Parameters:**
- \`key\`: Storage key to remove

**Example:**
\`\`\`typescript
await appo.storage.delete('user-preferences');
\`\`\`

**Web fallback:** Uses \`localStorage\`
`,

  share: `# Share API

## appo.share

Open native share sheet.

### Methods

#### \`open(options: ShareOptions): Promise<ShareResult>\`

Open the native share dialog.

**Parameters:**
- \`options.title\`: Share title (optional)
- \`options.message\`: Share message (optional)
- \`options.url\`: URL to share (optional)

**Returns:** Result indicating if share was successful

**Example:**
\`\`\`typescript
const result = await appo.share.open({
  title: 'Check this out!',
  message: 'I found this great app',
  url: 'https://example.com/app'
});

if (result.success) {
  console.log('Shared via:', result.action);
}
\`\`\`

**Web fallback:** Uses \`navigator.share()\` if available

### Types

\`\`\`typescript
interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
}

interface ShareResult {
  success: boolean;
  action?: string;
}
\`\`\`
`,

  network: `# Network API

## appo.network

Monitor network connectivity status.

### Methods

#### \`getStatus(): Promise<NetworkStatus | null>\`

Get current network status.

**Returns:** Network status object

**Example:**
\`\`\`typescript
const status = await appo.network.getStatus();
if (status) {
  console.log('Connected:', status.isConnected);
  console.log('Type:', status.type);
}
\`\`\`

**Web fallback:** Uses \`navigator.onLine\`

---

#### \`onChange(callback: (status: NetworkStatus) => void): () => void\`

Subscribe to network status changes.

**Parameters:**
- \`callback\`: Function called when network status changes

**Returns:** Unsubscribe function

**Example:**
\`\`\`typescript
const unsubscribe = appo.network.onChange((status) => {
  if (!status.isConnected) {
    showOfflineBanner();
  }
});
\`\`\`

**Web fallback:** Uses online/offline events

### Types

\`\`\`typescript
interface NetworkStatus {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'unknown' | 'none';
}
\`\`\`
`,

  device: `# Device API

## appo.device

Get device information.

### Methods

#### \`getInfo(): Promise<DeviceInfo>\`

Get detailed device information.

**Returns:** Device info object

**Example:**
\`\`\`typescript
const info = await appo.device.getInfo();
console.log('Platform:', info.platform);
console.log('OS:', info.osVersion);
console.log('App Version:', info.appVersion);
console.log('Device:', info.deviceName);
console.log('Is Tablet:', info.isTablet);
\`\`\`

**Web fallback:** Parses user agent for basic info

### Types

\`\`\`typescript
interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
  deviceId: string;
  deviceName: string;
  isTablet: boolean;
}
\`\`\`

## appo.isNative

Boolean property indicating if running in native app context.

**Example:**
\`\`\`typescript
if (appo.isNative) {
  // Full native features available
} else {
  // Running in browser
}
\`\`\`

## appo.version

SDK version string.

\`\`\`typescript
console.log('SDK:', appo.version);
\`\`\`
`,
};

export function getApiReference(feature: SdkFeature): string {
  return apiDocs[feature] || `No API documentation found for feature: ${feature}`;
}
