const fs = require('fs');
const s = fs.readFileSync('temp_page.js', 'utf8');
const idx = s.indexOf('Geospatial');
// Find where this component starts
// Look backwards for function or const
const chunkBefore = s.substring(Math.max(0, idx - 8000), idx);
const chunkAfter = s.substring(idx, Math.min(s.length, idx + 8000));
fs.writeFileSync('extracted_globe.js', chunkBefore + '\n---SPLIT---\n' + chunkAfter);
console.log('Saved extracted_globe.js, sizes:', chunkBefore.length, chunkAfter.length);
