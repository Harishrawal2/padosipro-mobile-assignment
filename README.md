# PadosiPro Mobile App

React Native mobile client built with **Expo (SDK 57)**, **Expo Router**, **TypeScript**, **React Hook Form**, and **Axios** for the PadosiPro full-stack platform.

---

## 🚀 Features

* **Authentication & OTP Verification**:
  * User Registration & Login screens.
  * 6-digit OTP verification screen with resend timer.
  * Token storage using `expo-secure-store`.
* **Profile Onboarding**:
  * Mandatory profile completion step before app access (`name`, `mobileNumber`, `address`).
* **Task Management & Service Selection**:
  * Interactive task catalogue grouped into 4 categories.
  * Search bar filtering for catalogue services.
  * Custom task creation screen with initial status selection.
  * My Tasks list with status badge tags and task details view.
* **Dynamic Host IP Detection**:
  * Uses `expo-constants` (`hostUri`) to extract host machine IP over Wi-Fi automatically.

---

## 🛠️ Tech Stack

* **Framework**: React Native + Expo (SDK 57)
* **Routing**: Expo Router (v4 / ~57)
* **Language**: TypeScript
* **Form & Validation**: React Hook Form + Zod
* **HTTP Client**: Axios with Bearer token interceptor
* **Secure Storage**: `expo-secure-store`
* **Animations**: Animated API & LayoutAnimations

---

## 📋 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Set `EXPO_PUBLIC_API_URL` to your local backend API endpoint (e.g. `http://192.168.1.7:5000/api/v1`).

3. **Start Development Server**:
   ```bash
   npx expo start
   ```

---

## 📦 Building the Android APK

### Option A: Local Gradle Build
```bash
# 1. Generate native android directory
npx expo prebuild --platform android

# 2. Build release APK
cd android
./gradlew assembleRelease
```
Output APK location: `android/app/build/outputs/apk/release/app-release.apk`.

### Option B: Cloud EAS Build
```bash
npx eas-cli build -p android --profile preview
```

---

## 🐙 Git Workflow

```bash
git add .
git commit -m "feat: updated android prebuild configs and documentation"
git push origin main
```
