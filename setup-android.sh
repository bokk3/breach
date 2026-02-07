#!/bin/bash

echo "🚀 Cyber Breach - Android Setup Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing Capacitor dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Initialize Capacitor (if not already done)
if [ ! -f "capacitor.config.json" ]; then
    echo "⚙️  Initializing Capacitor..."
    npx cap init "Cyber Breach" "com.cyberbreach.game" --web-dir="."
else
    echo "✅ Capacitor already initialized"
fi

echo ""

# Add Android platform
if [ ! -d "android" ]; then
    echo "📱 Adding Android platform..."
    npx cap add android
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to add Android platform"
        exit 1
    fi
    
    echo "✅ Android platform added"
else
    echo "✅ Android platform already exists"
fi

echo ""

# Copy web assets to Android
echo "📋 Copying web assets to Android..."
npx cap copy android

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy assets"
    exit 1
fi

echo "✅ Assets copied"
echo ""

# Check if Android Studio is installed
if command -v studio &> /dev/null || [ -d "/Applications/Android Studio.app" ] || [ -d "$HOME/android-studio" ]; then
    echo "✅ Android Studio detected"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npx cap open android"
    echo "2. In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "3. Find your APK in: android/app/build/outputs/apk/debug/"
    echo ""
    
    read -p "Open Android Studio now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx cap open android
    fi
else
    echo "⚠️  Android Studio not detected"
    echo ""
    echo "Please install Android Studio from:"
    echo "https://developer.android.com/studio"
    echo ""
    echo "After installation, run: npx cap open android"
fi

echo ""
echo "📚 For more info, see: ANDROID_APP_GUIDE.md"
