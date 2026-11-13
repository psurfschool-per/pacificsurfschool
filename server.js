import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { gzipSync, brotliCompressSync, constants } from 'zlib';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json());

/* ============================================================
   DASHBOARD ADMIN — DB JSON simple (sin dependencias externas)
   data/db.json : { users, clases (legacy portal), agenda, sessions }
   agenda: { id, fecha YYYY-MM-DD, hora, tipo, alumno, telefono,
             email, instructor, estado, origen, personas, notas,
             createdAt, updatedAt }
   ============================================================ */
const DATA_DIR = join(__dirname, 'data');
const DB_PATH = join(DATA_DIR, 'db.json');

const HORARIOS = ['6:00 am', '8:00 am', '10:00 am', '11:30 am', '2:00 pm', '4:00 pm'];
const TIPOS = ['grupal', 'individual', 'videoanalisis', 'paquete', 'paquete8', 'paquete12', 'libre'];
const ESTADOS = ['programada', 'confirmada', 'completada', 'cancelada', 'no-show'];
const ORIGENES = ['manual', 'whatsapp', 'web', 'instagram', 'presencial', 'otro'];

const NIVELES = ['principiante', 'basico', 'intermedio', 'avanzado'];
const PLANES_SESIONES = {
  x4: { sesiones: 4, dias: 60, nombre: 'Pack x4' },
  x8: { sesiones: 8, dias: 90, nombre: 'Pack x8' },
  x12: { sesiones: 12, dias: 120, nombre: 'Pack x12' },
};
const PLAN_MENSUAL = { dias: 30, nombre: 'Plan mensual' };
const PAQ_ESTADOS = ['activo', 'pausado', 'vencido'];

function loadDB() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DB_PATH)) {
      const fresh = { users: [], clases: [], agenda: [], alumnos: [], paquetes: [], sessions: {} };
      writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
      return fresh;
    }
    const raw = readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(raw);
    if (!Array.isArray(db.users)) db.users = [];
    if (!Array.isArray(db.clases)) db.clases = [];
    if (!Array.isArray(db.agenda)) db.agenda = [];
    if (!Array.isArray(db.alumnos)) db.alumnos = [];
    if (!Array.isArray(db.paquetes)) db.paquetes = [];
    if (!db.sessions || typeof db.sessions !== 'object') db.sessions = {};
    return db;
  } catch (e) {
    console.error('[Admin] Error leyendo DB:', e.message);
    return { users: [], clases: [], agenda: [], alumnos: [], paquetes: [], sessions: {} };
  }
}

function saveDB(db) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('[Admin] Error guardando DB:', e.message);
  }
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  try {
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function getToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return null;
}

/* Acepta token admin simple (sessions[token] === 'admin')
   o legacy (sessions[token] === userId de un admin). */
function requireAdmin(req, res, next) {
  const db = loadDB();
  const token = getToken(req);
  if (!token || !db.sessions[token]) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
  }
  const sess = db.sessions[token];
  if (sess === 'admin' || sess?.rol === 'admin') {
    req.db = db;
    req.adminToken = token;
    return next();
  }
  // Legacy: token -> userId
  const user = typeof sess === 'string' ? db.users.find((u) => u.id === sess) : null;
  if (user && user.rol === 'admin' && user.activo !== false) {
    req.db = db;
    req.adminToken = token;
    return next();
  }
  return res.status(403).json({ error: 'Solo administrador.' });
}

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

/* "8:00 am" → minutos desde medianoche (para ordenar cronológicamente) */
function horaAMinutos(h) {
  const m = String(h || '').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?$/i);
  if (!m) {
    const n = parseInt(h, 10);
    return isNaN(n) ? 9999 : n * 60;
  }
  let hh = parseInt(m[1], 10) % 12;
  const mm = parseInt(m[2] || '0', 10);
  if (/p/i.test(m[3])) hh += 12;
  return hh * 60 + mm;
}

function addDaysISO(iso, days) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayISO() {
  return addDaysISO(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    0,
  );
}

