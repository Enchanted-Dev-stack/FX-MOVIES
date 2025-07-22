# AdBlocker Native Module

This directory contains the AdBlocker native module integration for React Native, providing comprehensive ad blocking capabilities within WebViews.

## Project Structure

### JavaScript/TypeScript Layer
- `AdBlocker.ts` - Main TypeScript interface and API wrapper
- `index.ts` - Module exports

### Android Implementation
- `android/app/src/main/java/com/moview/adblocker/`
  - `AdBlockerModule.java` - React Native module entry point
  - `AdBlockerManager.java` - Core filtering logic manager
  - `AdBlockerPackage.java` - React Native package registration
- `android/app/src/main/cpp/`
  - `AdGuardJNIBridge.cpp` - JNI interface to AdGuard Core
  - `CMakeLists.txt` - CMake build configuration

### iOS Implementation
- `ios/`
  - `AdBlockerModule.h/.m` - React Native module entry point
  - `AdBlockerManager.h/.mm` - Objective-C++ manager class
  - `AdGuardWrapper.h/.mm` - C++ wrapper for AdGuard Core

## Build Configuration

### Android
- Minimum SDK: API 24+ (Android 7.0)
- NDK support for arm64-v8a, armeabi-v7a, x86, x86_64
- CMake integration for native library compilation

### iOS
- Minimum deployment target: iOS 13.0
- CocoaPods integration ready for AdGuard Core dependency

## Usage

```typescript
import AdBlocker from './src/modules/AdBlocker';

// Initialize the ad blocker
const success = await AdBlocker.init();

// Enable ad blocking
await AdBlocker.enable();

// Check if a URL should be blocked
const shouldBlock = await AdBlocker.filterRequest('https://example.com/ad');

// Disable ad blocking
await AdBlocker.disable();
```

## Development Status

This is the initial scaffolding implementation. The following components are placeholders and need to be implemented with actual AdGuard Core integration:

- [ ] AdGuard Core library integration
- [ ] Actual filtering logic implementation
- [ ] Filter list management
- [ ] WebView request interception
- [ ] Performance optimizations

## Next Steps

1. Integrate actual AdGuard Core libraries for Android and iOS
2. Implement real filtering logic in native bridges
3. Add WebView request interception
4. Implement filter list management
5. Add comprehensive error handling and logging