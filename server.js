import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { gzipSync, brotliCompressSync, constants } from 'zlib';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json());

/* ============================================================
   PORTAL ALUMNO — DB JSON simple (sin dependencias externas)
   data/db.json : { users: [], clases: [], sessions: {} }
   users: { id, nombre, email, telefono, salt, passwordHash, rol,
            paquete, sesionesTotales, fechaInicio, fechaFin, activo,
            createdAt, createdBy }
   clases: { id, userId, fecha (YYYY-MM-DD), horario, estado, createdAt }
   ============================================================ */
const DATA_DIR = join(__dirname, 'data');
const DB_PATH = join(DATA_DIR, 'db.json');

const PAQUETES = {
  paquete:   { codigo: 'paquete',   nombre: 'Pack x4 clases',  sesiones: 4,  diasValidez: 60 },
  paquete8:  { codigo: 'paquete8',  nombre: 'Pack x8 clases',  sesiones: 8,  diasValidez: 90 },
  paquete12: { codigo: 'paquete12', nombre: 'Pack x12 clases', sesiones: 12, diasValidez: 120 },
};
const HORARIOS_VALIDOS = ['6:00 am', '8:00 am', '10:00 am', '11:30 am', '2:00 pm', '4:00 pm'];

function loadDB() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DB_PATH)) {
      const fresh = { users: [], clases: [], sessions: {} };
      writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
      return fresh;
    }
    const raw = readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(raw);
    if (!Array.isArray(db.users)) db.users = [];
    if (!Array.isArray(db.clases)) db.clases = [];
    if (!db.sessions || typeof db.sessions !== 'object') db.sessions = {};
    return db;
  } catch (e) {
    console.error('[Portal] Error leyendo DB:', e.message);
    return { users: [], clases: [], sessions: {} };
  }
}
function saveDB(db) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('[Portal] Error guardando DB:', e.message);
  }
}

function hashPassword(password, salt) {
  return scryptSync(String(password), String(salt), 64).toString('hex');
}
function verifyPassword(password, salt, expectedHash) {
  try {
    const a = Buffer.from(hashPassword(password, salt), 'hex');
    const b = Buffer.from(String(expectedHash), 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}
function publicUser(u) {
  if (!u) return null;
  const { passwordHash, salt, ...pub } = u;
  return pub;
}
function userStats(db, user) {
  const programadas = db.clases.filter(
    c => c.userId === user.id && c.estado === 'programada'
  ).length;
  const restantes = Math.max(0, (user.sesionesTotales || 0) - programadas);
  return { sesionesTotales: user.sesionesTotales || 0, programadas, restantes };
}
function getToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return null;
}
function requireAuth(req, res, next) {
  const db = loadDB();
  const token = getToken(req);
  if (!token || !db.sessions[token]) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
  }
  const user = db.users.find(u => u.id === db.sessions[token]);
  if (!user || user.activo === false) {
    return res.status(401).json({ error: 'Sesión inválida.' });
  }
  req.db = db;
  req.user = user;
  next();
}
function requireAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores.' });
  }
  next();
}
function ensureAdminSeed() {
  const db = loadDB();
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pacificsurfschool.com.pe').toLowerCase().trim();
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  let admin = db.users.find(u => u.email === adminEmail);
  if (!admin) {
    const salt = randomBytes(16).toString('hex');
    admin = {
      id: 'admin_' + randomBytes(4).toString('hex'),
      nombre: 'Administrador PSS',
      email: adminEmail,
      telefono: '',
      salt,
      passwordHash: hashPassword(adminPass, salt),
      rol: 'admin',
      paquete: null,
      sesionesTotales: 0,
      fechaInicio: new Date().toISOString(),
      fechaFin: null,
      activo: true,
      createdAt: new Date().toISOString(),
      createdBy: 'seed',
    };
    db.users.push(admin);
    saveDB(db);
    console.log(`[Portal] Admin creado: ${adminEmail} (password inicial desde ADMIN_PASSWORD o 'admin123')`);
  }
}
ensureAdminSeed();

function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str || '')) return false;
  const d = new Date(str + 'T12:00:00');
  return !isNaN(d.getTime());
}
function isPastDate(str) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(str + 'T12:00:00');
  return d < today;
}

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