/* Resuelve lista de vinculados [{alumnoId}] → [{alumnoId, nombre, presente}] */
function resolveVinculados(db, raw, prev) {
  if (!Array.isArray(raw)) return null; // null = no tocar
  const prevMap = {};
  (prev || []).forEach((p) => { prevMap[p.alumnoId] = p; });
  const out = [];
  const seen = new Set();
  raw.forEach((r) => {
    const id = typeof r === 'string' ? r : r?.alumnoId;
    if (!id || seen.has(id)) return;
    seen.add(id);
    const alu = (db.alumnos || []).find((a) => a.id === id);
    if (!alu) return;
    const presente = typeof r?.presente === 'boolean' ? r.presente : (prevMap[id]?.presente || false);
    out.push({ alumnoId: id, nombre: alu.nombre, presente });
  });
  return out;
}

/* Uso de un paquete: asistencias presente en clases no canceladas dentro de vigencia */
function paqueteUso(db, paq) {
  const ini = paq.fechaInicio;
  const fin = paq.fechaFin || '9999-12-31';
  let usadas = 0;
  (db.agenda || []).forEach((c) => {
    if (c.estado === 'cancelada') return;
    if (c.fecha < ini || c.fecha > fin) return;
    (c.alumnos || []).forEach((a) => {
      if (a.alumnoId === paq.alumnoId && a.presente) usadas++;
    });
  });
  const restantes = paq.modelo === 'mensual' ? null : Math.max(0, (paq.sesionesTotales || 0) - usadas);
  const vencidoPorFecha = paq.fechaFin && paq.fechaFin < todayISO();
  const agotado = paq.modelo === 'sesiones' && restantes === 0 && usadas > 0;
  const estadoCalc = paq.estado === 'pausado' ? 'pausado' : (vencidoPorFecha || agotado ? 'vencido' : 'activo');
  return { usadas, restantes, estadoCalc };
}

function sanitizeAlumno(body) {
  const errors = [];
  const nombre = String(body.nombre || '').trim().slice(0, 80);
  const telefono = String(body.telefono || '').trim().slice(0, 30);
  const email = String(body.email || '').trim().slice(0, 120);
  const nivel = String(body.nivel || 'principiante').trim();
  const fechaNac = String(body.fechaNac || '').trim();
  const notas = String(body.notas || '').trim().slice(0, 500);
  const activo = body.activo === undefined ? true : body.activo === true || body.activo === 'true';

  if (nombre.length < 2) errors.push('Nombre requerido (mín. 2 caracteres).');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido.');
  if (!NIVELES.includes(nivel)) errors.push('Nivel inválido.');
  if (fechaNac && !isValidDate(fechaNac)) errors.push('Fecha de nacimiento inválida.');
  if (fechaNac && fechaNac > todayISO()) errors.push('Fecha de nacimiento futura.');
  return { errors, data: { nombre, telefono, email, nivel, fechaNac, notas, activo } };
}

function sanitizePaquete(db, body, isNew) {
  const errors = [];
  const alumnoId = String(body.alumnoId || '').trim();
  const modelo = String(body.modelo || 'sesiones').trim();
  const plan = String(body.plan || '').trim();
  const fechaInicio = String(body.fechaInicio || todayISO()).trim();
  const estado = String(body.estado || 'activo').trim();

  const alu = (db.alumnos || []).find((a) => a.id === alumnoId);
  if (!alu) errors.push('Alumno no encontrado.');
  else if (alu.activo === false) errors.push('El alumno está inactivo.');
  if (!['sesiones', 'mensual'].includes(modelo)) errors.push('Modelo inválido.');
  let planKey = plan, sesionesTotales = null, dias = 30;
  if (modelo === 'sesiones') {
    if (!PLANES_SESIONES[plan]) errors.push('Plan inválido (x4, x8, x12).');
    else { planKey = plan; sesionesTotales = PLANES_SESIONES[plan].sesiones; dias = PLANES_SESIONES[plan].dias; }
  } else {
    planKey = 'mensual';
  }
  if (!isValidDate(fechaInicio)) errors.push('Fecha de inicio inválida.');
  if (!PAQ_ESTADOS.includes(estado)) errors.push('Estado inválido.');
  const fechaFin = addDaysISO(fechaInicio, modelo === 'mensual' ? PLAN_MENSUAL.dias : dias);
  return { errors, data: { alumnoId, modelo, plan: planKey, sesionesTotales, fechaInicio, fechaFin, estado } };
}

