import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = './public/icons';

// Create icons directory
await mkdir(outputDir, { recursive: true });

// Generate simple SVG icon
const generateSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text x="50%" y="55%" font-family="system-ui, sans-serif" font-size="${size * 0.45}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">ICA</text>
</svg>`;

// Generate all sizes
for (const size of sizes) {
  const svg = Buffer.from(generateSVG(size));
  const outputPath = join(outputDir, `icon-${size}x${size}.png`);
  
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`✅ Generated ${size}x${size} icon`);
}

console.log('\n🎉 All PWA icons generated successfully!');
