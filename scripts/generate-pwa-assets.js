import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import { mkdir, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Polyfill for fs.mkdir with recursive option
const mkdirAsync = (path, options) => new Promise((resolve, reject) => {
  mkdir(path, { recursive: true, ...options }, (err) => {
    if (err) reject(err);
    else resolve();
  });
});

// Polyfill for fs.existsSync
const exists = (path) => {
  try {
    return existsSync(path);
  } catch (err) {
    return false;
  }
};

// Ensure output directories exist
const publicDir = join(__dirname, '../public');
const iconsDir = join(publicDir, 'icons');

// Create directories if they don't exist
const ensureDir = async (dir) => {
  if (!exists(dir)) {
    await mkdirAsync(dir, { recursive: true });
  }
};

// Initialize directories
const initDirs = async () => {
  try {
    await ensureDir(iconsDir);
    console.log('Directories initialized');
  } catch (error) {
    console.error('Error initializing directories:', error);
    throw error;
  }
};

// Configuration for different icon sizes
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const splashSizes = [
  { width: 640, height: 1136 },
  { width: 750, height: 1334 },
  { width: 828, height: 1792 },
  { width: 1125, height: 2436 },
  { width: 1242, height: 2208 },
  { width: 1242, height: 2688 },
  { width: 1536, height: 2048 },
  { width: 1668, height: 2224 },
  { width: 1668, height: 2388 },
  { width: 2048, height: 2732 },
];

// Create a simple icon with text as fallback
async function generateFallbackIcon() {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 180px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CG', size / 2, size / 2);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  await sharp(buffer)
    .resize(size, size)
    .toFile(join(iconsDir, `icon-${size}x${size}.png`));
  
  console.log(`Generated fallback icon: icon-${size}x${size}.png`);
  
  // Generate other sizes
  await Promise.all(
    iconSizes
      .filter(s => s !== size)
      .map(async (iconSize) => {
        try {
          await sharp(buffer)
            .resize(iconSize, iconSize)
            .toFile(join(iconsDir, `icon-${iconSize}x${iconSize}.png`));
          console.log(`Generated icon: icon-${iconSize}x${iconSize}.png`);
        } catch (error) {
          console.error(`Error generating icon size ${iconSize}:`, error);
          throw error;
        }
      })
  );
}

// Generate splash screens
async function generateSplashScreens() {
  const size = { width: 512, height: 512 };
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, size.width, size.height);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 100px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CropGenius', size.width / 2, size.height / 2);
  
  const buffer = canvas.toBuffer('image/png');
  
  await Promise.all(
    splashSizes.map(async (splash) => {
      try {
        const splashPath = join(publicDir, 'splash', `splash-${splash.width}x${splash.height}.png`);
        
        await sharp(buffer)
          .resize(splash.width, splash.height, {
            fit: 'cover',
            position: 'center',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .toFile(splashPath);
        
        console.log(`Generated splash screen: splash-${splash.width}x${splash.height}.png`);
      } catch (error) {
        console.error(`Error generating splash screen ${splash.width}x${splash.height}:`, error);
        throw error;
      }
    })
  );
}

// Generate all assets
async function generateAssets() {
  try {
    console.log('Generating PWA assets...');
    
    // Initialize directories first
    await initDirs();
    
    // Generate icons and splash screens
    await generateFallbackIcon();
    
    // Create splash directory if it doesn't exist
    const splashDir = join(publicDir, 'splash');
    await ensureDir(splashDir);
    
    await generateSplashScreens();
    console.log('✅ PWA assets generated successfully!');
  } catch (error) {
    console.error('❌ Error generating PWA assets:', error);
    process.exit(1);
  }
}

// Run the asset generation
generateAssets().catch(error => {
  console.error('Unhandled error in generateAssets:', error);
  process.exit(1);
});