function sanitizeAgendaInput(body) {
  const errors = [];
  const fecha = String(body.fecha || '').trim();
  const hora = String(body.hora || '').trim();
  const tipo = String(body.tipo || 'grupal').trim();
  const alumno = String(body.alumno || '').trim();
  const telefono = String(body.telefono || '').trim().slice(0, 30);
  const email = String(body.email || '').trim().slice(0, 120);
  const instructor = String(body.instructor || '').trim().slice(0, 80);
  const estado = String(body.estado || 'programada').trim();
  const origen = String(body.origen || 'manual').trim();
  const personas = body.personas == null || body.personas === '' ? 1 : parseInt(body.personas, 10);
  const notas = String(body.notas || '').trim().slice(0, 500);

  if (!isValidDate(fecha)) errors.push('Fecha inválida (YYYY-MM-DD).');
  if (!hora) errors.push('Hora requerida.');
  else if (!HORARIOS.includes(hora) && !/^(\d{1,2})(:\d{2})?\s*(am|pm)?$/i.test(hora)) {
    errors.push('Hora inválida. Ej: 8:00 am');
  }
  if (!TIPOS.includes(tipo)) errors.push('Tipo de clase inválido.');
  if (alumno.length < 2) errors.push('Nombre del alumno requerido (mín. 2 caracteres).');
  if (!ESTADOS.includes(estado)) errors.push('Estado inválido.');
  if (!ORIGENES.includes(origen)) errors.push('Origen inválido.');
  if (isNaN(personas) || personas < 1 || personas > 10) errors.push('Personas debe ser 1–10.');

  return {
    errors,
    data: { fecha, hora, tipo, alumno, telefono, email, instructor, estado, origen, personas: isNaN(personas) ? 1 : personas, notas },
  };
}

/* Mapea clases legacy del portal (users+clases) a formato agenda con origen web */
function legacyWebItems(db) {
  return (db.clases || [])
    .filter((c) => c.estado === 'programada')
    .map((c) => {
      const u = (db.users || []).find((x) => x.id === c.userId);
      return {
        id: c.id,
        fecha: c.fecha,
        hora: c.horario,
        tipo: 'grupal',
        alumno: u?.nombre || '(alumno web)',
        telefono: u?.telefono || '',
        email: u?.email || '',
        instructor: '',
        estado: 'programada',
        origen: 'web',
        personas: 1,
        notas: '',
        createdAt: c.createdAt,
        updatedAt: c.createdAt,
        _readonly: true,
      };
    });
}

/* ================= RESERVA WEB PÚBLICA → cae directo a la agenda =================
   El modal de la web (app.js) envía aquí cada confirmación.
   Se guarda en `agenda` con origen 'web' y estado 'programada',
   así aparece al instante en el calendario del admin. */
const RESERVA_TIPOS = ['grupal', 'individual', 'videoanalisis'];
app.post('/api/reservas', (req, res) => {
  const b = req.body || {};
  const tipo = String(b.tipo || '').trim();
  const fecha = String(b.fecha || '').trim(); // YYYY-MM-DD
  const horario = String(b.horario || b.hora || '').trim();
  const nombre = String(b.nombre || '').trim();
  const wsp = String(b.wsp || b.telefono || '').trim();
  const email = String(b.email || '').trim();
  const personas = b.personas == null || b.personas === '' ? 1 : parseInt(b.personas, 10);

  if (!RESERVA_TIPOS.includes(tipo)) return res.status(400).json({ error: 'Tipo de clase inválido.' });
  if (!isValidDate(fecha)) return res.status(400).json({ error: 'Fecha inválida.' });
  if (isPastDate(fecha)) return res.status(400).json({ error: 'No se puede reservar en fecha pasada.' });
  if (!horario) return res.status(400).json({ error: 'Horario requerido.' });
  if (nombre.length < 2) return res.status(400).json({ error: 'Nombre requerido.' });
  if (!/^[\d\s+\-]{7,15}$/.test(wsp)) return res.status(400).json({ error: 'WhatsApp inválido.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Correo inválido.' });
  const nPers = isNaN(personas) ? 1 : personas;
  if (nPers < 1 || nPers > 5) return res.status(400).json({ error: 'Personas 1–5.' });

  const db = loadDB();
  // Anti-duplicado simple: mismo email + fecha + horario activo
  const emailNorm = email.toLowerCase();
  const dup = (db.agenda || []).find((x) =>
    x.origen === 'web' && x.estado !== 'cancelada' &&
    String(x.email || '').toLowerCase() === emailNorm &&
    x.fecha === fecha && x.hora === horario,
  );
  if (dup) return res.status(409).json({ error: 'Ya tienes una reserva web en esa fecha y horario.', clase: dup });

  const notasParts = [];
  if (b.experiencia) notasParts.push(`Exp: ${b.experiencia}`);
  if (b.nivel) notasParts.push(`Nivel: ${b.nivel}`);
  if (b.pago) notasParts.push(`Pago: ${b.pago}`);
  if (b.peso) notasParts.push(`Peso: ${b.peso}kg`);
  if (b.altura) notasParts.push(`Altura: ${b.altura}cm`);
  if (typeof b.total !== 'undefined') notasParts.push(`Total: S/ ${b.total}`);
  if (b.notas) notasParts.push(String(b.notas).slice(0, 300));

  const now = new Date().toISOString();
  const item = {
    id: 'ag_' + randomBytes(6).toString('hex'),
    fecha,
    hora: horario,
    tipo,
    alumno: nombre.slice(0, 80),
    telefono: wsp.slice(0, 30),
    email: email.slice(0, 120),
    instructor: '',
    estado: 'programada',
    origen: 'web',
    personas: nPers,
    notas: notasParts.join(' · ').slice(0, 500),
    createdAt: now,
    updatedAt: now,
  };
  db.agenda.push(item);
  saveDB(db);
  res.json({ success: true, clase: item });
});

