// Simple script to create basic PNG icons using canvas
// Install with: npm install canvas

const fs = require('fs');
const path = require('path');

// Check if canvas is available
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.log('⚠️  Canvas not installed. Using fallback SVG method.');
  console.log('For PNG icons, install canvas: npm install canvas');
  console.log('');

  // Fallback: Create SVG files that browsers accept
  function createIconSVG(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0369a1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="32"/>
  <text x="50%" y="50%" font-size="${size/2.5}" fill="white" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dy=".35em">PH</text>
</svg>`;
  }

  const publicDir = path.join(__dirname, '..', 'public');
  fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), createIconSVG(192));
  fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), createIconSVG(512));

  // Also create a simple favicon
  fs.copyFileSync(
    path.join(publicDir, 'icon-192x192.svg'),
    path.join(publicDir, 'favicon.ico')
  );

  console.log('✅ SVG icon files created!');
  console.log('📁 Files: public/icon-192x192.svg, public/icon-512x512.svg');
  process.exit(0);
}

// If canvas is available, create PNG files
async function createPNGIcon(size) {
  const canvas = Canvas.createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0ea5e9');
  gradient.addColorStop(1, '#0369a1');
  ctx.fillStyle = gradient;

  // Draw rounded rectangle
  const radius = size / 8;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();

  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size / 2.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PH', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Create 192x192
  const icon192 = await createPNGIcon(192);
  fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), icon192);

  // Create 512x512
  const icon512 = await createPNGIcon(512);
  fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), icon512);

  // Create favicon (32x32)
  const favicon = await createPNGIcon(32);
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);

  console.log('✅ PNG icon files created successfully!');
  console.log('📁 Files: public/icon-192x192.png, public/icon-512x512.png, public/favicon.png');
}

generateIcons().catch(console.error);