const PRECIOS = {
  individual: 150,
  grupal: 110,
  videoanalisis: 180,
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

    if (tipo === 'grupal') {
      const n = parseInt(personas, 10);
      if (isNaN(n) || n < 2) return res.status(400).json({ error: 'Clase grupal: mínimo 2 personas' });
      if (n > 5) return res.status(400).json({ error: 'Clase grupal: máximo 5 personas' });
    }

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
      // Si es PACK, auto-crear / extender cuenta del portal alumno
      let cuenta = null;
      if (PAQUETES[tipo]) {
        const { password } = req.body || {};
        cuenta = autoProvisionarCuenta({ nombre, email, telefono: req.body?.telefono || req.body?.wsp, tipo, passwordSugerido: password });
        console.log('[Portal] Cuenta auto-provisionada:', cuenta?.email, cuenta?.creada ? '(nueva)' : '(actualizada)');
      }
      res.json({ success: true, id: data.id, cuenta });
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

/* ================= PORTAL ALUMNO — AUTH ================= */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  const db = loadDB();
  const user = db.users.find(u => u.email === String(email).toLowerCase().trim());
  if (!user || user.activo === false) return res.status(401).json({ error: 'Credenciales inválidas.' });
  if (!verifyPassword(String(password), user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }
  const token = randomBytes(32).toString('hex');
  db.sessions[token] = user.id;
  saveDB(db);
  res.json({ success: true, token, user: publicUser(user), stats: userStats(db, user) });
});

app.post('/api/auth/logout', (req, res) => {
  const token = getToken(req);
  if (token) {
    const db = loadDB();
    delete db.sessions[token];
    saveDB(db);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ success: true, user: publicUser(req.user), stats: userStats(req.db, req.user) });
});

/* ================= PORTAL ALUMNO — MIS CLASES (semana) ================= */
app.get('/api/mis-clases', requireAuth, (req, res) => {
  const mias = req.db.clases
    .filter(c => c.userId === req.user.id && c.estado === 'programada')
    .sort((a, b) => (a.fecha + a.horario).localeCompare(b.fecha + b.horario));
  res.json({ success: true, clases: mias, stats: userStats(req.db, req.user), paqueteInfo: PAQUETES[req.user.paquete] || null });
});

app.post('/api/mis-clases', requireAuth, (req, res) => {
  const { fecha, horario } = req.body || {};
  if (!isValidDate(fecha)) return res.status(400).json({ error: 'Fecha inválida (YYYY-MM-DD).' });
  if (!HORARIOS_VALIDOS.includes(horario)) return res.status(400).json({ error: 'Horario inválido.' });
  if (isPastDate(fecha)) return res.status(400).json({ error: 'No puedes programar en fechas pasadas.' });

  const db = req.db;
  const user = req.user;

  if (!user.paquete || !PAQUETES[user.paquete]) {
    return res.status(400).json({ error: 'Tu cuenta no tiene un paquete activo (x4, x8, x12).' });
  }
  if (user.fechaFin && new Date(user.fechaFin) < new Date()) {
    return res.status(400).json({ error: 'Tu paquete venció. Contáctanos por WhatsApp.' });
  }
  const duplicada = db.clases.find(c => c.userId === user.id && c.fecha === fecha && c.estado === 'programada');
  if (duplicada) return res.status(400).json({ error: 'Ya tienes una clase programada ese día. Elige otro día.' });

  const stats = userStats(db, user);
  if (stats.restantes <= 0) {
    return res.status(400).json({ error: `Ya usaste tus ${stats.sesionesTotales} sesiones. Renueva tu paquete.` });
  }

  const nueva = {
    id: 'cl_' + randomBytes(6).toString('hex'),
    userId: user.id,
    fecha,
    horario,
    estado: 'programada',
    createdAt: new Date().toISOString(),
  };
  db.clases.push(nueva);
  saveDB(db);
  res.json({ success: true, clase: nueva, stats: userStats(db, user) });
});