/* ================= ADMIN — AUTH (clave simple compartida) ================= */
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!password || !safeEqual(String(password), getAdminPassword())) {
    return res.status(401).json({ error: 'Clave incorrecta.' });
  }
  const db = loadDB();
  const token = randomBytes(32).toString('hex');
  db.sessions[token] = 'admin';
  saveDB(db);
  res.json({ success: true, token });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ success: true, rol: 'admin' });
});

app.post('/api/admin/logout', (req, res) => {
  const token = getToken(req);
  if (token) {
    const db = loadDB();
    delete db.sessions[token];
    saveDB(db);
  }
  res.json({ success: true });
});

/* ================= ADMIN — AGENDA CRUD ================= */
app.get('/api/admin/agenda', requireAdmin, (req, res) => {
  const db = req.db;
  const { from, to, q, estado, tipo, origen, alumnoId } = req.query || {};
  let items = [...(db.agenda || []), ...legacyWebItems(db)];
  if (!Array.isArray(items[0]?.alumnos)) items = items.map((i) => ({ ...i, alumnos: Array.isArray(i.alumnos) ? i.alumnos : [] }));

  if (from && isValidDate(String(from))) items = items.filter((i) => i.fecha >= String(from));
  if (to && isValidDate(String(to))) items = items.filter((i) => i.fecha <= String(to));
  if (estado) items = items.filter((i) => i.estado === String(estado));
  if (tipo) items = items.filter((i) => i.tipo === String(tipo));
  if (origen) items = items.filter((i) => i.origen === String(origen));
  if (alumnoId) items = items.filter((i) => (i.alumnos || []).some((a) => a.alumnoId === String(alumnoId)));
  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter((i) =>
      (i.alumno || '').toLowerCase().includes(needle) ||
      (i.telefono || '').toLowerCase().includes(needle) ||
      (i.notas || '').toLowerCase().includes(needle) ||
      (i.alumnos || []).some((a) => (a.nombre || '').toLowerCase().includes(needle)),
    );
  }

  /* Orden cronológico: por fecha y luego por hora real (6am → 8am → 10am …) */
  items.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
    return horaAMinutos(a.hora) - horaAMinutos(b.hora);
  });
  if (items.length > 500) items = items.slice(0, 500);
  res.json({ success: true, clases: items, total: items.length });
});

