const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'app');
const port = process.env.PORT || 8081;

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf'
  };
  return map[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  try {
    const safe = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(root, safe);
    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    // fallback to index.html for SPA routes
    const index = path.join(root, 'index.html');
    if (fs.existsSync(index)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(index).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end('Not found');
  } catch (e) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Simple server serving ${root} on http://127.0.0.1:${port}`);
});
