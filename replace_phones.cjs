const fs = require('fs');
const path = 'src/config/config.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/phone:\s*['"][0-9\s+]+['"],?/g, 'email: "contact@anantya.com",');
fs.writeFileSync(path, content);
console.log('Done');
