#!/usr/bin/env node
/**
 * Image Optimization Script
 *
 * Optimizes all images in the AirQualityMap project:
 * - Converts logo.png to WebP with proper dimensions
 * - Generates proper favicon.ico
 * - Converts sensor JPEGs to WebP with reduced size
 */

import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const SENSORS_DIR = join(PUBLIC_DIR, 'sensors');

// Configuration
const LOGO_CONFIG = {
  input: join(PUBLIC_DIR, 'logo.png'),
  output: join(PUBLIC_DIR, 'logo.webp'),
  width: 340,
  height: 97,
  quality: 85,
};

const FAVICON_CONFIG = {
  input: join(PUBLIC_DIR, 'logo.png'),
  output: join(PUBLIC_DIR, 'favicon.ico'),
  sizes: [16, 32],
};

const SENSOR_CONFIG = {
  maxWidth: 400,
  maxHeight: 250,
  quality: 80,
};

/**
 * Optimize logo to WebP format
 */
async function optimizeLogo() {
  console.log('📷 Optimizing logo...');

  try {
    const image = sharp(LOGO_CONFIG.input);
    const metadata = await image.metadata();

    console.log(`   Original: ${(metadata.size / 1024).toFixed(1)} KB (${metadata.width}x${metadata.height})`);

    await image
      .resize(LOGO_CONFIG.width, LOGO_CONFIG.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: LOGO_CONFIG.quality })
      .toFile(LOGO_CONFIG.output);

    const stats = await sharp(LOGO_CONFIG.output).metadata();
    console.log(`   ✅ Output: ${(stats.size / 1024).toFixed(1)} KB (${stats.width}x${stats.height})`);
    console.log(`   💾 Saved: ${((metadata.size - stats.size) / 1024).toFixed(1)} KB (${(((metadata.size - stats.size) / metadata.size) * 100).toFixed(0)}% reduction)`);
  } catch (error) {
    console.error('   ❌ Error optimizing logo:', error.message);
  }
}

/**
 * Generate favicon in ICO format
 */
async function generateFavicon() {
  console.log('📷 Generating favicon...');

  try {
    // Create 32x32 favicon (ICO format)
    await sharp(FAVICON_CONFIG.input)
      .resize(32, 32, { fit: 'cover' })
      .toFile(FAVICON_CONFIG.output);

    const stats = await sharp(FAVICON_CONFIG.output).metadata();
    console.log(`   ✅ Output: ${(stats.size / 1024).toFixed(1)} KB (${stats.width}x${stats.height})`);

    // Also create a modern SVG favicon from the logo
    // For now, we'll just use the ico file
  } catch (error) {
    console.error('   ❌ Error generating favicon:', error.message);
  }
}

/**
 * Convert sensor images to WebP
 */
async function optimizeSensorImages() {
  console.log('📷 Optimizing sensor images...');

  try {
    const files = await readdir(SENSORS_DIR);
    const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));

    let totalOriginal = 0;
    let totalOptimized = 0;

    for (const file of imageFiles) {
      const inputPath = join(SENSORS_DIR, file);
      const outputFileName = file.replace(/\.(jpg|jpeg)$/i, '.webp');
      const outputPath = join(SENSORS_DIR, outputFileName);

      try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        const originalSize = metadata.size;
        totalOriginal += originalSize;

        await image
          .resize(SENSOR_CONFIG.maxWidth, SENSOR_CONFIG.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: SENSOR_CONFIG.quality })
          .toFile(outputPath);

        const optimizedStats = await sharp(outputPath).metadata();
        totalOptimized += optimizedStats.size;

        const saved = originalSize - optimizedStats.size;
        const percentReduction = ((saved / originalSize) * 100).toFixed(0);

        console.log(`   ${file}: ${(originalSize / 1024).toFixed(1)} KB → ${(optimizedStats / 1024).toFixed(1)} KB (${percentReduction}% reduction)`);
      } catch (error) {
        console.error(`   ❌ Error processing ${file}:`, error.message);
      }
    }

    console.log(`   ✅ Total: ${(totalOriginal / 1024).toFixed(1)} KB → ${(totalOptimized / 1024).toFixed(1)} KB`);
    console.log(`   💾 Total saved: ${((totalOriginal - totalOptimized) / 1024).toFixed(1)} KB (${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(0)}% reduction)`);
  } catch (error) {
    console.error('   ❌ Error processing sensor images:', error.message);
  }
}

/**
 * Update sensorPhotos.ts to use WebP extensions
 */
async function updateSensorPhotoImports() {
  console.log('📝 Updating sensor photo imports...');

  const sensorPhotosPath = join(__dirname, '..', 'src', 'lib', 'sensorPhotos.ts');

  try {
    let content = await readFile(sensorPhotosPath, 'utf-8');

    // Replace .jpg extensions with .webp
    const updated = content.replace(/\.jpg'/g, ".webp'");

    await writeFile(sensorPhotosPath, updated, 'utf-8');
    console.log('   ✅ Updated sensorPhotos.ts to use .webp extensions');
  } catch (error) {
    console.error('   ❌ Error updating imports:', error.message);
  }
}

/**
 * Update index.astro favicon reference
 */
async function updateFaviconReference() {
  console.log('📝 Updating favicon reference...');

  const indexPath = join(__dirname, '..', 'src', 'pages', 'index.astro');

  try {
    let content = await readFile(indexPath, 'utf-8');

    // Update favicon link if present
    const updated = content.replace(
      /<link rel="icon" type="image\/png" href="\/favicon\.png" \/>/,
      '<link rel="icon" href="/favicon.ico" />'
    );

    await writeFile(indexPath, updated, 'utf-8');
    console.log('   ✅ Updated index.astro favicon reference');
  } catch (error) {
    console.error('   ❌ Error updating favicon reference:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Image Optimization Script\n');

  await optimizeLogo();
  console.log();

  await generateFavicon();
  console.log();

  await optimizeSensorImages();
  console.log();

  await updateSensorPhotoImports();
  console.log();

  await updateFaviconReference();
  console.log();

  console.log('✅ Image optimization complete!');
  console.log('\n💡 Next steps:');
  console.log('   - Review the optimized images');
  console.log('   - Test the app to ensure all images load correctly');
  console.log('   - Commit the changes');
  console.log('   - Optionally: Delete original .jpg files from /public/sensors/');
}

// Run the script
main().catch(console.error);
