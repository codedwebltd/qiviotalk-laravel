
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
