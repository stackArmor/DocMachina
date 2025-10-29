#!/bin/bash

echo "============================================"
echo "DocMachina Setup Script"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js from https://nodejs.org/"
    echo "Download the LTS version and run the installer."
    echo ""
    exit 1
fi

echo "Node.js is installed: $(node --version)"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available!"
    echo "Please reinstall Node.js from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "npm is available: $(npm --version)"
echo ""

# Install dependencies
echo "Installing dependencies..."
echo "This may take a few minutes..."
echo ""
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to install dependencies!"
    echo "Please check your internet connection and try again."
    echo ""
    exit 1
fi

echo ""
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
echo "You can now run DocMachina with one of these commands:"
echo ""
echo "  npm start           - Run the application in development mode"
echo "  npm run build:mac   - Build a macOS installer (macOS only)"
echo "  npm run build:linux - Build a Linux installer (Linux only)"
echo ""
echo "The built application will be in the 'dist' folder."
echo ""
