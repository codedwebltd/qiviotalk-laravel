// SVG to PNG converter using sharp
const fs = require('fs');
const path = require('path');

async function convertSVGtoPNG() {
  try {
    const sharp = require('sharp');

    const tempIconsDir = path.join(__dirname, '..', 'assets', 'images', 'temp-icons');

    const files = [
      { name: 'icon', size: 1024 },
      { name: 'android-icon-foreground', size: 1024 },
      { name: 'android-icon-background', size: 1024 },
      { name: 'android-icon-monochrome', size: 1024 },
      { name: 'splash-icon', size: 1024 },
      { name: 'favicon', size: 48 }
    ];

    console.log('Converting SVG files to PNG...\n');

    for (const file of files) {
      const svgPath = path.join(tempIconsDir, `${file.name}.svg`);
      const pngPath = path.join(tempIconsDir, `${file.name}.png`);

      await sharp(svgPath)
        .resize(file.size, file.size)
        .png()
        .toFile(pngPath);

      console.log(`✓ Converted ${file.name}.svg → ${file.name}.png (${file.size}x${file.size})`);
    }

    console.log('\n✅ All icons converted to PNG successfully!');
    console.log('📁 Location: assets/images/temp-icons/\n');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Sharp is not installed.');
      console.log('\nPlease run: npm install sharp\n');
    } else {
      console.error('Error converting icons:', error.message);
    }
    process.exit(1);
  }
}

convertSVGtoPNG();
