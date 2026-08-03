/* ===== IMAGE SYNC — corrige .jpg → .jpeg automáticamente ===== */
document.querySelectorAll('img[src^="img/"]').forEach(img => {
  img.addEventListener('error', function() {
    const src = this.getAttribute('src');
    if (src.endsWith('.jpg')) {
      this.src = src.replace('.jpg', '.jpeg');
    } else if (src.endsWith('.png')) {
      this.src = src.replace('.png', '.jpeg');
    }
  });
});

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ===== SCROLL PROGRESS BAR ===== */
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.prepend(scrollProgress);
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  scrollProgress.style.width = pct + '%';
});

const hamburger = document.getElementById('hamburger');
const navInner = document.querySelector('.nav-inner');
hamburger.addEventListener('click', () => {
  navInner.classList.toggle('open');
  hamburger.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navInner.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const strong = e.target.querySelector('strong');
      if (strong && !strong.dataset.animated) {
        strong.dataset.animated = '1';
        const text = strong.textContent;
        const num = parseInt(text.replace(/\D/g, ''), 10);
        if (!isNaN(num)) {
          animateCounter(strong, num);
          setTimeout(() => { strong.textContent = text; }, 1600);
        }
      }
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-item').forEach(el => statObserver.observe(el));

/* ===== FADE-UP ON SCROLL ===== */
const fadeEls = document.querySelectorAll(
  '.clase-card, .reason, .gal-item, .stat-item, .faq-item'
);
fadeEls.forEach(el => el.classList.add('fade-up'));
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => fadeObserver.observe(el));

/* ===== FAQ ACCORDION ===== */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

/* ===== MODAL ===== */
const overlay = document.getElementById('modalOverlay');
const modal = overlay.querySelector('.modal');
let currentStep = 1;

const precios = { individual: 150, grupal: 110, paquete: 400, paquete8: 720, paquete12: 1020 };
const nombres = { individual: 'Clase Individual', grupal: 'Clase Grupal', paquete: 'Pack x4 Clases', paquete8: 'Pack x8 Clases', paquete12: 'Pack x12 Clases' };

/* ===== HORARIOS POR DÍA ===== */
const horariosLunesASabado = ['6:00 am', '8:00 am', '10:00 am', '11:30 am', '2:00 pm', '4:00 pm'];
const horariosDomingo = ['8:00 am', '10:00 am'];
const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function openModal(tipo) {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetModal();
  goToStep(1);
  if (tipo) {
    const radio = document.querySelector(`input[name="tipoClase"][value="${tipo}"]`);
    if (radio) {
      radio.checked = true;
      radio.closest('.opt-card').classList.add('selected');
    }
  }
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function resetModal() {
  overlay.querySelectorAll('input[type="radio"]').forEach(r => {
    r.checked = false;
    r.closest('.opt-card')?.classList.remove('selected');
  });
  overlay.querySelectorAll('input[type="text"], input[type="tel"], input[type="date"], input[type="number"]').forEach(i => i.value = '');
  overlay.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  const horariosWrap = document.getElementById('horarios-wrap');
  if (horariosWrap) horariosWrap.style.display = 'none';
  window._horarioSeleccionado = null;
  clearErrors();
  window._reservaData = null;
}

overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ===== STEP NAVIGATION ===== */
function goToStep(n) {
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`paso${i}`);
    step.classList.toggle('hidden', i !== n);
    if (i === n) step.classList.add('modal-step-active');
    const dot = document.getElementById(`step-dot-${i}`);
    dot.classList.remove('active', 'done');
    if (i === n) dot.classList.add('active');
    if (i < n) dot.classList.add('done');
  }
  document.querySelectorAll('.step-line').forEach((line, idx) => {
    line.classList.toggle('done', idx < n - 1);
  });
  currentStep = n;
  modal.scrollTop = 0;
}

function clearErrors() {
  overlay.querySelectorAll('.field-error').forEach(e => e.remove());
  overlay.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
}

function showError(inputEl, msg) {
  inputEl.classList.add('input-error');
  const err = document.createElement('span');
  err.className = 'field-error';
  err.textContent = msg;
  inputEl.parentElement.appendChild(err);
  inputEl.focus();
}

