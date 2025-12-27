// TEMPORARY ICON GENERATOR - DELETE THIS FILE WHEN REAL LOGO IS READY
// Simple script to generate placeholder "L" icons as PNG

const fs = require('fs');
const path = require('path');

// Professional LT icon generator (Livechat Tidu)
function generateIconHTML(size, isAdaptive = false) {
  const padding = isAdaptive ? size * 0.15 : size * 0.1;
  const fontSize = Math.floor((size - (padding * 2)) * 0.55);
  const cornerRadius = size * 0.18;

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0EA5E9;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366F1;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.015}" flood-opacity="0.3"/>
    </filter>
  </defs>
  ${isAdaptive ? '' : `<rect width="${size}" height="${size}" fill="url(#grad)" rx="${cornerRadius}"/>`}
  <text x="50%" y="53%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle" letter-spacing="${fontSize * -0.05}" filter="url(#shadow)">LT</text>
</svg>`;

  return svg;
}

function generateMonochromeHTML(size) {
  const padding = size * 0.15;
  const fontSize = Math.floor((size - (padding * 2)) * 0.55);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="53%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle" letter-spacing="${fontSize * -0.05}">LT</text>
</svg>`;
}

function generateBackgroundHTML(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0EA5E9;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366F1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
</svg>`;
}

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets', 'images', 'temp-icons');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate PNG instruction file
const instructions = `
TEMPORARY ICON GENERATION
========================

SVG files have been generated. To convert to PNG, you have 2 options:

OPTION 1 - Use online converter (simplest):
1. Go to https://svgtopng.com or https://cloudconvert.com/svg-to-png
2. Upload each SVG file from assets/images/temp-icons/
3. Download as PNG and save in the same folder

OPTION 2 - Use command line (if you have ImageMagick installed):
Run this command in the terminal:
  npm install sharp
  node scripts/convert-svg-to-png.js

Files to convert:
- icon.svg → icon.png (1024x1024)
- android-icon-foreground.svg → android-icon-foreground.png (1024x1024)
- android-icon-background.svg → android-icon-background.png (1024x1024)
- android-icon-monochrome.svg → android-icon-monochrome.png (1024x1024)
- splash-icon.svg → splash-icon.png (1024x1024)
- favicon.svg → favicon.png (48x48)

After conversion, update app.json paths to point to temp-icons folder.
`;

// Generate SVG files
console.log('Generating temporary icon assets...\n');

// Main icon (1024x1024)
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), generateIconHTML(1024));
console.log('✓ Generated icon.svg');

// Adaptive icon foreground (1024x1024)
fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.svg'), generateIconHTML(1024, true));
console.log('✓ Generated android-icon-foreground.svg');

// Adaptive icon background (1024x1024)
fs.writeFileSync(path.join(assetsDir, 'android-icon-background.svg'), generateBackgroundHTML(1024));
console.log('✓ Generated android-icon-background.svg');

// Monochrome icon (1024x1024)
fs.writeFileSync(path.join(assetsDir, 'android-icon-monochrome.svg'), generateMonochromeHTML(1024));
console.log('✓ Generated android-icon-monochrome.svg');

// Splash icon (1024x1024)
fs.writeFileSync(path.join(assetsDir, 'splash-icon.svg'), generateIconHTML(1024));
console.log('✓ Generated splash-icon.svg');

// Favicon (48x48)
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), generateIconHTML(48));
console.log('✓ Generated favicon.svg');

fs.writeFileSync(path.join(assetsDir, 'README.txt'), instructions);

console.log('\n✅ All temporary SVG icons generated!');
console.log('📁 Location: assets/images/temp-icons/');
console.log('\n⚠️  NEXT STEP: Convert SVG to PNG (see README.txt in temp-icons folder)');
console.log('   Or run: npm install sharp && node scripts/convert-svg-to-png.js\n');
