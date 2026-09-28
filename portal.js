/* Portal Alumno — Pacific Surf School */
const API = '';
const $ = (id) => document.getElementById(id);
const tokenKey = 'pss_token';

const state = {
  token: localStorage.getItem(tokenKey) || null,
  user: null,
  stats: null,
  clases: [],
  ejercicios: [],
  weekOffset: 0,
  selectedDate: null,
};

const PAQ_NAMES = {
  paquete: 'Pack x4 clases',
  paquete8: 'Pack x8 clases',
  paquete12: 'Pack x12 clases',
};

function authHeaders() {
  return state.token
    ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + state.token }
    : { 'Content-Type': 'application/json' };
}
function showMsg(el, text, isErr = false) {
  el.hidden = false;
  el.textContent = text;
  el.classList.toggle('err', isErr);
}
function fmtFechaCorta(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
}
function mondayOf(offsetWeeks) {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // lunes=0
  const mon = new Date(now);
  mon.setDate(now.getDate() - day + offsetWeeks * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ---------- AUTH ---------- */
async function login(e) {
  e.preventDefault();
  const btn = $('btnLogin');
  btn.disabled = true;
  $('loginError').hidden = true;
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: $('loginEmail').value.trim(), password: $('loginPass').value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo entrar');
    state.token = data.token;
    localStorage.setItem(tokenKey, data.token);
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
  if (state.token) fetch(`${API}/api/auth/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {});
  state.token = null;
  localStorage.removeItem(tokenKey);
  admin.alumnos = []; admin.agenda = [];
  $('viewApp').classList.remove('is-admin');
  document.body.classList.remove('is-admin');
  $('portalNav').classList.remove('is-admin');
  renderAuth();
}

/* ---------- DATA ---------- */
async function boot() {
  if (!state.token) return renderAuth();
  try {
    const me = await (await fetch(`${API}/api/auth/me`, { headers: authHeaders() })).json();
    if (!me.success) throw new Error(me.error);
    state.user = me.user;
    state.stats = me.stats;
    const [cl, ej] = await Promise.all([
      fetch(`${API}/api/mis-clases`, { headers: authHeaders() }).then(r => r.json()).catch(() => ({ clases: [] })),
      fetch(`${API}/api/ejercicios`).then(r => r.json()).catch(() => ({ ejercicios: [] })),
    ]);
    state.clases = cl.clases || [];
    state.stats = cl.stats || state.stats;
    state.ejercicios = ej.ejercicios || [];
    if (state.user.rol === 'admin') await loadAdmin();
    renderAuth();
    renderAll();
  } catch {
    state.token = null;
    localStorage.removeItem(tokenKey);
    renderAuth();
  }
}

const admin = { alumnos: [], agenda: [], search: '', fPaq: '', fEst: '', editingId: null };

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function isVencido(a) {
  return a.fechaFin && new Date(a.fechaFin) < new Date();
}
function estadoDe(a) {
  if (a.activo === false) return 'pausado';
  if (isVencido(a)) return 'vencido';
  return 'activo';
}
const ESTADO_LABEL = { activo: 'Activo', pausado: 'Pausado', vencido: 'Vencido' };

async function loadAdmin() {
  try {
    const [al, ag] = await Promise.all([
      fetch(`${API}/api/admin/alumnos`, { headers: authHeaders() }).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/api/admin/clases`, { headers: authHeaders() }).then(r => r.json()).catch(() => ({})),
    ]);
    if (al.success) admin.alumnos = al.alumnos || [];
    if (ag.success) admin.agenda = ag.clases || [];
    renderAdmin();
  } catch {}
}