function nextStep(n) {
  clearErrors();

  if (n === 2) {
    const tipo = document.querySelector('input[name="tipoClase"]:checked');
    if (!tipo) {
      const firstCard = overlay.querySelector('.clase-options .opt-card');
      if (firstCard) { firstCard.classList.add('shake'); setTimeout(() => firstCard.classList.remove('shake'), 500); }
      return;
    }
  }

  if (n === 3) {
    const fecha = document.getElementById('res-fecha');
    if (!fecha.value) { showError(fecha, 'Selecciona una fecha'); return; }
    if (!window._horarioSeleccionado) {
      const grid = document.getElementById('horarios-grid');
      if (grid) { grid.classList.add('shake'); setTimeout(() => grid.classList.remove('shake'), 500); }
      return;
    }
  }

  if (n === 4) {
    const nombre = document.getElementById('res-nombre');
    const wsp = document.getElementById('res-wsp');
    const peso = document.getElementById('res-peso');
    const altura = document.getElementById('res-altura');
    const experiencia = document.getElementById('res-experiencia');
    const nivel = document.getElementById('res-nivel');
    const pago = document.getElementById('res-pago');

    if (!nombre.value.trim()) { showError(nombre, 'Ingresa tu nombre'); return; }
    if (!wsp.value.trim()) { showError(wsp, 'Ingresa tu WhatsApp'); return; }
    if (!wsp.value.match(/^[\d\s\+\-]{7,15}$/)) { showError(wsp, 'Formato inválido'); return; }
    if (!experiencia.value) { showError(experiencia, 'Selecciona tu experiencia'); return; }
    if (!nivel.value) { showError(nivel, 'Selecciona tu nivel'); return; }
    if (!pago.value) { showError(pago, 'Selecciona medio de pago'); return; }
    buildResumen();
  }

  goToStep(n);
}

/* ===== FECHA → HORARIOS DINÁMICOS ===== */
const fechaInput = document.getElementById('res-fecha');
if (fechaInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  fechaInput.min = `${yyyy}-${mm}-${dd}`;
  fechaInput.max = `${yyyy + 1}-${mm}-${dd}`;

  fechaInput.addEventListener('change', () => {
    const val = fechaInput.value;
    if (!val) return;
    const date = new Date(val + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const esDomingo = dayOfWeek === 0;
    const horarios = esDomingo ? horariosDomingo : horariosLunesASabado;
    const nombreDia = dias[dayOfWeek];

    const horariosWrap = document.getElementById('horarios-wrap');
    const horariosLabel = document.getElementById('horarios-label');
    const horariosGrid = document.getElementById('horarios-grid');

    horariosLabel.textContent = esDomingo
      ? `Horarios disponibles — ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`
      : `Horarios disponibles — ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`;
    horariosGrid.innerHTML = horarios.map(h =>
      `<button type="button" class="horario-btn" data-hora="${h}">${h}</button>`
    ).join('');

    horariosWrap.style.display = 'block';
    window._horarioSeleccionado = null;

    horariosGrid.querySelectorAll('.horario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        horariosGrid.querySelectorAll('.horario-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        window._horarioSeleccionado = btn.dataset.hora;
      });
    });
  });
}

/* ===== RADIO SELECTION VISUAL ===== */
overlay.querySelectorAll('.clase-opt input').forEach(radio => {
  radio.addEventListener('change', () => {
    const group = radio.closest('.clase-options');
    group.querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
    radio.closest('.opt-card').classList.add('selected');
  });
});

