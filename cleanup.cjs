const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');
const trashDir = path.join(publicDir, 'trash');

// Directories to check for unused images
const dirsToCheck = ['assets', 'clubs and their reps', 'games', 'photos', 'posters'];

// Get all source code content
let sourceContent = '';

function readSourceFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readSourceFiles(fullPath);
    } else if (['.js', '.jsx', '.css', '.html'].includes(path.extname(fullPath))) {
      sourceContent += fs.readFileSync(fullPath, 'utf8') + '\n';
    }
  }
}

// Read src/ and public/index.html
readSourceFiles(srcDir);
sourceContent += fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

if (!fs.existsSync(trashDir)) {
  fs.mkdirSync(trashDir);
}

let movedCount = 0;

dirsToCheck.forEach(dirName => {
  const targetDir = path.join(publicDir, dirName);
  if (!fs.existsSync(targetDir)) return;

  const files = fs.readdirSync(targetDir);
  for (const file of files) {
    const fullPath = path.join(targetDir, file);
    if (fs.statSync(fullPath).isDirectory()) continue;

    // Check if the filename exists anywhere in the source code
    // E.g. "hero.jpg"
    if (!sourceContent.includes(file)) {
      // Also check URL encoded version just in case
      const encodedFile = encodeURIComponent(file);
      if (!sourceContent.includes(encodedFile)) {
        // Move to trash
        const destPath = path.join(trashDir, file);
        fs.renameSync(fullPath, destPath);
        console.log(`Moved to trash: ${dirName}/${file}`);
        movedCount++;
      }
    }
  }
});

// Also check root images in public/
const rootFiles = ['hero.jpg', 'logo.png', 'favicon.svg'];
rootFiles.forEach(file => {
  const fullPath = path.join(publicDir, file);
  if (fs.existsSync(fullPath)) {
    if (!sourceContent.includes(file) && !sourceContent.includes(encodeURIComponent(file))) {
      fs.renameSync(fullPath, path.join(trashDir, file));
      console.log(`Moved to trash: ${file}`);
      movedCount++;
    }
  }
});

console.log(`\nCleanup complete! Moved ${movedCount} unused images to public/trash.`);
