// Servidor estático mínimo para os testes (simula o servidor local usado na instalação).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.wasm': 'application/wasm', '.gz': 'application/gzip', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.ogg': 'audio/ogg', '.svg': 'image/svg+xml' };

// opts.intercept(req, res) → true quando o teste quer responder (ex.: simular falha de rede)
export function serve(root, port, opts = {}) {
  const server = http.createServer(async (req, res) => {
    if (opts.intercept && opts.intercept(req, res)) return;
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch (e) { res.writeHead(404); res.end(); }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
