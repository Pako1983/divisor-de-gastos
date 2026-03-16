const fs=require('fs');
const text=fs.readFileSync('frontend/src/js/pages/group-detail.js','utf8');
const idx=text.indexOf('const imageExtensions');
console.log(text.slice(idx,idx+80));
