import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json());

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

    const basePrice = PRECIOS[tipo] * personas;
    const expectedAmount = calculateTotalWithCommission(basePrice) * 100;

    if (Math.abs(amount - expectedAmount) > 100) {
      console.warn(`[Culqi] Amount mismatch: expected ${expectedAmount}, got ${amount}`);
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

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
