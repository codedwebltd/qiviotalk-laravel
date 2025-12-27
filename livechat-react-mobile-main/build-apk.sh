#!/bin/bash
# Livechat Mobile - APK Build & Deploy Script
# Run this script to build and deploy your app to Expo

set -e  # Exit on error

echo "🚀 Starting Livechat Mobile APK Build Process..."
echo ""

# Color codes for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI is not installed.${NC}"
    echo -e "${YELLOW}Installing EAS CLI globally...${NC}"
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI installed successfully!${NC}"
    echo ""
fi

# Login to Expo (if not already logged in)
echo -e "${BLUE}🔐 Checking Expo authentication...${NC}"
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to your Expo account:${NC}"
    eas login
else
    EXPO_USER=$(eas whoami)
    echo -e "${GREEN}✅ Logged in as: $EXPO_USER${NC}"
fi
echo ""

# Build the APK
echo -e "${BLUE}📦 Building Android APK (Production)...${NC}"
echo -e "${YELLOW}This will take several minutes. You can close this terminal and check status on Expo.${NC}"
echo ""

eas build --platform android --profile production --non-interactive

echo ""
echo -e "${GREEN}✅ Build request submitted successfully!${NC}"
echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo "1. Wait for the build to complete (you'll get an email)"
echo "2. Download the APK from the Expo dashboard"
echo "3. Install it on your Android device for testing"
echo ""
echo -e "${YELLOW}💡 Tip: View build status at https://expo.dev/accounts/$(eas whoami)/projects/livechat-mobile/builds${NC}"
echo ""
echo -e "${GREEN}🎉 Done!${NC}"
