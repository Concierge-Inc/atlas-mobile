# ATLAS Mobile

A React Native mobile application for exclusive private service bookings including aviation, chauffeur, armoured transport, and protection services.

## Features

- **Service Booking Flow**: Multi-step booking process for different service categories
- **AI Concierge**: Integrated with Google Gemini AI for intelligent assistance
- **Dashboard**: User profile and account management
- **Booking Tracker**: View and manage your bookings
- **Elegant Dark UI**: Minimalist, professional design

## Prerequisites

- Node.js >= 20
- React Native development environment set up ([Setup Guide](https://reactnative.dev/docs/environment-setup))
- Xcode (for iOS development)
- Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atlas-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

4. Configure environment variables:
   - Copy `.env` to create your local environment file
   - Add your Google Gemini API key:
```bash
API_KEY=your_google_gemini_api_key_here
```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Start Metro Bundler (separately)
```bash
npm start
```

## Project Structure

```
atlas-mobile/
├── src/
│   ├── components/          # React components
│   │   ├── BookingFlow.tsx  # Multi-step booking interface
│   │   ├── Concierge.tsx    # AI chat interface
│   │   ├── Dashboard.tsx    # User profile management
│   │   └── BookingTracker.tsx # Booking list & tracker
│   ├── services/
│   │   └── geminiService.ts # Google Gemini AI integration
│   ├── types.ts             # TypeScript type definitions
│   └── constants.ts         # App constants and mock data
├── App.tsx                  # Main app component
└── .env                     # Environment variables (not in git)
```

## Service Categories

1. **Aviation** - Private air transfers (helicopters, jets)
2. **Chauffeur** - Executive ground transport
3. **Armoured** - Ballistic-rated vehicle transport (B6/B7)
4. **Protection** - Security personnel and close protection

## Technologies Used

- **React Native 0.82.1**
- **TypeScript**
- **Google Generative AI** - For AI concierge chat
- **React Native Vector Icons** - Feather icon set
- **React Native Config** - Environment variable management
- **React Native Safe Area Context** - Safe area handling

## Configuration

### Vector Icons Setup

The app uses Feather icons from react-native-vector-icons. Icons are automatically linked through auto-linking.

### Environment Variables

Create a `.env` file in the root directory with:

```env
API_KEY=your_google_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## UI Design

The app features a dark, minimalist design inspired by luxury service platforms:

- Background: `#0a0a0a` (obsidian)
- Primary text: `#ffffff`
- Secondary text: `#737373` - `#d4d4d4`
- Accents: `#262626` - `#404040`
- Typography: Sans-serif with Courier New for technical elements

## Development Notes

- The app uses a custom navigation system (no react-navigation required for this version)
- AI responses are powered by Google's Gemini 2.0 Flash model
- Mock booking data is used for demonstration purposes
- SafeAreaView is used for proper iOS notch handling

## Troubleshooting

### iOS Build Issues

If you encounter CocoaPods issues:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Vector Icons Not Showing

Rebuild the app:
```bash
# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

### Environment Variables Not Loading

Make sure:
1. `.env` file exists in project root
2. File contains `API_KEY=your_key`
3. Restart Metro bundler after changing `.env`

## License

Private/Proprietary

## Contact

For questions or support, contact the development team.
