import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

export async function serveProduction(port = 5184) {
  const root = resolve('dist');
  const cache = new Map();
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm' };
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
      try { if (!(await stat(file)).isFile()) throw Error(); }
      catch { res.writeHead(404).end('Not found'); return; }
      const extension = extname(file);
      let body = extension === '.html' ? await readFile(file) : cache.get(file);
      if (!body) { body = await readFile(file); cache.set(file, body); }
      const hashed = /\/assets\/[^/]+-[\w-]{8,}\.[a-z0-9]+$/i.test(pathname);
      const headers = {
        'Content-Type': types[extension] || 'application/octet-stream',
        'Cache-Control': extension === '.html' ? 'public, max-age=0, must-revalidate' : hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
        'Vary': 'Accept-Encoding', 'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      };
      if (/\.(html|js|css|svg|json)$/.test(file)) {
        const encoding = /\bbr\b/.test(req.headers['accept-encoding'] || '') ? 'br' : /\bgzip\b/.test(req.headers['accept-encoding'] || '') ? 'gzip' : undefined;
        if (encoding) {
          const key = `${file}:${encoding}`;
          let compressed = extension === '.html' ? undefined : cache.get(key);
          if (!compressed) compressed = encoding === 'br' ? brotliCompressSync(body) : gzipSync(body);
          if (extension !== '.html') cache.set(key, compressed);
          body = compressed; headers['Content-Encoding'] = encoding;
        }
      }
      let status = 200;
      if (/\.(mp4|webm)$/.test(file)) {
        headers['Accept-Ranges'] = 'bytes';
        if (req.headers.range) {
          const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
          const length = body.length;
          const start = range?.[1] ? Number(range[1]) : range?.[2] ? Math.max(0, length - Number(range[2])) : 0;
          const end = range?.[1] && range[2] ? Math.min(Number(range[2]), length - 1) : length - 1;
          if (!range || start > end || start >= length) { res.writeHead(416, { 'Content-Range': `bytes */${length}` }).end(); return; }
          headers['Content-Range'] = `bytes ${start}-${end}/${length}`;
          body = body.subarray(start, end + 1); status = 206;
        }
      }
      headers['Content-Length'] = body.length;
      res.writeHead(status, headers).end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(500).end('Server error'); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const port = Number(process.env.PORT || 5184);
  await serveProduction(port);
  console.log(`Production preview: http://127.0.0.1:${port}`);
}
