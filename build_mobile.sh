#!/bin/bash
# 1. Exit immediately if any command fails
set -e
# 2. Define configuration variables
WRAPPER_DIR="game-wrapper"
APP_ID="com.yourname.gametitle"
APP_NAME="GameTitle"
echo "📦 Step 1: Building your Bolt web project..."
npm install
npm run build
# Automatically detect build folder (dist, build, or out)
if [ -d "dist" ]; then
    BUILD_DIR="dist"
elif [ -d "build" ]; then
    BUILD_DIR="build"
elif [ -d "out" ]; then
    BUILD_DIR="out"
else
    echo "❌ Error: Could not find build, dist, or out folder. Run your build manually first."
    exit 1
fi
echo "✅ Found build assets in: $BUILD_DIR"
echo "🛠️ Step 2: Installing Cordova globally..."
sudo npm install -g cordova
echo "🏗️ Step 3: Creating Cordova wrapper project..."
if [ -d "$WRAPPER_DIR" ]; then
    echo "♻️ Removing old wrapper project..."
    rm -rf "$WRAPPER_DIR"
fi
cordova create "$WRAPPER_DIR" "$APP_ID" "$APP_NAME"
cd "$WRAPPER_DIR"
echo "🤖 Step 4: Adding mobile platforms..."
cordova platform add android
# Uncomment the line below if you are working on a Mac and want iOS
# cordova platform add ios
echo "🧹 Step 5: Transferring game assets..."
rm -rf www/*
cp -R ../$BUILD_DIR/* www/
echo "⚙️ Step 6: Injecting mobile game configurations..."
# This inserts game preferences into config.xml right before the closing </widget> tag
cat <<EOF > patch.xml
    <preference name="Orientation" value="landscape" />
    <preference name="ViewportScale" value="fixed" />
    <preference name="AutoplayPolicy" value="no-user-gesture-required" />
    <preference name="Fullscreen" value="true" />
</widget>
EOF
# Swap the closing tag with our new settings block
sed -i '' 's|<\/widget>||g' config.xml 2>/dev/null || sed -i 's|<\/widget>||g' config.xml
cat patch.xml >> config.xml
rm patch.xml
echo "🏗️ Step 7: Compiling native mobile packages..."
cordova build android
# Uncomment below if building for iOS on a Mac
# cordova build ios
echo "🎉 Success! Your game is compiled. Run 'cd $WRAPPER_DIR && cordova emulate android' to test."
