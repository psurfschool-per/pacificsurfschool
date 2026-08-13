import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

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
  try {
    const { token, amount, email, tipo, personas, fecha, horario, nombre } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token de pago requerido' });
    }

    const CULQI_SECRET = process.env.CULQI_SECRET_KEY;
    if (!CULQI_SECRET) {
      return res.status(500).json({ error: 'Culqi no configurado en el servidor' });
    }

    const basePrice = PRECIOS[tipo] * personas;
    const expectedAmount = calculateTotalWithCommission(basePrice) * 100;

    if (Math.abs(amount - expectedAmount) > 100) {
      console.warn(`Amount mismatch: expected ${expectedAmount}, got ${amount}`);
    }

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

    const data = await response.json();

    if (data.object === 'charge') {
      res.json({ success: true, id: data.id });
    } else {
      console.error('Culqi error:', data);
      res.status(400).json({ error: data.user_message || 'Error al procesar el pago' });
    }
  } catch (error) {
    console.error('Culqi charge error:', error);
    res.status(500).json({ error: 'Error de conexión con Culqi' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
