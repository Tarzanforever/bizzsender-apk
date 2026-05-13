#!/bin/bash
# ===================================================
# Bizz Sender APK Builder
# הרץ את הקובץ הזה מהמחשב שלך (Mac/Linux)
# ===================================================

set -e

echo "📦 מתקין eas-cli..."
npm install -g eas-cli

echo "🔑 מתחבר ל-Expo..."
export EXPO_TOKEN="yIcjFlOnAbJ7ATSkdThamoD9CX6K9gPzh1_-m0a0"

echo "⚙️  מגדיר פרויקט..."
eas project:init --id bizzsender-apk --non-interactive 2>/dev/null || true

echo "🏗️  מתחיל build (APK לאנדרואיד)..."
echo "זה לוקח כ-15 דקות. תקבל לינק להורדה כשיגמר."
eas build --platform android --profile preview --non-interactive

echo ""
echo "✅ הבuild הסתיים! פתח את הלינק למעלה להורדת ה-APK"
