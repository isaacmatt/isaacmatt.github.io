const fs = require('fs');
const http = require('http');
const path = require('path');

const buildRoot = path.resolve(__dirname, '..', 'build');
const basePath = '/eternal-infinite-void';
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(error.message);
      return;
    }

    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    res.end(data);
  });
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${host}:${port}`);

  if (url.pathname === '/') {
    res.writeHead(302, { Location: `${basePath}/` });
    res.end();
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || '/';
  }

  let filePath = path.normalize(path.join(buildRoot, pathname));
  if (!filePath.startsWith(buildRoot)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(buildRoot, 'index.html');
  }

  sendFile(res, filePath);
});

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}${basePath}/`);
});
