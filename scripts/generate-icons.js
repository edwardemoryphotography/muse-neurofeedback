#!/usr/bin/env node

/**
 * Icon Generator Script
 * 
 * This script generates placeholder icons for the app.
 * In production, replace these with your actual brand icons.
 * 
 * To generate proper icons:
 * 1. Create a 1024x1024 PNG icon
 * 2. Use https://easyappicon.com/ or similar to generate all sizes
 * 3. Replace files in the assets/ folder
 */

const fs = require('fs');
const path = require('path');

// Simple 1x1 purple PNG (base64)
// This is a placeholder - replace with actual icons
const purplePixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const assetsDir = path.join(__dirname, '..', 'assets');

const icons = [
  'icon.png',
  'splash-icon.png', 
  'adaptive-icon.png',
  'favicon.png'
];

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder icons
icons.forEach(icon => {
  const iconPath = path.join(assetsDir, icon);
  fs.writeFileSync(iconPath, purplePixel);
  console.log(`Created: ${icon}`);
});

console.log('\n✅ Placeholder icons created!');
console.log('\n📝 To create proper icons:');
console.log('   1. Design a 1024x1024 PNG icon');
console.log('   2. Visit https://easyappicon.com/');
console.log('   3. Upload and download the icon pack');
console.log('   4. Replace files in the assets/ folder');
