const { exec } = require('child_process');
const path = require('path');

// Dynamically require ffmpeg-static binary path
let ffmpeg;
try {
  ffmpeg = require('ffmpeg-static');
} catch (e) {
  console.error("Error: 'ffmpeg-static' is not installed. Please run 'npm install ffmpeg-static' first.");
  process.exit(1);
}

const inputPath = path.join(__dirname, '..', 'assets', 'demo.mp4');
const outputPath = path.join(__dirname, '..', 'assets', 'demo.gif');

console.log(`Starting conversion:\nInput: ${inputPath}\nOutput: ${outputPath}\n`);

// Highly optimized palette-based GIF conversion command
const cmd = `"${ffmpeg}" -y -i "${inputPath}" -vf "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse" -loop 0 "${outputPath}"`;

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error('Error during conversion:', err);
    process.exit(1);
  }
  console.log('GIF conversion completed successfully! Output saved to assets/demo.gif');
});