function filteredAlumnos() {
  const q = admin.search.trim().toLowerCase();
  return admin.alumnos.filter(a => {
    if (admin.fPaq && a.paquete !== admin.fPaq) return false;
    if (admin.fEst && estadoDe(a) !== admin.fEst) return false;
    if (q && !(a.nombre?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderAdmin() {
  const list = admin.alumnos;
  const activos = list.filter(a => estadoDe(a) === 'activo').length;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const finSem = new Date(hoy); finSem.setDate(hoy.getDate() + 7);
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const semana = admin.agenda.filter(c => c.fecha >= fmt(hoy) && c.fecha <= fmt(finSem)).length;
  const sinUso = list.filter(a => (a.programadas ?? 0) === 0 && a.activo !== false).length;
  $('admTotal').textContent = list.length;
  $('admActivos').textContent = activos;
  $('admSemana').textContent = semana;
  $('admSinUso').textContent = sinUso;

  const rows = filteredAlumnos();
  $('admCount').textContent = `${rows.length} de ${list.length}`;
  $('adminRows').innerHTML = rows.map(a => {
    const total = a.sesionesTotales ?? 0;
    const prog = a.programadas ?? 0;
    const pct = total ? Math.round((prog / total) * 100) : 0;
    const est = estadoDe(a);
    const paqClass = a.paquete === 'paquete8' ? 'x8' : a.paquete === 'paquete12' ? 'x12' : '';
    const vig = a.fechaFin ? new Date(a.fechaFin).toLocaleDateString('es-PE') : '—';
    const wa = a.telefono ? `https://wa.me/${encodeURIComponent(a.telefono.replace(/\D/g, ''))}` : null;
    return `<tr>
      <td><div class="alu-name">${esc(a.nombre)}</div><div class="alu-sub">${esc(a.email)}${a.telefono ? ' · ' + esc(a.telefono) : ''}</div></td>
      <td><span class="badge ${paqClass}">${esc(PAQ_NAMES[a.paquete] || '—')}</span></td>
      <td><div><strong>${prog}/${total}</strong></div><div class="uso-bar"><div style="width:${pct}%"></div></div></td>
      <td><span class="vigencia ${est === 'vencido' ? 'vencida' : ''}">${vig}</span></td>
      <td><span class="estado ${est}">${ESTADO_LABEL[est]}</span></td>
      <td><div class="row-actions">
        <button class="icon-btn" data-act="edit" data-id="${a.id}" title="Editar paquete, sesiones y clave"><i class="fas fa-pen"></i></button>
        ${a.activo !== false
          ? `<button class="icon-btn danger" data-act="pause" data-id="${a.id}" title="Pausar (bloquea programación)"><i class="fas fa-pause"></i></button>`
          : `<button class="icon-btn ok" data-act="play" data-id="${a.id}" title="Reactivar alumno"><i class="fas fa-play"></i></button>`}
        ${wa ? `<a class="icon-btn" href="${wa}" target="_blank" title="Escribir por WhatsApp"><i class="fab fa-whatsapp"></i></a>` : ''}
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="muted">Sin resultados. Ajusta la búsqueda o crea un alumno nuevo.</td></tr>';

  $('adminAgenda').innerHTML = admin.agenda.slice(0, 20).map(c => `
    <li><span><strong>${fmtFechaCorta(c.fecha)}</strong> · ${esc(c.horario)} · ${esc(c.alumnoNombre)}
    <small class="alu-sub">${esc(PAQ_NAMES[c.paquete] || '')}${c.alumnoTelefono ? ' · ' + esc(c.alumnoTelefono) : ''}</small></span></li>
  `).join('') || '<li><span class="muted">No hay clases programadas próximamente.</span></li>';
}

/* --- Modal editar --- */
function openEdit(id) {
  const a = admin.alumnos.find(x => x.id === id);
  if (!a) return;
  admin.editingId = id;
  $('editTitle').textContent = a.nombre;
  $('editSub').textContent = `${a.email} · ${PAQ_NAMES[a.paquete] || ''} · ${a.programadas ?? 0}/${a.sesionesTotales ?? 0} programadas`;
  $('editPaquete').value = a.paquete || 'paquete';
  $('editSesiones').value = a.sesionesTotales ?? 0;
  $('editActivo').value = String(a.activo !== false);
  $('editPass').value = '';
  $('editMsg').hidden = true;
  $('editModal').hidden = false;
}
function closeEdit() {
  $('editModal').hidden = true;
  admin.editingId = null;
}
async function saveEdit() {
  const id = admin.editingId;
  if (!id) return;
  const box = $('editMsg');
  box.hidden = true;
  const btn = $('editSave');
  btn.disabled = true;
  try {
    const a = admin.alumnos.find(x => x.id === id);
    const body = {
      activo: $('editActivo').value === 'true',
      sesionesTotales: Math.max(0, Math.min(50, parseInt($('editSesiones').value || '0', 10))),
    };
    if ($('editPaquete').value !== a.paquete) body.paquete = $('editPaquete').value;
    const res = await fetch(`${API}/api/admin/alumnos/${id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
    const np = $('editPass').value.trim();
    if (np) {
      if (np.length < 6) throw new Error('La nueva contraseña debe tener mínimo 6 caracteres.');
      const r2 = await fetch(`${API}/api/admin/alumnos/${id}/reset-password`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ password: np }),
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error || 'No se pudo cambiar la clave');
    }
    showMsg($('adminMsg'), `Cambios guardados para ${data.alumno.nombre}.`);
    closeEdit();
    await loadAdmin();
  } catch (err) {
    showMsg(box, err.message, true);
  } finally {
    btn.disabled = false;
  }
}
async function setActivo(id, activo) {
  try {
    const res = await fetch(`${API}/api/admin/alumnos/${id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ activo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showMsg($('adminMsg'), `${data.alumno.nombre} ${activo ? 'reactivado ✅' : 'pausado ⏸️'}.`);
    await loadAdmin();
  } catch (err) {
    showMsg($('adminMsg'), err.message, true);
  }
}

/* ---------- RENDER ---------- */
function applyRoleTheme() {
  const u = state.user;
  const isAdmin = !!u && u.rol === 'admin';
  document.body.classList.toggle('is-admin', isAdmin);
  $('portalNav').classList.toggle('is-admin', isAdmin);
  $('viewApp').classList.toggle('is-admin', isAdmin);
  // Nav: marca y distintivo de rol
  $('brandSub').textContent = isAdmin ? 'Panel Administración' : 'Portal Alumno';
  const badge = $('roleBadge');
  badge.hidden = !u;
  badge.textContent = isAdmin ? '🛡️ Admin' : '🏄 Alumno';
  badge.classList.toggle('is-admin', isAdmin);
  const chip = $('userChip');
  chip.hidden = !u;
  chip.textContent = u ? (u.nombre || u.email) : '';
  chip.title = u ? `${u.nombre || ''} · ${u.email || ''}` : '';
  // Banner superior que separa visualmente cada dashboard
  const banner = $('roleBanner');
  banner.hidden = !u;
  banner.classList.remove('alumno', 'admin');
  if (u) {
    banner.classList.add(isAdmin ? 'admin' : 'alumno');
    $('roleTag').textContent = isAdmin ? 'Administración · Solo instructor' : 'Dashboard del alumno';
    $('roleTitle').textContent = isAdmin
      ? `Hola, ${u.nombre || 'Instructor'} 🛡️`
      : `Aloha, ${u.nombre || 'surfer'} 🤙`;
    $('roleSub').textContent = isAdmin
      ? 'Panel del instructor: alumnos, paquetes y agenda global. Vista no visible para alumnos.'
      : 'Tu progreso, tus días de clase y tu rutina para entrenar en casa.';
    $('roleIcon').innerHTML = isAdmin ? '<i class="fas fa-user-shield"></i>' : '<i class="fas fa-surfboard"></i>';
  }
  document.title = isAdmin
    ? 'Panel Admin — Pacific Surf School'
    : 'Portal Alumno — Pacific Surf School';
}
function renderAuth() {
  const logged = !!state.token;
  $('viewLogin').hidden = logged;
  $('viewApp').hidden = !logged;
  $('btnLogout').hidden = !logged;
  if (!logged) {
    document.body.classList.remove('is-admin');
    $('portalNav').classList.remove('is-admin');
    $('roleBadge').hidden = true;
    $('userChip').hidden = true;
    $('roleBanner').hidden = true;
    document.title = 'Portal Alumno — Pacific Surf School';
  }
}
function renderAll() {
  const u = state.user, s = state.stats;
  if (!u) return;
  applyRoleTheme();
  $('paqNombre').textContent = PAQ_NAMES[u.paquete] || (u.rol === 'admin' ? 'Administrador' : 'Sin paquete');
  $('paqVigencia').textContent = u.fechaFin
    ? `Vigente hasta ${new Date(u.fechaFin).toLocaleDateString('es-PE')}`
    : u.rol === 'admin' ? 'Acceso total' : 'Sin vigencia';
  $('statTotales').textContent = s?.sesionesTotales ?? 0;
  $('statProgramadas').textContent = s?.programadas ?? 0;
  $('statRestantes').textContent = s?.restantes ?? 0;
  $('statRestantes2').textContent = s?.restantes ?? 0;
  $('paqBar').style.width = s?.sesionesTotales
    ? `${Math.round(((s.sesionesTotales - s.restantes) / s.sesionesTotales) * 100)}%` : '0%';
  const isAdmin = u.rol === 'admin';
  $('adminCard').hidden = !isAdmin;
  if (isAdmin) {
    // El admin trabaja en su panel; se ocultan las secciones de alumno por CSS
    if (!admin.alumnos.length) loadAdmin(); else renderAdmin();
    renderEjercicios();
    return;
  }
  renderWeek();
  renderClases();
  renderEjercicios();
}
function renderWeek() {
  const mon = mondayOf(state.weekOffset);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  $('weekLabel').textContent =
    `${mon.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} – ${sun.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`;
  const todayISO = toISO(new Date());
  const grid = $('weekGrid');
  grid.innerHTML = '';
  const diasES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    const iso = toISO(d);
    const busy = state.clases.find(c => c.fecha === iso);
    const past = iso < todayISO;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'day' + (past ? ' past' : '') + (state.selectedDate === iso ? ' selected' : '') + (busy ? ' busy' : '');
    b.disabled = past;
    b.innerHTML = `<small>${diasES[i]}</small><strong>${d.getDate()}</strong><small>${d.toLocaleDateString('es-PE', { month: 'short' })}</small>${busy ? `<span class="dot">● ${busy.horario}</span>` : ''}`;
    if (!past) b.addEventListener('click', () => { state.selectedDate = iso; renderWeek(); });
    grid.appendChild(b);
  }
}
function renderClases() {
  const ul = $('listaClases');
  if (!state.clases.length) {
    ul.innerHTML = '<li><span>Aún no programaste días. Elige un día arriba 👆</span></li>';
    return;
  }
  ul.innerHTML = '';
  state.clases.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<span><strong>${fmtFechaCorta(c.fecha)}</strong> · ${c.horario}</span>`;
    const btn = document.createElement('button');
    btn.className = 'btn-cancel';
    btn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
    btn.addEventListener('click', () => cancelarClase(c.id));
    li.appendChild(btn);
    ul.appendChild(li);
  });
}
function renderEjercicios() {
  $('ejGrid').innerHTML = state.ejercicios.map(e => `
    <div class="ej"><i class="fas ${e.icono || 'fa-dumbbell'}"></i>
      <h4>${e.titulo}</h4><span class="nivel">${e.nivel} · ${e.reps}</span>
      <p>${e.descripcion}</p></div>
  `).join('');
}

/* ---------- ACCIONES ---------- */
async function programar() {
  const box = $('bookMsg');
  if (!state.selectedDate) return showMsg(box, 'Primero elige un día de la semana.', true);
  try {
    const res = await fetch(`${API}/api/mis-clases`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ fecha: state.selectedDate, horario: $('selHorario').value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    state.clases.push(data.clase);
    state.stats = data.stats;
    showMsg(box, `Listo 🤙 ${fmtFechaCorta(data.clase.fecha)} a las ${data.clase.horario}`);
    renderAll();
  } catch (err) {
    showMsg(box, err.message, true);
  }
}
async function cancelarClase(id) {
  try {
    const res = await fetch(`${API}/api/mis-clases/${id}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    state.clases = state.clases.filter(c => c.id !== id);
    state.stats = data.stats;
    renderAll();
  } catch (err) {
    showMsg($('bookMsg'), err.message, true);
  }
}
async function crearAlumno(e) {
  e.preventDefault();
  const box = $('adminMsg');
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/api/admin/alumnos`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({
        nombre: $('alNombre').value.trim(),
        email: $('alEmail').value.trim(),
        password: $('alPass').value,
        telefono: $('alTel').value.trim(),
        paquete: $('alPaquete').value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showMsg(box, `Alumno creado ✅ ${data.alumno.nombre} · ${PAQ_NAMES[data.alumno.paquete]} · usuario: ${data.alumno.email}`);
    e.target.reset();
    $('formAlumno').hidden = true;
    await loadAdmin();
  } catch (err) {
    showMsg(box, err.message, true);
  } finally {
    btn.disabled = false;
  }
}

/* ---------- INIT ---------- */
$('formLogin').addEventListener('submit', login);
$('btnLogout').addEventListener('click', logout);
$('btnProgramar').addEventListener('click', programar);
$('formAlumno').addEventListener('submit', crearAlumno);
$('weekPrev').addEventListener('click', () => { state.weekOffset--; renderWeek(); });
$('weekNext').addEventListener('click', () => { state.weekOffset++; renderWeek(); });
$('weekToday').addEventListener('click', () => { state.weekOffset = 0; renderWeek(); });
/* Admin */
$('btnNuevoAlumno').addEventListener('click', () => {
  const f = $('formAlumno');
  f.hidden = !f.hidden;
  if (!f.hidden) $('alNombre').focus();
});
$('btnCancelarAlumno').addEventListener('click', () => { $('formAlumno').hidden = true; });
$('admSearch').addEventListener('input', e => { admin.search = e.target.value; renderAdmin(); });
$('admFilterPaq').addEventListener('change', e => { admin.fPaq = e.target.value; renderAdmin(); });
$('admFilterEstado').addEventListener('change', e => { admin.fEst = e.target.value; renderAdmin(); });
$('adminRows').addEventListener('click', e => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const { act, id } = btn.dataset;
  if (act === 'edit') openEdit(id);
  else if (act === 'pause') setActivo(id, false);
  else if (act === 'play') setActivo(id, true);
});
$('editClose').addEventListener('click', closeEdit);
$('editCancel').addEventListener('click', closeEdit);
$('editSave').addEventListener('click', saveEdit);
$('editModal').addEventListener('click', e => { if (e.target === $('editModal')) closeEdit(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('editModal').hidden) closeEdit(); });
boot();
