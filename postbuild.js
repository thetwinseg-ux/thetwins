const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const pages = ['products', 'product-detail', 'checkout', 'admin', 'setup'];

for (const page of pages) {
  const htmlFile = path.join(distDir, `${page}.html`);
  const pageDir = path.join(distDir, page);
  if (fs.existsSync(htmlFile)) {
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    fs.copyFileSync(htmlFile, path.join(pageDir, 'index.html'));
    console.log(`✓ Created clean route: /${page}/index.html`);
  }
}
console.log('Clean routes generated successfully.');
