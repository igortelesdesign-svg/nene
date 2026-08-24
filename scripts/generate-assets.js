import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const iconSvg = fs.readFileSync('./public/icon.svg');
const logoSvg = fs.readFileSync('./public/logo.svg');

// Maskable icon with 10% safe zone padding inside rounded squircle
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#133A34"/>
  <g transform="translate(51, 51) scale(0.8)">
    <path d="M 205 160 L 256 105 L 307 160" fill="none" stroke="#F08A6B" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 345 285 C 345 230 310 190 256 190 C 200 190 160 235 160 295 C 160 358 202 400 262 400 C 298 400 328 385 344 365" fill="none" stroke="#FFF6EE" stroke-width="46" stroke-linecap="round"/>
    <path d="M 164 285 L 340 285" fill="none" stroke="#FFF6EE" stroke-width="46" stroke-linecap="round"/>
  </g>
</svg>
`;

async function generate() {
  // 192x192
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .png()
    .toFile('./public/icon-192.png');

  // 512x512
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile('./public/icon-512.png');

  // Apple touch icon (180x180)
  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png()
    .toFile('./public/apple-touch-icon.png');

  // Favicon png (32x32 and 64x64)
  await sharp(Buffer.from(iconSvg))
    .resize(32, 32)
    .png()
    .toFile('./public/favicon.png');

  await sharp(Buffer.from(iconSvg))
    .resize(32, 32)
    .png()
    .toFile('./public/favicon.ico');

  // Maskable 512x512
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile('./public/icon-maskable-512.png');

  // Logo PNG
  await sharp(Buffer.from(logoSvg))
    .resize(960, 320)
    .png()
    .toFile('./public/logo.png');

  console.log('All PWA and brand visual assets generated successfully!');
}

generate().catch(console.error);
