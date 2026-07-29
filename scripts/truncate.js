const fs = require('fs');
const filePath = './src/components/SuperServicesView.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
// Keep only up to line 966 (index 965)
const truncated = lines.slice(0, 966).join('\n');
fs.writeFileSync(filePath, truncated, 'utf8');
console.log('Done. Kept ' + lines.slice(0, 966).length + ' lines, removed ' + (lines.length - 966) + ' trailing lines.');