/* ===== BUILD RESUMEN ===== */
function buildResumen() {
  const tipo = document.querySelector('input[name="tipoClase"]:checked')?.value;
  const fecha = document.getElementById('res-fecha').value;
  const horario = window._horarioSeleccionado;
  const nombre = document.getElementById('res-nombre').value.trim();
  const wsp = document.getElementById('res-wsp').value.trim();
  const peso = document.getElementById('res-peso').value;
  const altura = document.getElementById('res-altura').value;
  const experiencia = document.getElementById('res-experiencia').value;
  const nivel = document.getElementById('res-nivel').value;
  const personas = document.getElementById('res-personas').value;
  const pago = document.getElementById('res-pago').value;

  const fechaFmt = fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : '';

  const precioUnit = precios[tipo] || 0;
  const numPersonas = parseInt(personas) || 1;
  const total = precioUnit * numPersonas;

  const experienciaFmt = { nunca: 'Nunca', pocas: '1-3 veces', algunas: '4-10 veces', frecuente: 'Frecuente' }[experiencia] || experiencia;
  const nivelFmt = { principiante: 'Principiante', basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }[nivel] || nivel;
  const pagoFmt = { efectivo: 'Efectivo', yape: 'Yape', plin: 'Plin', transferencia: 'Transferencia', tarjeta: 'Tarjeta' }[pago] || pago;

  document.getElementById('resumenBox').innerHTML = `
    <p><span>Clase:</span> <strong>${nombres[tipo] || tipo}</strong></p>
    <p><span>Fecha:</span> ${fechaFmt}</p>
    <p><span>Horario:</span> ${horario}</p>
    <p><span>Personas:</span> ${personas}</p>
    <p><span>Nombre:</span> ${nombre}</p>
    <p><span>WhatsApp:</span> ${wsp}</p>
    ${peso ? `<p><span>Peso:</span> ${peso} kg</p>` : ''}
    ${altura ? `<p><span>Altura:</span> ${altura} cm</p>` : ''}
    <p><span>Experiencia:</span> ${experienciaFmt}</p>
    <p><span>Nivel:</span> ${nivelFmt}</p>
    <p><span>Medio de pago:</span> ${pagoFmt}</p>
    <p class="resumen-total"><span>Total estimado:</span> <strong>S/ ${total}</strong></p>
  `;

  window._reservaData = {
    tipo, fecha: fechaFmt, horario, nombre, wsp, peso, altura,
    experiencia: experienciaFmt, nivel: nivelFmt, personas, pago: pagoFmt,
    precioUnit, total
  };
}

/* ===== CONFIRMAR RESERVA → WHATSAPP ===== */
function confirmarReserva() {
  const d = window._reservaData;
  if (!d) return;

  const msg = encodeURIComponent(
    `Hola! Quiero reservar en Pacific Surf School\n\n` +
    `*Clase:* ${nombres[d.tipo]}\n` +
    `*Fecha:* ${d.fecha}\n` +
    `*Horario:* ${d.horario}\n` +
    `*Personas:* ${d.personas}\n` +
    `*Nombre:* ${d.nombre}\n` +
    `*WhatsApp:* ${d.wsp}\n` +
    (d.peso ? `*Peso:* ${d.peso} kg\n` : '') +
    (d.altura ? `*Altura:* ${d.altura} cm\n` : '') +
    `*Experiencia:* ${d.experiencia}\n` +
    `*Nivel:* ${d.nivel}\n` +
    `*Medio de pago:* ${d.pago}\n` +
    `*Total:* S/ ${d.total}`
  );

  const btn = document.getElementById('btnWhatsapp');
  btn.innerHTML = '<i class="fas fa-check"></i> ¡Redirigiendo...';
  btn.classList.add('btn-success');

  setTimeout(() => {
    window.open(`https://wa.me/51915168620?text=${msg}`, '_blank');
    setTimeout(() => {
      closeModal();
      btn.innerHTML = '<i class="fab fa-whatsapp"></i> Confirmar por WhatsApp';
      btn.classList.remove('btn-success');
    }, 1500);
  }, 600);
}

/* ===== AGREGAR A GOOGLE CALENDAR ===== */
function addToCalendar() {
  const d = window._reservaData;
  if (!d) return;

  const dateStr = d.fecha.replace(/(\d+).*?(\d+).*?(\d+)/, (_, y, m, day) => {
    const months = { enero:'01', febrero:'02', marzo:'03', abril:'04', mayo:'05', junio:'06',
      julio:'07', agosto:'08', septiembre:'09', octubre:'10', noviembre:'11', diciembre:'12' };
    return `${y}-${months[m] || '01'}-${day.padStart(2,'0')}`;
  });

  const timeMap = { '6:00 am':'0600', '8:00 am':'0800', '10:00 am':'1000', '11:30 am':'1130',
    '2:00 pm':'1400', '4:00 pm':'1600' };
  const timeClean = d.horario.replace(/\./g, '');
  const start_time = timeMap[timeClean] || '0800';
  const end_time = String(parseInt(start_time) + 200).padStart(4, '0');

  const dates = `${dateStr.replace(/-/g,'')}T${start_time}00/${dateStr.replace(/-/g,'')}T${end_time}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Clase de Surf - ${nombres[d.tipo]}`,
    dates,
    location: 'Playa Barranquito, Lima, Peru',
    details: `Reserva en Pacific Surf School\nClase: ${nombres[d.tipo]}\nHorario: ${d.horario}\nPersonas: ${d.personas}\nNombre: ${d.nombre}`
  });

  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
}

