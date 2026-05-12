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
      
      // Replace manual card styles with dash-card if it looks like a card
      content = content.replace(/className="bg-white dark:bg-slate-900 p-6 rounded-\[32px\] border border-slate-200 dark:border-slate-800 shadow-sm/g, 'className="dash-card !p-6');
      content = content.replace(/className="bg-white dark:bg-slate-900 rounded-\[32px\] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden/g, 'className="dash-table-container');
      
      // Global removal of common dark mode classes to avoid "noir" look
      content = content.replace(/dark:bg-slate-900/g, '');
      content = content.replace(/dark:border-slate-800/g, '');
      content = content.replace(/dark:text-white/g, '');
      content = content.replace(/dark:text-slate-400/g, '');
      content = content.replace(/dark:bg-slate-800/g, '');
      content = content.replace(/dark:border-slate-700/g, '');
      
      fs.writeFileSync(fullPath, content);
    }
  });
}

walk(dashboardDir);
console.log('UI cleanup complete.');
