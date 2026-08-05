import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const PRECIOS = {
  individual: 150,
  grupal: 110,
  paquete: 400,
  paquete8: 720,
  paquete12: 1020
};

app.post('/api/create-preference', async (req, res) => {
  try {
    const { tipo, personas, nombre, horario, fecha } = req.body;

    const precioUnit = PRECIOS[tipo];
    if (!precioUnit) {
      return res.status(400).json({ error: 'Tipo de clase inválido' });
    }

    const numPersonas = parseInt(personas) || 1;
    const total = precioUnit * numPersonas;

    const nombres = {
      individual: 'Clase Individual',
      grupal: 'Clase Grupal',
      paquete: 'Pack x4 Clases',
      paquete8: 'Pack x8 Clases',
      paquete12: 'Pack x12 Clases'
    };

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: tipo,
            title: `${nombres[tipo]} — ${fecha} ${horario}`,
            quantity: numPersonas,
            unit_price: precioUnit,
            currency_id: 'PEN'
          }
        ],
        payer: {
          name: nombre
        },
        metadata: {
          tipo,
          personas: String(numPersonas),
          fecha,
          horario
        },
        back_urls: {
          success: `${req.headers.origin || 'https://pacificsurfschool.com.pe'}/?pago=exitoso`,
          failure: `${req.headers.origin || 'https://pacificsurfschool.com.pe'}/?pago=fallo`,
          pending: `${req.headers.origin || 'https://pacificsurfschool.com.pe'}/?pago=pendiente`
        },
        auto_return: 'approved'
      }
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
