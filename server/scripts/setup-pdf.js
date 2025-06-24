const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSETS_DIR = path.join(__dirname, '../assets');
const FONTS_DIR = path.join(ASSETS_DIR, 'fonts');
const TEMP_DIR = path.join(__dirname, '../temp');

// Create necessary directories
const directories = [ASSETS_DIR, FONTS_DIR, TEMP_DIR];
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Download Roboto fonts
const fonts = [
  {
    name: 'Roboto-Regular.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Regular.ttf',
  },
  {
    name: 'Roboto-Bold.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf',
  },
  {
    name: 'Roboto-Light.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Light.ttf',
  },
];

fonts.forEach((font) => {
  const fontPath = path.join(FONTS_DIR, font.name);
  if (!fs.existsSync(fontPath)) {
    console.log(`Downloading ${font.name}...`);
    https.get(font.url, (response) => {
      const file = fs.createWriteStream(fontPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${font.name}`);
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${font.name}:`, err);
    });
  } else {
    console.log(`${font.name} already exists`);
  }
});

// Create a placeholder logo
const logoPath = path.join(ASSETS_DIR, 'logo.png');
if (!fs.existsSync(logoPath)) {
  console.log('Please add your company logo as "logo.png" in the assets directory');
}

console.log('\nSetup complete!');
console.log('Next steps:');
console.log('1. Add your company logo as "logo.png" in the assets directory');
console.log('2. Update company information in pdfService.js');
console.log('3. Install required dependencies: npm install pdfkit date-fns'); 