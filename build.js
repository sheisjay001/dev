const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting custom build script...');

const rootDir = process.cwd();
const webDir = path.join(rootDir, 'web');
const publicDir = path.join(rootDir, 'public');

// Helper to run commands
function run(command, cwd) {
  console.log(`\n> Running: ${command} in ${cwd || rootDir}`);
  try {
    execSync(command, { stdio: 'inherit', cwd: cwd || rootDir, shell: true });
  } catch (err) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

// 1. Install Web Dependencies
console.log('\n📦 Installing web dependencies...');
// Use --legacy-peer-deps to avoid potential conflicts
run('npm install --legacy-peer-deps', webDir);

// 2. Build Web App
console.log('\n🏗️ Building web app...');
run('npm run build', webDir);

// 3. Move Build Output
console.log('\n📂 Moving build artifacts to public...');
const distDir = path.join(webDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error(`❌ Dist directory not found at ${distDir}`);
  process.exit(1);
}

// Ensure public dir exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Copy files
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(distDir, publicDir);

console.log('\n✅ Build completed successfully!');
