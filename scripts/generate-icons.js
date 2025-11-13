const fs = require('fs');
const path = require('path');

// Simple function to create a data URL for a PNG with text
function createIconSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0369a1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-size="${size/2.5}" fill="white" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dy=".35em">PH</text>
</svg>`;
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVG files (browsers will accept SVG as icons)
fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), createIconSVG(192));
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), createIconSVG(512));

console.log('✅ Icon SVG files created successfully!');
console.log('📁 Location: public/icon-192x192.svg and public/icon-512x512.svg');
console.log('');
console.log('Note: For production, convert these to PNG using:');
console.log('- Online tool: https://cloudconvert.com/svg-to-png');
console.log('- Or use: npm install -g svgexport && svgexport icon-192x192.svg icon-192x192.png');
