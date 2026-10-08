/* Admin Calendario — Pacific Surf School (vanilla, sin dependencias) */
const $ = (id) => document.getElementById(id);
const TOKEN_KEY = 'pss_admin_token';
const HORARIOS_FALLBACK = ['6:00 am', '8:00 am', '10:00 am', '11:30 am', '2:00 pm', '4:00 pm'];

const state = {
  token: localStorage.getItem(TOKEN_KEY) || null,
  clases: [],
  horarios: [...HORARIOS_FALLBACK],
  view: 'mes', // 'mes' | 'semana'
  cursor: new Date(), // mes visible / semana visible
  selectedDate: toISO(new Date()),
  editingId: null,
  filters: { q: '', estado: '', tipo: '', origen: '' },
};

const TIPO_LABEL = { grupal: 'Grupal', individual: 'Privada', videoanalisis: 'Video análisis', paquete: 'Pack', paquete8: 'Pack x8', paquete12: 'Pack x12', libre: 'Libre' };
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseISO(iso) {
  return new Date(iso + 'T12:00:00');
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function authHeaders() {
  return state.token
    ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + state.token }
    : { 'Content-Type': 'application/json' };
}
function waLink(tel, nombre) {
  const digits = String(tel || '').replace(/\D/g, '');
  if (!digits) return null;
  const text = encodeURIComponent(`Hola ${nombre || ''}, te escribo de Pacific Surf School sobre tu clase 🏄`);
  return `https://wa.me/${digits}?text=${text}`;
}

/* ---------- AUTH ---------- */
async function login(e) {
  e.preventDefault();
  const btn = $('btnLogin');
  btn.disabled = true;
  $('loginError').hidden = true;
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: $('loginPass').value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo entrar');
    state.token = data.token;
    localStorage.setItem(TOKEN_KEY, data.token);
    $('loginPass').value = '';
    await boot();
  } catch (err) {
    const box = $('loginError');
    box.hidden = false;
    box.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

function logout() {
  if (state.token) fetch('/api/admin/logout', { method: 'POST', headers: authHeaders() }).catch(() => {});
  state.token = null;
  localStorage.removeItem(TOKEN_KEY);
  renderAuth();
}

async function boot() {
  if (!state.token) return renderAuth();
  try {
    const me = await fetch('/api/admin/me', { headers: authHeaders() }).then((r) => r.json());
    if (!me.success) throw new Error('sesión inválida');
    try {
      const meta = await fetch('/api/admin/meta', { headers: authHeaders() }).then((r) => r.json());
      if (meta.success && Array.isArray(meta.horarios) && meta.horarios.length) {
        state.horarios = meta.horarios;
        syncHoraOptions();
      }
    } catch { /* meta opcional */ }
    renderAuth();
    await loadAgenda();
  } catch {
    state.token = null;
    localStorage.removeItem(TOKEN_KEY);
    renderAuth();
  }
}

function renderAuth() {
  const logged = !!state.token;
  $('viewLogin').hidden = logged;
  $('viewApp').hidden = !logged;
  $('btnLogout').hidden = !logged;
}

/* ---------- DATA ---------- */
function rangeForView() {
  if (state.view === 'mes') {
    const y = state.cursor.getFullYear();
    const m = state.cursor.getMonth();
    const first = new Date(y, m, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7) - 1); // margen
    const end = new Date(y, m + 1, 0);
    end.setDate(end.getDate() + 14);
    return { from: toISO(start), to: toISO(end) };
  }
  const mon = mondayOf(state.cursor);
  const start = new Date(mon);
  start.setDate(mon.getDate() - 1);
  const end = new Date(mon);
  end.setDate(mon.getDate() + 8);
  return { from: toISO(start), to: toISO(end) };
}