app.delete('/api/mis-clases/:id', requireAuth, (req, res) => {
  const db = req.db;
  const idx = db.clases.findIndex(c => c.id === req.params.id && c.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Clase no encontrada.' });
  const c = db.clases[idx];
  if (isPastDate(c.fecha)) return res.status(400).json({ error: 'No puedes cancelar una clase pasada.' });
  db.clases[idx].estado = 'cancelada';
  saveDB(db);
  res.json({ success: true, stats: userStats(db, req.user) });
});

/* ================= PORTAL ALUMNO — EJERCICIOS EN CASA ================= */
const EJERCICIOS = [
  { id: 'pop-up', titulo: 'Pop-up (ponerse de pie)', nivel: 'Todos', icono: 'fa-person-running', descripcion: 'En el suelo, practica pasar de plancha a posición de surf en 1 segundo. 3 series de 10. Mantén rodillas flexionadas y mirada al frente.', reps: '3x10' },
  { id: 'plancha', titulo: 'Plancha abdominal', nivel: 'Principiante', icono: 'fa-fire', descripcion: 'Fortalece el core para remar y estabilizar la tabla. Mantén espalda recta, 30-60 segundos por serie.', reps: '3x45s' },
  { id: 'sentadilla', titulo: 'Sentadillas surf', nivel: 'Principiante', icono: 'fa-dumbbell', descripcion: 'Pies al ancho de hombros, baja como si fueras en la ola. Mejora piernas para el take-off y giros.', reps: '3x15' },
  { id: 'remo', titulo: 'Remo en seco (bandas)', nivel: 'Intermedio', icono: 'fa-water', descripcion: 'Con banda elástica, simula la remada alternando brazos. 2 minutos continuos. Clave para entrar a las olas sin cansarte.', reps: '3x2min' },
  { id: 'equilibrio', titulo: 'Equilibrio en bosu / cojín', nivel: 'Intermedio', icono: 'fa-scale-balanced', descripcion: 'Párate en superficie inestable 30 segundos por pierna y luego con los dos pies en postura surf.', reps: '4x30s' },
  { id: 'burpees', titulo: 'Burpees explosivos', nivel: 'Avanzado', icono: 'fa-bolt', descripcion: 'Fuerza + cardio para olas exigentes. Hazlo terminando en pop-up de surf, no en salto simple.', reps: '4x10' },
  { id: 'movilidad', titulo: 'Movilidad de hombros y cadera', nivel: 'Todos', icono: 'fa-child-reaching', descripcion: 'Círculos de hombros, aperturas de cadera y estiramiento de isquios. 10 min antes/después de cada sesión.', reps: '10 min' },
  { id: 'respiracion', titulo: 'Apnea y respiración', nivel: 'Avanzado', icono: 'fa-lungs', descripcion: 'Respiración diafragmática 4-7-8 y retenciones cómodas en seco. Nunca practiques apnea solo en agua.', reps: '5 rondas' },
];
app.get('/api/ejercicios', (req, res) => {
  res.json({ success: true, ejercicios: EJERCICIOS });
});

/* ================= ADMIN — crear / listar alumnos ================= */
app.get('/api/admin/alumnos', requireAuth, requireAdmin, (req, res) => {
  const db = req.db;
  const alumnos = db.users
    .filter(u => u.rol !== 'admin')
    .map(u => ({ ...publicUser(u), ...userStats(db, u) }))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.json({ success: true, alumnos });
});

app.post('/api/admin/alumnos', requireAuth, requireAdmin, (req, res) => {
  const { nombre, email, password, telefono, paquete } = req.body || {};
  if (!nombre || !email || !password || !paquete) {
    return res.status(400).json({ error: 'Nombre, email, contraseña y paquete son requeridos.' });
  }
  if (!PAQUETES[paquete]) return res.status(400).json({ error: 'Paquete inválido. Usa: paquete (x4), paquete8 (x8) o paquete12 (x12).' });
  if (String(password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres.' });

  const db = req.db;
  const emailNorm = String(email).toLowerCase().trim();
  if (db.users.some(u => u.email === emailNorm)) {
    return res.status(400).json({ error: 'Ya existe un alumno con ese email.' });
  }
  const pack = PAQUETES[paquete];
  const inicio = new Date();
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + pack.diasValidez);
  const salt = randomBytes(16).toString('hex');
  const nuevo = {
    id: 'alu_' + randomBytes(6).toString('hex'),
    nombre: String(nombre).trim(),
    email: emailNorm,
    telefono: String(telefono || '').trim(),
    salt,
    passwordHash: hashPassword(String(password), salt),
    rol: 'alumno',
    paquete,
    sesionesTotales: pack.sesiones,
    fechaInicio: inicio.toISOString(),
    fechaFin: fin.toISOString(),
    activo: true,
    createdAt: inicio.toISOString(),
    createdBy: 'admin:' + req.user.email,
  };
  db.users.push(nuevo);
  saveDB(db);
  res.json({ success: true, alumno: { ...publicUser(nuevo), ...userStats(db, nuevo) } });
});

app.put('/api/admin/alumnos/:id', requireAuth, requireAdmin, (req, res) => {
  const { paquete, activo, sesionesTotales } = req.body || {};
  const db = req.db;
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Alumno no encontrado.' });
  if (paquete) {
    if (!PAQUETES[paquete]) return res.status(400).json({ error: 'Paquete inválido.' });
    user.paquete = paquete;
    user.sesionesTotales = PAQUETES[paquete].sesiones;
    const inicio = new Date();
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + PAQUETES[paquete].diasValidez);
    user.fechaInicio = inicio.toISOString();
    user.fechaFin = fin.toISOString();
  }
  if (typeof sesionesTotales === 'number' && sesionesTotales >= 0 && sesionesTotales <= 50) {
    user.sesionesTotales = sesionesTotales;
  }
  if (typeof activo === 'boolean') user.activo = activo;
  saveDB(db);
  res.json({ success: true, alumno: { ...publicUser(user), ...userStats(db, user) } });
});

/* Admin: restablecer contraseña de un alumno */
app.post('/api/admin/alumnos/:id/reset-password', requireAuth, requireAdmin, (req, res) => {
  const { password } = req.body || {};
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Nueva contraseña mínima de 6 caracteres.' });
  }
  const db = req.db;
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Alumno no encontrado.' });
  const salt = randomBytes(16).toString('hex');
  user.salt = salt;
  user.passwordHash = hashPassword(String(password), salt);
  saveDB(db);
  res.json({ success: true });
});

