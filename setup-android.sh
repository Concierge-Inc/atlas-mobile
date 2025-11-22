#!/bin/bash

# Android Development Environment Setup for Atlas Mobile

echo "Setting up Android environment variables..."

# Android SDK location (default for Homebrew installation)
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME

# Add Android SDK tools to PATH
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Java home (required for Android builds)
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home

echo "Android environment configured!"
echo ""
echo "ANDROID_HOME: $ANDROID_HOME"
echo "JAVA_HOME: $JAVA_HOME"
echo ""
echo "Next steps:"
echo "1. Open Android Studio: open -a 'Android Studio'"
echo "2. Complete the setup wizard and install SDK"
echo "3. Create/start an Android emulator"
echo "4. Run: npm run android"
