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
      
      // Remove clashing gray borders
      content = content.replace(/border border-slate-200/g, '');
      content = content.replace(/border border-slate-100/g, 'border border-blue-50');
      
      // Replace gray backgrounds with light blue tint
      content = content.replace(/bg-slate-100/g, 'bg-blue-50/50');
      content = content.replace(/bg-slate-50/g, 'bg-white border-blue-100 shadow-sm');
      
      // Specific fix for AppointmentForm and ConsultationForm
      content = content.replace(/className="bg-slate-900 text-white/g, 'className="bg-blue-600 text-white');
      
      fs.writeFileSync(fullPath, content);
    }
  });
}

walk(dashboardDir);
console.log('Form UI robust cleanup complete.');