app.post('/api/admin/agenda', requireAdmin, (req, res) => {
  const { errors, data } = sanitizeAgendaInput(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  const db = req.db;
  const vinculados = resolveVinculados(db, req.body?.alumnos, []) || [];
  const now = new Date().toISOString();
  const item = {
    id: 'ag_' + randomBytes(6).toString('hex'),
    ...data,
    alumnos: vinculados,
    createdAt: now,
    updatedAt: now,
  };
  db.agenda.push(item);
  saveDB(db);
  res.json({ success: true, clase: item });
});

app.put('/api/admin/agenda/:id', requireAdmin, (req, res) => {
  const db = req.db;
  const item = (db.agenda || []).find((x) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Clase no encontrada (las reservas web son solo lectura).' });
  const { errors, data } = sanitizeAgendaInput({ ...item, ...(req.body || {}) });
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  Object.assign(item, data, { updatedAt: new Date().toISOString() });
  const vinc = resolveVinculados(db, req.body?.alumnos, item.alumnos);
  if (vinc) item.alumnos = vinc;
  /* Asistencia auto al completar: vinculados sin marca explícita cuentan como presentes */
  if (data.estado === 'completada') {
    const explicitFalse = new Set(
      (Array.isArray(req.body?.alumnos) ? req.body.alumnos : [])
        .filter((a) => a && a.presente === false)
        .map((a) => a.alumnoId),
    );
    item.alumnos = (item.alumnos || []).map((a) =>
      explicitFalse.has(a.alumnoId) ? a : { ...a, presente: true },
    );
  }
  saveDB(db);
  res.json({ success: true, clase: item });
});

app.delete('/api/admin/agenda/:id', requireAdmin, (req, res) => {
  const db = req.db;
  const idx = (db.agenda || []).findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Clase no encontrada.' });
  db.agenda.splice(idx, 1);
  saveDB(db);
  res.json({ success: true });
});

/* ================= ADMIN — ALUMNOS ================= */
app.get('/api/admin/alumnos', requireAdmin, (req, res) => {
  const db = req.db;
  const { q, soloActivos } = req.query || {};
  let list = [...(db.alumnos || [])];
  if (soloActivos === '1') list = list.filter((a) => a.activo !== false);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((a) =>
      (a.nombre || '').toLowerCase().includes(needle) ||
      (a.telefono || '').toLowerCase().includes(needle) ||
      (a.email || '').toLowerCase().includes(needle),
    );
  }
  list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
  const paquetes = db.paquetes || [];
  const out = list.map((a) => {
    const paqs = paquetes
      .filter((p) => p.alumnoId === a.id)
      .map((p) => ({ ...p, ...paqueteUso(db, p) }))
      .sort((x, y) => (y.fechaInicio || '').localeCompare(x.fechaInicio || ''));
    return { ...a, paquetes: paqs, paqueteActivo: paqs.find((p) => p.estadoCalc === 'activo') || null };
  });
  res.json({ success: true, alumnos: out, total: out.length });
});

app.post('/api/admin/alumnos', requireAdmin, (req, res) => {
  const { errors, data } = sanitizeAlumno(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  const db = req.db;
  const now = new Date().toISOString();
  const alu = { id: 'al_' + randomBytes(6).toString('hex'), ...data, createdAt: now, updatedAt: now };
  db.alumnos.push(alu);
  saveDB(db);
  res.json({ success: true, alumno: alu });
});

app.put('/api/admin/alumnos/:id', requireAdmin, (req, res) => {
  const db = req.db;
  const alu = (db.alumnos || []).find((a) => a.id === req.params.id);
  if (!alu) return res.status(404).json({ error: 'Alumno no encontrado.' });
  const { errors, data } = sanitizeAlumno({ ...alu, ...(req.body || {}) });
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  Object.assign(alu, data, { updatedAt: new Date().toISOString() });
  saveDB(db);
  res.json({ success: true, alumno: alu });
});

app.delete('/api/admin/alumnos/:id', requireAdmin, (req, res) => {
  const db = req.db;
  const alu = (db.alumnos || []).find((a) => a.id === req.params.id);
  if (!alu) return res.status(404).json({ error: 'Alumno no encontrado.' });
  alu.activo = false; // baja lógica: se conserva historial y paquetes
  alu.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true });
});

/* ================= ADMIN — PAQUETES ================= */
app.get('/api/admin/paquetes', requireAdmin, (req, res) => {
  const db = req.db;
  const { alumnoId } = req.query || {};
  let list = [...(db.paquetes || [])];
  if (alumnoId) list = list.filter((p) => p.alumnoId === String(alumnoId));
  const out = list
    .map((p) => {
      const alu = (db.alumnos || []).find((a) => a.id === p.alumnoId);
      return { ...p, alumnoNombre: alu?.nombre || '(eliminado)', ...paqueteUso(db, p) };
    })
    .sort((a, b) => (b.fechaInicio || '').localeCompare(a.fechaInicio || ''));
  res.json({ success: true, paquetes: out, total: out.length });
});

