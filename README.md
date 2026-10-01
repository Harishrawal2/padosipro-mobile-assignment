# PadosiPro Mobile

A React Native + Expo mobile application for the PadosiPro platform.

## Tech Stack

- **React Native** + **Expo SDK 52**
- **TypeScript** (strict mode)
- **Expo Router** v4 (file-based routing)
- **Axios** (API client)
- **React Hook Form** + **Zod** (form validation)
- **Expo SecureStore** (secure token storage)

## Architecture

```
src/
├── api/          # API layer (client + per-resource functions)
├── components/   # Reusable UI components
├── constants/    # Route names + app config
├── hooks/        # useAuth, useTasks
├── screens/      # Feature screens (auth, onboarding, tasks)
├── store/        # Auth context
├── theme/        # Colors, spacing, typography
├── types/        # TypeScript interfaces
└── utils/        # Validation schemas, secure storage
```

## User Flow

```
Register → Verify OTP → Login
  └── Profile Incomplete → Profile Screen → Task Selection → Home
  └── Profile Complete   → Home
App Restart → Restore Auth → Home (if authenticated)
```

## Setup

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api/v1
```

> Use your machine's LAN IP (not `localhost`) when testing on a physical Android device.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the backend

```bash
cd ../padosipro-backend
npm run dev
```

### 4. Start the mobile app

```bash
npm start
```

Scan the QR code with **Expo Go** on Android.

## Key Features

- ✅ Register with email + OTP verification
- ✅ Login with unverified account redirect to OTP
- ✅ Secure JWT storage (Expo SecureStore)
- ✅ Auth persistence across app restarts
- ✅ Profile onboarding (first login only)
- ✅ Task catalogue from API (grouped by category)
- ✅ Task search + multi-select
- ✅ Selected tasks saved and displayed on Home
- ✅ Loading / error / empty states everywhere
- ✅ Logout with token revocation

## Build APK

```bash
npx eas build -p android --profile preview
```

Or for local build:
```bash
npx expo run:android
```