function mondayOf(d) {
  const day = (d.getDay() + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - day);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

async function loadAgenda() {
  const { from, to } = rangeForView();
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`/api/admin/agenda?${params}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) { logout(); return; }
    throw new Error(data.error || 'No se pudo cargar la agenda');
  }
  state.clases = data.clases || [];
  renderAll();
}

function filtered() {
  const { q, estado, tipo, origen } = state.filters;
  const needle = q.trim().toLowerCase();
  return state.clases.filter((c) => {
    if (estado && c.estado !== estado) return false;
    if (tipo && c.tipo !== tipo) return false;
    if (origen === 'web' && c.origen !== 'web') return false;
    if (origen === 'mias' && c.origen === 'web') return false;
    if (needle && !((c.alumno || '').toLowerCase().includes(needle) || (c.telefono || '').toLowerCase().includes(needle) || (c.notas || '').toLowerCase().includes(needle))) return false;
    return true;
  });
}

function isOverdue(c, todayISO) {
  return c.fecha < (todayISO || toISO(new Date())) && (c.estado === 'programada' || c.estado === 'confirmada');
}

/* Toast de confirmación (no bloquea) */
let toastT;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.classList.remove('show'); el.hidden = true; }, 2600);
}

function byFecha(iso) {
  return filtered().filter((c) => c.fecha === iso && c.estado !== 'cancelada').sort(compararClases);
}
function byFechaAll(iso) {
  return filtered().filter((c) => c.fecha === iso).sort(compararClases);
}

/* Orden cronológico real: 6:00 am → 8:00 am → 10:00 am → 11:30 am → 2:00 pm → 4:00 pm */
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
function compararClases(a, b) {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
  return horaAMinutos(a.hora) - horaAMinutos(b.hora);
}

/* ---------- RENDER ---------- */
function renderAll() {
  renderStats();
  renderTitle();
  if (state.view === 'mes') { $('calMes').hidden = false; $('calSemana').hidden = true; renderMes(); }
  else { $('calMes').hidden = true; $('calSemana').hidden = false; renderSemana(); }
  renderDay();
  renderUpcoming();
  $('viewMes').classList.toggle('active', state.view === 'mes');
  $('viewSemana').classList.toggle('active', state.view === 'semana');
  $('viewMes').setAttribute('aria-selected', state.view === 'mes' ? 'true' : 'false');
  $('viewSemana').setAttribute('aria-selected', state.view === 'semana' ? 'true' : 'false');
}

function renderStats() {
  const today = toISO(new Date());
  const man = toISO(new Date(Date.now() + 86400000));
  const in7 = toISO(new Date(Date.now() + 7 * 86400000));
  const act = (c) => c.estado === 'programada' || c.estado === 'confirmada';
  $('stHoy').textContent = state.clases.filter((c) => c.fecha === today && act(c)).length;
  $('stManana').textContent = state.clases.filter((c) => c.fecha === man && act(c)).length;
  $('stSemana').textContent = state.clases.filter((c) => c.fecha >= today && c.fecha <= in7 && act(c)).length;
  $('stPend').textContent = state.clases.filter((c) => c.estado === 'programada' && c.fecha >= today).length;
}

function renderTitle() {
  if (state.view === 'mes') {
    $('calTitle').textContent = `${MESES[state.cursor.getMonth()]} ${state.cursor.getFullYear()}`;
  } else {
    const mon = mondayOf(state.cursor);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    $('calTitle').textContent = `${fmt(mon)} – ${fmt(sun)}`;
  }
}

function renderMes() {
  const grid = $('mesGrid');
  grid.innerHTML = '';
  const y = state.cursor.getFullYear();
  const m = state.cursor.getMonth();
  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7; // Lun=0
  const start = new Date(y, m, 1 - startOffset);
  const todayISO = toISO(new Date());

  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toISO(d);
    const items = byFecha(iso);
    // corta a 5 semanas si la 6ta es puro mes siguiente
    if (i >= 35 && d.getMonth() !== m) break;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mes-day' + (d.getMonth() !== m ? ' other' : '') + (iso === todayISO ? ' today' : '') + (iso === state.selectedDate ? ' selected' : '');
    b.innerHTML = `<span class="dnum">${d.getDate()}</span>` +
      items.slice(0, 3).map((c) =>
        `<span class="pill ${c.estado} ${c.origen === 'web' ? 'web' : ''}">${esc(c.hora)} · ${esc(c.alumno.split(' ')[0])}</span>`,
      ).join('') +
      (items.length > 3 ? `<span class="more">+${items.length - 3} más</span>` : '');
    b.addEventListener('click', () => { state.selectedDate = iso; renderAll(); });
    b.addEventListener('dblclick', () => openNew(iso, null));
    grid.appendChild(b);
  }
}

function renderSemana() {
  const wrap = $('semGrid');
  wrap.innerHTML = '';
  const mon = mondayOf(state.cursor);
  const todayISO = toISO(new Date());
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    const iso = toISO(d);
    const items = byFechaAll(iso);
    const box = document.createElement('div');
    box.className = 'sem-day' + (iso === todayISO ? ' today' : '');
    const head = document.createElement('div');
    head.className = 'sem-head' + (iso === state.selectedDate ? ' selected' : '');
    head.innerHTML = `<span>${d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })}</span><span class="more">${items.filter((c) => c.estado !== 'cancelada').length} clases</span>`;
    head.style.cursor = 'pointer';
    head.addEventListener('click', () => { state.selectedDate = iso; renderAll(); });
    box.appendChild(head);
    state.horarios.forEach((h) => {
      const atH = items.filter((c) => c.hora === h);
      const row = document.createElement('div');
      row.className = 'slot';
      const cell = document.createElement('div');
      cell.className = 'slot-items';
      if (!atH.length) {
        const empty = document.createElement('button');
        empty.type = 'button';
        empty.className = 'slot-empty';
        empty.textContent = '+ Agendar';
        empty.addEventListener('click', () => openNew(iso, h));
        cell.appendChild(empty);
      } else {
        atH.forEach((c) => cell.appendChild(claseItem(c, true)));
      }
      row.innerHTML = `<div class="slot-time">${esc(h)}</div>`;
      row.appendChild(cell);
      box.appendChild(row);
    });
    wrap.appendChild(box);
  }
}

function claseItem(c, compact) {
  const div = document.createElement('div');
  const overdue = isOverdue(c);
  div.className = 'clase-item' + (c.estado === 'cancelada' ? ' cancelada' : '') + (overdue ? ' overdue' : '');
  const wa = waLink(c.telefono, c.alumno);
  const nextLabel = c.estado === 'programada' ? 'Confirmar' : c.estado === 'confirmada' ? 'Completar' : 'Avanzar';
  div.innerHTML = `
    <div class="clase-top">
      <span class="clase-hora">${esc(c.hora)}</span>
      <span>
        ${overdue ? '<span class="badge atrasada">⚠ pendiente</span> ' : ''}
        ${c.origen === 'web' ? '<span class="origen web" title="Llegó sola desde la web">web</span> ' : ''}
        <span class="badge ${esc(c.estado)}">${esc(c.estado)}</span>
      </span>
    </div>
    <div class="clase-nombre">${esc(c.alumno)} <span class="muted small">· ${esc(TIPO_LABEL[c.tipo] || c.tipo)}${c.personas > 1 ? ` · ${c.personas}p` : ''}</span></div>
    ${c.telefono || c.instructor ? `<div class="clase-sub">${c.telefono ? `📞 ${esc(c.telefono)}` : ''}${c.telefono && c.instructor ? ' · ' : ''}${c.instructor ? `🏄 ${esc(c.instructor)}` : ''}</div>` : ''}
    ${!compact && c.notas ? `<div class="clase-notas">${esc(c.notas)}</div>` : ''}
    ${c._readonly ? '<div class="clase-sub muted">reserva web (solo lectura)</div>' : ''}
    <div class="clase-actions">
      ${wa ? `<a class="icon-btn wa" href="${wa}" target="_blank" rel="noopener" title="Escribir por WhatsApp"><i class="fab fa-whatsapp"></i> WhatsApp</a>` : ''}
      ${c._readonly ? '' : `<button class="icon-btn" data-act="edit" title="Editar"><i class="fas fa-pen"></i></button>
      ${(c.estado === 'programada' || c.estado === 'confirmada') ? `<button class="icon-btn ok" data-act="estado" title="${nextLabel}"><i class="fas fa-check"></i> ${nextLabel}</button>` : ''}
      <button class="icon-btn del" data-act="del" title="Eliminar"><i class="fas fa-trash"></i></button>`}
    </div>`;
  if (!c._readonly) {
    div.querySelector('[data-act="edit"]').addEventListener('click', () => openEdit(c.id));
    div.querySelector('[data-act="del"]').addEventListener('click', () => deleteClase(c.id));
    const adv = div.querySelector('[data-act="estado"]');
    if (adv) adv.addEventListener('click', () => quickAdvance(c));
  }
  return div;
}

function renderDay() {
  const d = parseISO(state.selectedDate);
  $('dayTitle').textContent = d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  const items = byFechaAll(state.selectedDate);
  const activas = items.filter((c) => c.estado !== 'cancelada');
  $('dayCount').textContent = activas.length ? `${activas.length} clase(s) · ${items.filter((c) => c.estado === 'confirmada').length} confirmadas` : 'Sin clases este día';
  const ul = $('dayList');
  ul.innerHTML = '';
  if (!items.length) {
    ul.innerHTML = '<li class="empty">No hay clases. Agenda la primera con “Agendar aquí”.</li>';
    return;
  }
  items.forEach((c) => {
    const li = document.createElement('li');
    li.appendChild(claseItem(c, false));
    ul.appendChild(li);
  });
}

function renderUpcoming() {
  const today = toISO(new Date());
  const end = toISO(new Date(Date.now() + 14 * 86400000));
  const items = filtered().filter((c) => c.fecha >= today && c.fecha <= end && c.estado !== 'cancelada')
    .sort(compararClases).slice(0, 15);
  const ul = $('upList');
  ul.innerHTML = '';
  if (!items.length) { ul.innerHTML = '<li class="empty">Nada programado en 14 días.</li>'; return; }
  items.forEach((c) => {
    const li = document.createElement('li');
    const wrap = claseItem(c, true);
    const tag = document.createElement('div');
    tag.className = 'clase-sub';
    tag.innerHTML = `<strong>${parseISO(c.fecha).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>`;
    wrap.prepend(tag);
    li.appendChild(wrap);
    ul.appendChild(li);
  });
}

/* ---------- MODAL ---------- */
function syncHoraOptions() {
  const sel = $('cHora');
  sel.innerHTML = state.horarios.map((h) => `<option value="${esc(h)}">${esc(h)}</option>`).join('');
  sel.value = '8:00 am';
}

function modalContext(fecha, hora) {
  try {
    const d = parseISO(fecha);
    const txt = d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
    return ` · ${txt}${hora ? ` ${hora}` : ''}`;
  } catch { return ''; }
}

function openNew(fecha, hora) {
  state.editingId = null;
  const f = fecha || state.selectedDate || toISO(new Date());
  $('modalTitle').textContent = 'Agendar clase' + modalContext(f, hora);
  $('formClase').reset();
  $('btnDelete').hidden = true;
  $('formError').hidden = true;
  $('cFecha').value = f;
  if (hora && state.horarios.includes(hora)) $('cHora').value = hora;
  $('cEstado').value = 'programada';
  $('cPersonas').value = '1';
  $('claseModal').hidden = false;
  setTimeout(() => $('cAlumno').focus(), 50);
}

function openEdit(id) {
  const c = state.clases.find((x) => x.id === id);
  if (!c || c._readonly) return;
  state.editingId = id;
  $('modalTitle').textContent = 'Editar clase' + modalContext(c.fecha, c.hora);
  $('formError').hidden = true;
  $('cAlumno').value = c.alumno || '';
  $('cTelefono').value = c.telefono || '';
  $('cEmail').value = c.email || '';
  $('cFecha').value = c.fecha || '';
  syncHoraOptionsIfNeeded(c.hora);
  $('cHora').value = c.hora;
  $('cTipo').value = c.tipo;
  $('cPersonas').value = String(c.personas || 1);
  $('cInstructor').value = c.instructor || '';
  $('cEstado').value = c.estado || 'programada';
  $('cNotas').value = c.notas || '';
  $('btnDelete').hidden = false;
  $('claseModal').hidden = false;
}

function syncHoraOptionsIfNeeded(hora) {
  const sel = $('cHora');
  if (![...sel.options].some((o) => o.value === hora)) {
    const opt = document.createElement('option');
    opt.value = hora;
    opt.textContent = hora;
    sel.appendChild(opt);
  }
}

function closeModal() {
  $('claseModal').hidden = true;
  state.editingId = null;
}

async function saveClase(e) {
  e.preventDefault();
  const box = $('formError');
  box.hidden = true;
  const btn = $('btnSave');
  btn.disabled = true;
  const existing = state.editingId ? state.clases.find((x) => x.id === state.editingId) : null;
  const body = {
    alumno: $('cAlumno').value.trim(),
    telefono: $('cTelefono').value.trim(),
    email: $('cEmail').value.trim(),
    fecha: $('cFecha').value,
    hora: $('cHora').value,
    tipo: $('cTipo').value,
    personas: parseInt($('cPersonas').value, 10),
    instructor: $('cInstructor').value.trim(),
    origen: existing?.origen || 'manual',
    estado: $('cEstado').value,
    notas: $('cNotas').value.trim(),
  };
  try {
    const wasEditing = !!state.editingId;
    const url = state.editingId ? `/api/admin/agenda/${state.editingId}` : '/api/admin/agenda';
    const method = state.editingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
    state.selectedDate = data.clase.fecha;
    closeModal();
    await loadAgenda();
    toast(wasEditing ? 'Cambios guardados ✓' : `Clase agendada ✓ ${data.clase.fecha} ${data.clase.hora}`);
  } catch (err) {
    box.hidden = false;
    box.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

async function deleteClase(id) {
  const c = state.clases.find((x) => x.id === id);
  if (!c || c._readonly) return;
  if (!confirm(`¿Eliminar la clase de ${c.alumno} el ${c.fecha} ${c.hora}?`)) return;
  try {
    const res = await fetch(`/api/admin/agenda/${id}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await loadAgenda();
    toast('Clase eliminada');
  } catch (err) {
    toast(err.message);
  }
}