window.openModal = openModal;
window.closeModal = closeModal;
window.nextStep = nextStep;
window.confirmarReserva = confirmarReserva;
window.addToCalendar = addToCalendar;

/* ===== SURF FORECAST — OPEN-METEO MARINE API ===== */
const BARRANQUITO_LAT = -12.1444;
const BARRANQUITO_LON = -77.0284;
const MARINE_API = `https://marine-api.open-meteo.com/v1/marine?latitude=${BARRANQUITO_LAT}&longitude=${BARRANQUITO_LON}&hourly=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,wind_wave_height,wind_wave_period,sea_level_height_msl&timezone=America%2FLima&forecast_days=3`;
const WEATHER_API = `https://api.open-meteo.com/v1/forecast?latitude=${BARRANQUITO_LAT}&longitude=${BARRANQUITO_LON}&hourly=wind_speed_10m,wind_direction_10m&timezone=America%2FLima&forecast_days=1`;

function degToCardinal(deg) {
  if (deg == null || isNaN(deg)) return '--';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function evalSurfQuality(waveH, wavePeriod, windSpeed) {
  if (waveH == null || wavePeriod == null) return { level: 'fair', label: 'Sin datos suficientes', desc: 'No se puede evaluar', emoji: '❓', css: 'q-fair' };

  let score = 0;
  // Wave height scoring (best 0.8 - 2.0m for beginners/intermediates)
  if (waveH >= 0.5 && waveH <= 1.0) score += 3;
  else if (waveH > 1.0 && waveH <= 1.8) score += 4;
  else if (waveH > 1.8 && waveH <= 2.5) score += 3;
  else if (waveH > 2.5) score += 1;
  else score += 1;

  // Wave period scoring (longer = better quality waves)
  if (wavePeriod >= 14) score += 4;
  else if (wavePeriod >= 11) score += 3;
  else if (wavePeriod >= 8) score += 2;
  else score += 1;

  // Wind scoring (less wind = cleaner waves)
  const ws = windSpeed || 0;
  if (ws < 10) score += 4;
  else if (ws < 18) score += 3;
  else if (ws < 28) score += 2;
  else score += 0;

  if (score >= 10) return { level: 'excellent', label: '¡Excelente para surfear!', desc: 'Olas limpias con buen período. Ideal para todos los niveles.', emoji: '🤙', css: 'q-excellent' };
  if (score >= 7) return { level: 'good', label: 'Buenas condiciones', desc: 'Buen día para surfear. Condiciones favorables.', emoji: '🏄', css: 'q-good' };
  if (score >= 4) return { level: 'fair', label: 'Condiciones regulares', desc: 'Mar con algo de desorden. Mejor para surfers con experiencia.', emoji: '🌊', css: 'q-fair' };
  return { level: 'poor', label: 'Condiciones difíciles', desc: 'Mar revuelto o sin olas. No recomendado para principiantes.', emoji: '⚠️', css: 'q-poor' };
}

function evalQualitySimple(waveH, wavePeriod, windSpeed) {
  const q = evalSurfQuality(waveH, wavePeriod, windSpeed);
  const labels = { excellent: 'Excelente', good: 'Bueno', fair: 'Regular', poor: 'Difícil' };
  return { css: q.css, label: labels[q.level] || 'Regular' };
}

async function loadSurfForecast() {
  const loadingEl = document.getElementById('forecastLoading');
  const dataEl = document.getElementById('forecastData');
  const errorEl = document.getElementById('forecastError');
  const tableBody = document.getElementById('forecastTableBody');

  if (!loadingEl) return; // Section not in DOM

  loadingEl.style.display = 'flex';
  dataEl.style.display = 'none';
  errorEl.style.display = 'none';

  try {
    const [marineRes, weatherRes] = await Promise.all([
      fetch(MARINE_API),
      fetch(WEATHER_API)
    ]);

    if (!marineRes.ok) throw new Error('Marine API error');
    const marine = await marineRes.json();
    const weather = weatherRes.ok ? await weatherRes.json() : null;

    const h = marine.hourly;
    const now = new Date();
    const currentHour = now.getHours();

    // Find current hour index
    const times = h.time.map(t => new Date(t).getHours());
    const currentIdx = times.indexOf(currentHour);
    const idx = currentIdx >= 0 ? currentIdx : 0;

    // Wind data
    const windSpeeds = weather?.hourly?.wind_speed_10m || [];
    const windDirs = weather?.hourly?.wind_direction_10m || [];

    // Update current conditions
    const wH = h.wave_height[idx];
    const wP = h.wave_period[idx];
    const wD = h.wave_direction[idx];
    const sH = h.swell_wave_height[idx];
    const sP = h.swell_wave_period[idx];
    const sD = h.swell_wave_direction[idx];
    const wS = windSpeeds[idx] || null;

    document.getElementById('waveHeight').textContent = wH != null ? wH.toFixed(1) : '--';
    document.getElementById('wavePeriod').textContent = wP != null ? wP.toFixed(1) : '--';
    document.getElementById('waveDirection').textContent = wD != null ? `${Math.round(wD)}°` : '--';
    document.getElementById('waveDirectionText').textContent = degToCardinal(wD);
    document.getElementById('windSpeed').textContent = wS != null ? Math.round(wS) : '--';
    const tideH = h.sea_level_height_msl[idx];
    document.getElementById('tideHeight').textContent = tideH != null ? tideH.toFixed(2) : '--';
    document.getElementById('swellHeight').textContent = sH != null ? `${sH.toFixed(1)} m` : '--';
    document.getElementById('swellPeriod').textContent = sP != null ? `${sP.toFixed(1)} s` : '--';
    document.getElementById('swellDirection').textContent = sD != null ? `${Math.round(sD)}° ${degToCardinal(sD)}` : '--';

    // Quality
    const quality = evalSurfQuality(wH, wP, wS);
    const qualityEl = document.getElementById('forecastQuality');
    qualityEl.className = `forecast-quality quality-${quality.level}`;
    document.getElementById('qualityEmoji').textContent = quality.emoji;
    document.getElementById('qualityLabel').textContent = quality.label;
    document.getElementById('qualityDesc').textContent = quality.desc;

    // Updated time
    document.getElementById('lastUpdated').textContent = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    // Hourly table
    let rows = '';
    for (let i = 0; i < h.time.length; i++) {
      const hour = new Date(h.time[i]).getHours();
      const hourStr = `${String(hour).padStart(2, '0')}:00`;
      const wh = h.wave_height[i];
      const wp = h.wave_period[i];
      const wd = h.wave_direction[i];
      const ws = windSpeeds[i] || null;
      const tide = h.sea_level_height_msl[i];
      const isCurrentHour = hour === currentHour;
      const q = evalQualitySimple(wh, wp, ws);

      const tideStr = tide != null ? tide.toFixed(2) + ' m' : '--';
      const tideClass = tide != null && tide > 1 ? 'tide-high' : tide != null && tide < 0 ? 'tide-low' : '';

      rows += `<tr class="${isCurrentHour ? 'current-hour' : ''}">
        <td class="hour-cell">${hourStr}${isCurrentHour ? ' ◀' : ''}</td>
        <td class="wave-cell">${wh != null ? wh.toFixed(1) + ' m' : '--'}</td>
        <td>${wp != null ? wp.toFixed(1) + ' s' : '--'}</td>
        <td>${wd != null ? Math.round(wd) + '° ' + degToCardinal(wd) : '--'}</td>
        <td class="tide-cell ${tideClass}"><i class="fas fa-water"></i> ${tideStr}</td>
        <td>${ws != null ? Math.round(ws) + ' km/h' : '--'}</td>
        <td><span class="quality-dot ${q.css}">${q.label}</span></td>
      </tr>`;
    }
    tableBody.innerHTML = rows;

    // Show data
    loadingEl.style.display = 'none';
    dataEl.style.display = 'block';

  } catch (err) {
    console.error('Surf forecast error:', err);
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
  }
}

// Load on page load and refresh every 15 minutes
loadSurfForecast();
setInterval(loadSurfForecast, 15 * 60 * 1000);

/* ===== EXPOSE FORECAST TO WINDOW ===== */
window.loadSurfForecast = loadSurfForecast;
