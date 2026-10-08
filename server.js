import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { gzipSync, brotliCompressSync, constants } from 'zlib';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json());

/* ===== CACHE HTML IN MEMORY (avoid disk read per request) ===== */
const HTML_PATH = join(__dirname, 'dist', 'index.html');
const HTML_BUFFER = readFileSync(HTML_PATH);
const HTML_GZIP = gzipSync(HTML_BUFFER, { level: 9 });
const HTML_BROTLI = brotliCompressSync(HTML_BUFFER, {
  params: { [constants.BROTLI_PARAM_QUALITY]: 11 }
});
const HTML_ETAG = createHash('md5').update(HTML_BUFFER).digest('hex');

/* ===== CACHE STRATEGY ===== */
/* Hashed assets (JS, CSS, images in /assets/) → 1 year immutable */
app.use('/assets', express.static(join(__dirname, 'dist', 'assets'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    if (/\.\w{8}\.\w+$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

/* Public images (img/) → 30 days */
app.use('/img', express.static(join(__dirname, 'dist', 'img'), {
  maxAge: '30d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
}));

/* Everything else in dist → no cache (HTML, etc.) */
app.use(express.static(join(__dirname, 'dist'), {
  maxAge: 0,
  setHeaders: (res, path) => {
    if (path.endsWith('.html') || path.endsWith('/')) {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }
}));

/* ===== CACHED HTML SERVE (bypass disk, serve from memory) ===== */
function serveHTML(req, res) {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  /* ETag: if client has cached version, return 304 */
  if (req.headers['if-none-match'] === HTML_ETAG) {
    return res.status(304).end();
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('ETag', HTML_ETAG);
  res.setHeader('Vary', 'Accept-Encoding');

  if (acceptEncoding.includes('br')) {
    res.setHeader('Content-Encoding', 'br');
    res.setHeader('Content-Length', HTML_BROTLI.length);
    res.end(HTML_BROTLI);
  } else if (acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Length', HTML_GZIP.length);
    res.end(HTML_GZIP);
  } else {
    res.setHeader('Content-Length', HTML_BUFFER.length);
    res.end(HTML_BUFFER);
  }
}

app.get('*', serveHTML);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