async function quickAdvance(c) {
  const order = ['programada', 'confirmada', 'completada'];
  const next = order[order.indexOf(c.estado) + 1] || 'completada';
  try {
    const res = await fetch(`/api/admin/agenda/${c.id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ estado: next }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await loadAgenda();
    toast(`${c.alumno} → ${next} ✓`);
  } catch (err) {
    toast(err.message);
  }
}

/* ---------- NAV / FILTERS ---------- */
function moveCal(dir) {
  if (state.view === 'mes') {
    state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() + dir, 1);
  } else {
    const d = new Date(state.cursor);
    d.setDate(d.getDate() + dir * 7);
    state.cursor = d;
  }
  loadAgenda().catch((e) => toast(e.message));
}

/* ---------- INIT ---------- */
$('formLogin').addEventListener('submit', login);
$('btnLogout').addEventListener('click', logout);
$('btnNueva').addEventListener('click', () => openNew(state.selectedDate, null));
$('btnAgendarDia').addEventListener('click', () => openNew(state.selectedDate, null));
$('formClase').addEventListener('submit', saveClase);
$('modalClose').addEventListener('click', closeModal);
$('modalCancel').addEventListener('click', closeModal);
$('claseModal').addEventListener('click', (e) => { if (e.target === $('claseModal')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('claseModal').hidden) closeModal(); });
$('btnDelete').addEventListener('click', () => { if (state.editingId) { closeModal(); deleteClase(state.editingId); } });

$('viewMes').addEventListener('click', () => { state.view = 'mes'; loadAgenda().catch(() => {}); });
$('viewSemana').addEventListener('click', () => { state.view = 'semana'; loadAgenda().catch(() => {}); });
$('calPrev').addEventListener('click', () => moveCal(-1));
$('calNext').addEventListener('click', () => moveCal(1));
$('calToday').addEventListener('click', () => {
  state.cursor = new Date();
  state.selectedDate = toISO(new Date());
  loadAgenda().catch(() => {});
});

$('cardHoy').addEventListener('click', () => {
  state.cursor = new Date();
  state.selectedDate = toISO(new Date());
  loadAgenda().catch(() => {});
});
$('cardPend').addEventListener('click', () => {
  state.filters.estado = 'programada';
  $('fEstado').value = 'programada';
  renderAll();
  toast('Mostrando: por confirmar');
});

let searchT;
$('fSearch').addEventListener('input', (e) => {
  clearTimeout(searchT);
  searchT = setTimeout(() => { state.filters.q = e.target.value; renderAll(); }, 250);
});
$('fEstado').addEventListener('change', (e) => { state.filters.estado = e.target.value; renderAll(); });
$('fTipo').addEventListener('change', (e) => { state.filters.tipo = e.target.value; renderAll(); });
$('fOrigen').addEventListener('change', (e) => { state.filters.origen = e.target.value; renderAll(); });

boot();
