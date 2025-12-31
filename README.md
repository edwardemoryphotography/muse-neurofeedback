# Muse Neurofeedback

A beautiful mobile application for Muse EEG headbands with real-time brain visualization and mindfulness training. Built with React Native and Expo for testing on iOS and Android.

![App Preview](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![Expo SDK](https://img.shields.io/badge/Expo-SDK%2052-black)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🧠 Real-time EEG Visualization** - Watch your brain activity in real-time with beautiful charts
- **📊 Frequency Band Analysis** - See Delta, Theta, Alpha, Beta, and Gamma wave activity
- **🧘 Guided Meditation** - Timed meditation sessions with calm/focus scoring from real EEG data
- **📈 Progress Tracking** - View your meditation history stored locally on your device
- **🔋 Battery & Signal Monitoring** - Keep track of your Muse headband status
- **🌙 Beautiful Dark UI** - Modern, eye-friendly interface designed for relaxation
- **📱 100% Real Data** - No simulated or mock data - all brain activity comes directly from your Muse headband

## 📱 Testing on Your iPhone

### Requirements

This app requires a **Muse headband** (Muse 2 or Muse S) to function. All brain activity data comes directly from your headband via Bluetooth - there is no simulated or demo mode.

### Development Build (Required for Bluetooth)

Since Bluetooth requires native code, you need a development build to connect to your Muse headband:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

3. **Login to Expo**
   ```bash
   eas login
   ```

4. **Create a Development Build**
   ```bash
   eas build --profile development --platform ios
   ```

5. **Install on Your Device**
   - Once the build completes, you'll receive a link to download the app
   - Install it on your iPhone using the provided instructions

6. **Start Development Server**
   ```bash
   npx expo start --dev-client
   ```

7. **Connect Your Muse**
   - Turn on your Muse headband (hold button until it flashes)
   - Open the app and tap "Scan for Muse" on the Home screen
   - Select your device to connect

### Running on iOS Simulator (Mac Only)

```bash
# Install dependencies
npm install

# Start with iOS simulator
npx expo run:ios
```

## 🛠️ Project Structure

```
muse-neurofeedback/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout
│   └── (tabs)/                  # Tab navigation
│       ├── _layout.tsx          # Tab bar configuration
│       ├── index.tsx            # Home screen
│       ├── meditate.tsx         # Meditation session screen
│       ├── visualize.tsx        # Brain activity visualization
│       └── history.tsx          # Session history & stats
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── BrainWaveChart.tsx   # Frequency band bar chart
│   │   ├── CalmMeter.tsx        # Circular progress meter
│   │   ├── ConnectionCard.tsx   # Muse connection UI
│   │   ├── EEGWaveform.tsx      # Real-time EEG traces
│   │   └── SessionStats.tsx     # Meditation statistics
│   ├── hooks/                   # Custom React hooks
│   │   ├── useMuse.ts           # Muse headband state
│   │   └── useMeditationSession.ts  # Session management
│   └── services/
│       └── MuseService.ts       # Bluetooth & EEG processing
├── assets/                      # App icons and images
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## 🧠 How It Works

### Connecting to Muse

1. Turn on your Muse headband (hold the button until it flashes)
2. Open the app and tap "Scan for Muse" on the Home screen
3. Wait for your device to appear and connect
4. Ensure good signal quality on all 4 sensors

### Understanding Brain Waves

| Wave | Frequency | Associated With |
|------|-----------|-----------------|
| **Delta** | 0.5-4 Hz | Deep sleep, healing |
| **Theta** | 4-8 Hz | Creativity, meditation |
| **Alpha** | 8-13 Hz | Relaxed focus, calm |
| **Beta** | 13-30 Hz | Active thinking, alertness |
| **Gamma** | 30-100 Hz | Peak performance, insight |

### Meditation Scoring

- **Calm Score**: Higher alpha + theta, lower beta
- **Focus Score**: Balanced beta with moderate alpha

## 📋 Requirements

- **Node.js** 18 or later
- **Expo CLI** (installed automatically)
- **iPhone** running iOS 13+ (for testing)
- **Muse Headband** (Muse 2 or Muse S recommended)

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start -c

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run linting
npm run lint

# Run tests
npm run test
```

### Environment Setup

1. Install [Node.js](https://nodejs.org/) (v18+)
2. Install [Watchman](https://facebook.github.io/watchman/) (recommended for macOS)
3. For iOS: Install Xcode from the Mac App Store
4. For Android: Install Android Studio

## 🐛 Troubleshooting

### "Muse not found" during scan
- Ensure Bluetooth is enabled on your phone
- Make sure the Muse is in pairing mode (flashing light)
- Try restarting the Muse headband
- Move closer to the headband

### Poor signal quality
- Ensure sensors are making good contact with skin
- Clean the sensors with a damp cloth
- Adjust the headband fit
- Remove any hair blocking the sensors

### App won't start
```bash
# Clear cache and restart
npx expo start -c

# Reset node modules
rm -rf node_modules
npm install
```

### Build errors on iOS
```bash
# Clear Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reinstall pods
cd ios && pod install --repo-update && cd ..
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [Muse by Interaxon](https://choosemuse.com/) for their amazing EEG headbands
- [Expo](https://expo.dev/) for the excellent React Native tooling
- [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx) for Bluetooth support

---

Made with 💜 for mindfulness and brain exploration
