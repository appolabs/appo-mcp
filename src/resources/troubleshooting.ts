export function getTroubleshooting(): string {
  return `# Troubleshooting @appolabs/appo

## Common Issues

### SDK Not Working in Browser

**Symptom:** Features return null or don't work in browser.

**Cause:** The SDK is designed for React Native WebViews. Browser fallbacks are intentionally limited.

**Solution:**
\`\`\`typescript
const appo = getAppo();

if (!appo.isNative) {
  console.log('Running in browser - limited features');
  // Implement web fallback
}
\`\`\`

---

### Permission Always Returns 'denied'

**Symptom:** \`requestPermission()\` always returns 'denied'.

**Causes:**
1. Running in browser (fallback behavior)
2. User previously denied permission
3. Missing Info.plist/AndroidManifest configuration

**Solutions:**
- Check \`appo.isNative\` first
- For iOS: Add usage description to Info.plist
- For Android: Add permission to AndroidManifest.xml
- Guide users to enable in device Settings

---

### Push Token is Null

**Symptom:** \`getToken()\` returns null.

**Causes:**
1. Permission not granted
2. Running in browser
3. Expo push not configured

**Solution:**
\`\`\`typescript
async function getPushToken() {
  const appo = getAppo();

  // Check native context
  if (!appo.isNative) {
    console.log('Push requires native app');
    return null;
  }

  // Request permission first
  const status = await appo.push.requestPermission();
  if (status !== 'granted') {
    console.log('Permission denied');
    return null;
  }

  // Now get token
  const token = await appo.push.getToken();
  return token;
}
\`\`\`

---

### Biometrics Not Available

**Symptom:** \`isAvailable()\` returns false.

**Causes:**
1. Device lacks biometric hardware
2. No biometrics enrolled
3. Running in simulator/browser

**Solution:**
\`\`\`typescript
const available = await appo.biometrics.isAvailable();

if (!available) {
  // Offer PIN/password fallback
  return { authMethod: 'password' };
}
\`\`\`

---

### Camera Returns Null

**Symptom:** \`takePicture()\` returns null.

**Causes:**
1. Permission not granted
2. User cancelled capture
3. Running in browser

**Solution:**
\`\`\`typescript
const photo = await appo.camera.takePicture();

if (!photo) {
  // User cancelled or error occurred
  console.log('No photo captured');
  return;
}
\`\`\`

---

### Storage Not Persisting

**Symptom:** Stored values disappear.

**Causes:**
1. App reinstalled (clears storage)
2. Async timing issue
3. Storage quota exceeded

**Solution:**
\`\`\`typescript
// Always await storage operations
await appo.storage.set('key', 'value');

// Verify write
const saved = await appo.storage.get('key');
console.log('Saved:', saved);
\`\`\`

---

### TypeScript Errors

**Symptom:** Types not found or import errors.

**Causes:**
1. Package not installed
2. TypeScript config issue

**Solutions:**
1. Reinstall: \`pnpm add @appolabs/appo\`
2. Check tsconfig.json:
   \`\`\`json
   {
     "compilerOptions": {
       "moduleResolution": "bundler",
       "esModuleInterop": true
     }
   }
   \`\`\`
3. Restart TypeScript server

---

### Network Status Incorrect

**Symptom:** Shows offline when online or vice versa.

**Cause:** Browser fallback uses \`navigator.onLine\` which has limited accuracy.

**Solution:** Use onChange listener and verify with actual requests:
\`\`\`typescript
useEffect(() => {
  return appo.network.onChange((status) => {
    setIsOnline(status?.isConnected ?? true);
  });
}, []);
\`\`\`

---

## Debugging Tips

### 1. Check SDK Version

\`\`\`typescript
const appo = getAppo();
console.log('SDK Version:', appo.version);
console.log('Is Native:', appo.isNative);
\`\`\`

### 2. Get Device Info

\`\`\`typescript
const info = await appo.device.getInfo();
console.log('Platform:', info.platform);
console.log('OS:', info.osVersion);
\`\`\`

### 3. Enable Verbose Logging

Add try/catch with detailed logging:

\`\`\`typescript
try {
  console.log('Requesting permission...');
  const status = await appo.push.requestPermission();
  console.log('Permission result:', status);
} catch (error) {
  console.error('Permission error:', error);
}
\`\`\`

### 4. Test Native Bridge

Verify the bridge is working:

\`\`\`typescript
const appo = getAppo();

if (appo.isNative) {
  console.log('Native bridge active');

  // Test a simple call
  const info = await appo.device.getInfo();
  console.log('Bridge working:', !!info);
} else {
  console.log('Not in native context');
}
\`\`\`

## Getting Help

If you're still stuck:

1. **Check the docs:** Use \`appo://api/{feature}\` resources
2. **Review examples:** Use \`appo://examples/{feature}\` resources
3. **Use diagnose_issue tool:** Describe your symptom
4. **Check GitHub issues:** Look for similar problems
5. **Open an issue:** Include SDK version, platform, and steps to reproduce

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Not working in browser | Check \`appo.isNative\` |
| Permission denied | Request before using |
| Token is null | Request permission first |
| Biometrics unavailable | Provide fallback auth |
| Camera returns null | Handle cancellation |
| Storage lost | Await operations |
| Types not working | Reinstall package |
| Network incorrect | Use onChange listener |
`;
}