/* Admin: agenda general de clases programadas (próximas) */
app.get('/api/admin/clases', requireAuth, requireAdmin, (req, res) => {
  const db = req.db;
  const todayISO = new Date().toISOString().slice(0, 10);
  const agenda = db.clases
    .filter(c => c.estado === 'programada' && c.fecha >= todayISO)
    .map(c => {
      const u = db.users.find(x => x.id === c.userId);
      return {
        ...c,
        alumnoNombre: u?.nombre || '(eliminado)',
        alumnoEmail: u?.email || '',
        alumnoTelefono: u?.telefono || '',
        paquete: u?.paquete || null,
      };
    })
    .sort((a, b) => (a.fecha + a.horario).localeCompare(b.fecha + b.horario))
    .slice(0, 100);
  res.json({ success: true, clases: agenda });
});

/* Auto-crear / extender cuenta cuando se compra un PACK (x4, x8, x12) */
function autoProvisionarCuenta({ nombre, email, telefono, tipo, passwordSugerido }) {
  try {
    if (!PAQUETES[tipo]) return null;
    if (!email) return null;
    const db = loadDB();
    const emailNorm = String(email).toLowerCase().trim();
    const pack = PAQUETES[tipo];
    let user = db.users.find(u => u.email === emailNorm);
    if (!user) {
      const rawPass = passwordSugerido && String(passwordSugerido).length >= 6
        ? String(passwordSugerido)
        : randomBytes(4).toString('hex');
      const salt = randomBytes(16).toString('hex');
      const inicio = new Date();
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + pack.diasValidez);
      user = {
        id: 'alu_' + randomBytes(6).toString('hex'),
        nombre: String(nombre || emailNorm).trim(),
        email: emailNorm,
        telefono: String(telefono || '').trim(),
        salt,
        passwordHash: hashPassword(rawPass, salt),
        rol: 'alumno',
        paquete: tipo,
        sesionesTotales: pack.sesiones,
        fechaInicio: inicio.toISOString(),
        fechaFin: fin.toISOString(),
        activo: true,
        createdAt: inicio.toISOString(),
        createdBy: 'compra:' + tipo,
      };
      db.users.push(user);
      saveDB(db);
      return { creada: true, email: emailNorm, passwordTemporal: rawPass };
    }
    // Ya existe: asignar/extender paquete comprado
    user.paquete = tipo;
    user.sesionesTotales = pack.sesiones;
    const inicio = new Date();
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + pack.diasValidez);
    user.fechaInicio = inicio.toISOString();
    user.fechaFin = fin.toISOString();
    user.activo = true;
    if (nombre) user.nombre = String(nombre).trim();
    if (telefono) user.telefono = String(telefono).trim();
    saveDB(db);
    // Limpia clases programadas viejas del paquete anterior para empezar de cero
    return { creada: false, email: emailNorm, actualizada: true };
  } catch (e) {
    console.error('[Portal] autoProvisionarCuenta:', e.message);
    return null;
  }
}

app.get('*', serveHTML);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
