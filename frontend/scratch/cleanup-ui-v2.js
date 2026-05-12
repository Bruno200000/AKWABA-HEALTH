import fs from 'fs';
import path from 'path';

const dashboardDir = 'c:\\Users\\BRUNO\\Desktop\\AKWABA HEALTH\\frontend\\src\\app\\(dashboard)\\dashboard';

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Global removal of ALL dark mode classes
      content = content.replace(/dark:[a-z0-9\/\-\[\]:]+/gi, '');
      
      // Fix potential double spaces or leading spaces left behind
      content = content.replace(/className=" /g, 'className="');
      content = content.replace(/  +/g, ' ');
      
      fs.writeFileSync(fullPath, content);
    }
  });
}

walk(dashboardDir);
console.log('UI cleanup (v2) complete.');
