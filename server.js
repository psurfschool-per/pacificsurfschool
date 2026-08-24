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

/* ===== SECURITY HEADERS ===== */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

/* ===== CACHE HTML IN MEMORY ===== */
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

const PRECIOS = {
  individual: 150,
  grupal: 110,
  paquete: 400,
  paquete8: 720,
  paquete12: 1020
};

const CULQI_COMMISSION_RATE = 0.0344;
const CULQI_FIXED_FEE = 0.77;

function calculateTotalWithCommission(basePrice) {
  return Math.ceil((basePrice + CULQI_FIXED_FEE) / (1 - CULQI_COMMISSION_RATE));
}

/* ===== CULQI — CARGO ÚNICO ===== */
app.post('/api/culqi-charge', async (req, res) => {
  console.log('[Culqi] Nuevo request de pago recibido');

  try {
    const { token, amount, email, tipo, personas, fecha, horario, nombre } = req.body;

    if (!token) {
      console.error('[Culqi] Error: Token no proporcionado');
      return res.status(400).json({ error: 'Token de pago requerido' });
    }

    const CULQI_SECRET = process.env.CULQI_SECRET_KEY;
    if (!CULQI_SECRET) {
      console.error('[Culqi] Error: CULQI_SECRET_KEY no configurada');
      return res.status(500).json({ error: 'Culqi no configurado en el servidor. Contacta al administrador.' });
    }

    if (CULQI_SECRET === 'sk_test_TU_CLAVE_SECRETA_AQUI') {
      console.error('[Culqi] Error: CULQI_SECRET_KEY tiene el valor por defecto');
      return res.status(500).json({ error: 'Culqi no está configurado correctamente. Contacta al administrador.' });
    }

    console.log('[Culqi] Datos recibidos:', { tipo, personas, fecha, horario, nombre, email, amount });

    /* ===== INPUT VALIDATION ===== */
    const allowedTypes = ['individual', 'grupal', 'paquete', 'paquete8', 'paquete12'];
    if (!allowedTypes.includes(tipo)) return res.status(400).json({ error: 'Tipo de clase inválido' });
    if (typeof nombre !== 'string' || nombre.length < 2 || nombre.length > 100) return res.status(400).json({ error: 'Nombre inválido' });
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Email inválido' });
    if (!Number.isFinite(amount) || amount < 100) return res.status(400).json({ error: 'Monto inválido' });

    const basePrice = PRECIOS[tipo] * personas;
    const expectedAmount = calculateTotalWithCommission(basePrice) * 100;

    if (Math.abs(amount - expectedAmount) > 100) {
      return res.status(400).json({ error: 'Monto inválido. Actualiza e intenta de nuevo.' });
    }

    console.log('[Culqi] Enviando cargo a Culqi API...');

    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CULQI_SECRET}`
      },
      body: JSON.stringify({
        amount,
        currency_code: 'PEN',
        email,
        source_id: token,
        description: `Pacific Surf School - ${tipo} - ${fecha} ${horario}`,
        metadata: {
          tipo,
          personas: String(personas),
          fecha,
          horario,
          nombre
        }
      })
    });

    console.log('[Culqi] Respuesta de Culqi API:', response.status);

    const data = await response.json();
    console.log('[Culqi] Datos de Culqi:', JSON.stringify(data).substring(0, 200));

    if (data.object === 'charge') {
      console.log('[Culqi] Pago exitoso! ID:', data.id);
      res.json({ success: true, id: data.id });
    } else {
      console.error('[Culqi] Cargo fallido:', data);
      const errorMsg = data.user_message || data.merchant_message || 'Error al procesar el pago';
      res.status(400).json({ error: errorMsg });
    }
  } catch (error) {
    console.error('[Culqi] Excepción:', error.message);
    res.status(500).json({ error: 'Error de conexión con Culqi. Intenta de nuevo.' });
  }
});

app.get('*', serveHTML);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