app.post('/api/admin/paquetes', requireAdmin, (req, res) => {
  const db = req.db;
  const { errors, data } = sanitizePaquete(db, req.body || {}, true);
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  const now = new Date().toISOString();
  const paq = { id: 'pq_' + randomBytes(6).toString('hex'), ...data, createdAt: now, updatedAt: now };
  db.paquetes.push(paq);
  saveDB(db);
  res.json({ success: true, paquete: { ...paq, ...paqueteUso(db, paq) } });
});

app.put('/api/admin/paquetes/:id', requireAdmin, (req, res) => {
  const db = req.db;
  const paq = (db.paquetes || []).find((p) => p.id === req.params.id);
  if (!paq) return res.status(404).json({ error: 'Paquete no encontrado.' });
  const merged = { ...paq, ...(req.body || {}) };
  // Si cambia modelo/plan/inicio, recalcular sesiones y fin
  if (req.body?.modelo || req.body?.plan || req.body?.fechaInicio) {
    const { errors, data } = sanitizePaquete(db, { ...merged, estado: merged.estado }, false);
    if (errors.length) return res.status(400).json({ error: errors[0], errors });
    Object.assign(paq, data);
  }
  if (req.body?.estado) {
    if (!PAQ_ESTADOS.includes(req.body.estado)) return res.status(400).json({ error: 'Estado inválido.' });
    paq.estado = req.body.estado;
  }
  paq.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, paquete: { ...paq, ...paqueteUso(db, paq) } });
});

/* Meta: horarios y catálogos para el frontend */
app.get('/api/admin/meta', requireAdmin, (req, res) => {
  res.json({
    success: true,
    horarios: HORARIOS,
    tipos: TIPOS,
    estados: ESTADOS,
    origenes: ORIGENES,
    niveles: NIVELES,
    planesSesiones: PLANES_SESIONES,
    planMensual: PLAN_MENSUAL,
  });
});

/* ===== CACHE HTML IN MEMORY (index + admin, tolerante si falta dist) ===== */
function loadCachedHTML(name) {
  const distPath = join(__dirname, 'dist', name);
  const rootPath = join(__dirname, name);
  const p = existsSync(distPath) ? distPath : rootPath;
  if (!existsSync(p)) return null;
  try {
    const buf = readFileSync(p);
    return {
      buf,
      gzip: gzipSync(buf, { level: 9 }),
      brotli: brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }),
      etag: createHash('md5').update(buf).digest('hex'),
    };
  } catch {
    return null;
  }
}

const HTML_INDEX = loadCachedHTML('index.html');
const HTML_ADMIN = loadCachedHTML('mvba.html');

/* ===== CACHE STRATEGY ===== */
/* Hashed assets (JS, CSS, images in /assets/) → 1 year immutable */
const DIST_DIR = existsSync(join(__dirname, 'dist')) ? join(__dirname, 'dist') : __dirname;
app.use('/assets', express.static(join(DIST_DIR, 'assets'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    if (/\.\w{8}\.\w+$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

/* Public images (img/) → 30 days */
app.use('/img', express.static(join(DIST_DIR, 'img'), {
  maxAge: '30d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
}));

/* Everything else in dist → no cache (HTML, etc.) */
app.use(express.static(DIST_DIR, {
  maxAge: 0,
  setHeaders: (res, path) => {
    if (path.endsWith('.html') || path.endsWith('/')) {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }
}));

/* ===== CACHED HTML SERVE (bypass disk, serve from memory) ===== */
function serveCached(cached) {
  return (req, res, next) => {
    if (!cached) return next();
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (req.headers['if-none-match'] === cached.etag) {
      return res.status(304).end();
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('ETag', cached.etag);
    res.setHeader('Vary', 'Accept-Encoding');
    if (acceptEncoding.includes('br')) {
      res.setHeader('Content-Encoding', 'br');
      res.setHeader('Content-Length', cached.brotli.length);
      res.end(cached.brotli);
    } else if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', cached.gzip.length);
      res.end(cached.gzip);
    } else {
      res.setHeader('Content-Length', cached.buf.length);
      res.end(cached.buf);
    }
  };
}

app.get('/mvba', serveCached(HTML_ADMIN));
app.get('/mvba.html', serveCached(HTML_ADMIN));
app.get('*', serveCached(HTML_INDEX));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
