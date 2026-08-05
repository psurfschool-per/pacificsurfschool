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

  if (n === 4 && window._updateMpButton) {
    const tipo = document.querySelector('input[name="tipoClase"]:checked')?.value || 'individual';
    window._updateMpButton(tipo);
  }
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

/* ===== MERCADOPAGO — PAYMENT LINKS ===== */
const MP_LINKS = {
  individual: 'https://mpago.la/1Z338zm',
  grupal: 'https://mpago.la/2mLWCbY',
  paquete: 'https://mpago.la/2DyvLcm',
  paquete8: 'https://mpago.la/1MFVCgP',
  paquete12: 'https://mpago.la/2qeLksQ'
};

function setupMpPayment() {
  const pagoSelect = document.getElementById('res-pago');
  const mpInfo = document.getElementById('mp-info');
  const mpSection = document.getElementById('mpSection');
  const btnMpPay = document.getElementById('btnMpPay');
  const resumenNota = document.getElementById('resumenNota');
  const btnWhatsapp = document.getElementById('btnWhatsapp');

  if (!pagoSelect) return;

  pagoSelect.addEventListener('change', () => {
    const isMp = pagoSelect.value === 'mercadopago';
    mpInfo.classList.toggle('hidden', !isMp);
  });

  window._updateMpButton = function(tipo) {
    const isMp = pagoSelect.value === 'mercadopago';
    mpSection.classList.toggle('hidden', !isMp);
    if (isMp && MP_LINKS[tipo]) {
      btnMpPay.href = MP_LINKS[tipo];
    }
    resumenNota.textContent = isMp
      ? 'Haz clic en "Pagar ahora" para completar el pago con MercadoPago.'
      : 'Al confirmar serás redirigido a WhatsApp para coordinar el pago y confirmar tu reserva.';
    btnWhatsapp.classList.toggle('hidden', isMp);
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

setupMpPayment();

/* ===== SURF FORECAST — 4 DAY CARDS — OPEN-METEO ===== */
const BARRANQUITO = { lat: -12.14, lon: -77.03 };

// Calibrated correction factors to match surf-forecast.com data
const SHOALING_FACTOR = 0.50;  // 1.84m → 0.92m (matches surf-forecast)
const PERIOD_FACTOR = 1.4;     // 8.6s → 12s (matches surf-forecast)
const ENERGY_K = 26;           // E = 26 × H² × T (kJ)

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function degToCardinal(deg) {
  if (deg == null || isNaN(deg)) return '--';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function evalSurfQuality(waveH, wavePeriod) {
  if (waveH == null || wavePeriod == null) return { level: 'fair', label: 'Sin datos', emoji: '❓', css: 'q-fair' };
  let score = 0;
  if (waveH >= 0.5 && waveH <= 1.0) score += 3;
  else if (waveH > 1.0 && waveH <= 1.8) score += 4;
  else if (waveH > 1.8 && waveH <= 2.5) score += 3;
  else if (waveH > 2.5) score += 1;
  else score += 1;
  if (wavePeriod >= 14) score += 4;
  else if (wavePeriod >= 11) score += 3;
  else if (wavePeriod >= 8) score += 2;
  else score += 1;
  if (score >= 10) return { level: 'excellent', label: 'Excelente', emoji: '🤙', css: 'q-excellent' };
  if (score >= 7) return { level: 'good', label: 'Buenas', emoji: '🏄', css: 'q-good' };
  if (score >= 4) return { level: 'fair', label: 'Regular', emoji: '🌊', css: 'q-fair' };
  return { level: 'poor', label: 'Difícil', emoji: '⚠️', css: 'q-poor' };
}

function getDailySummary(marine, weather, dayIndex) {
  const h = marine.hourly;
  const wS = weather?.hourly?.wind_speed_10m || [];

  // Get hours for this day (0-23 = day 0, 24-47 = day 1, etc.)
  const startIdx = dayIndex * 24;
  const endIdx = startIdx + 24;

  let maxWave = 0, avgPeriod = 0, avgDir = 0, count = 0;
  let maxEnergy = 0, bestPeriod = 0, bestDir = 0;
  let minTide = 999, maxTide = -999;

  for (let i = startIdx; i < endIdx && i < h.time.length; i++) {
    const wh = h.wave_height[i];
    const wp = h.wave_period[i];
    const wd = h.wave_direction[i];
    const tide = h.sea_level_height_msl[i];

    if (wh != null) {
      const whBr = wh * SHOALING_FACTOR;
      const wpCorr = wp != null ? wp * PERIOD_FACTOR : 0;
      if (whBr > maxWave) maxWave = whBr;
      if (wpCorr > bestPeriod) { bestPeriod = wpCorr; bestDir = wd; }
      const energy = wpCorr > 0 ? ENERGY_K * whBr * whBr * wpCorr : 0;
      if (energy > maxEnergy) maxEnergy = energy;
      avgPeriod += wpCorr;
      avgDir += wd || 0;
      count++;
    }
    if (tide != null) {
      if (tide < minTide) minTide = tide;
      if (tide > maxTide) maxTide = tide;
    }
  }

  const avgP = count > 0 ? avgPeriod / count : 0;
  const avgD = count > 0 ? avgDir / count : 0;
  const q = evalSurfQuality(maxWave, bestPeriod);

  return {
    maxWave: +maxWave.toFixed(1),
    bestPeriod: Math.round(bestPeriod),
    avgPeriod: Math.round(avgP),
    avgDir: Math.round(avgD),
    maxEnergy: Math.round(maxEnergy),
    minTide: minTide < 999 ? +minTide.toFixed(2) : null,
    maxTide: maxTide > -999 ? +maxTide.toFixed(2) : null,
    quality: q
  };
}

function buildDayCard(date, summary, isToday) {
  const dayName = isToday ? 'Hoy' : DAYS_SHORT[date.getDay()];
  const dayNum = date.getDate();
  const month = MONTHS_ES[date.getMonth()];

  return `
    <div class="day-card ${isToday ? 'day-card--today' : ''}">
      <div class="day-card-header">
        <div class="day-card-date">
          <span class="day-name">${dayName}</span>
          <span class="day-num">${dayNum} ${month}</span>
        </div>
        <span class="quality-dot ${summary.quality.css}">${summary.quality.emoji} ${summary.quality.label}</span>
      </div>

      <div class="day-card-metrics">
        <div class="bcm">
          <div class="bcm-icon"><i class="fas fa-water"></i></div>
          <div class="bcm-val">${summary.maxWave > 0 ? summary.maxWave.toFixed(1) : '--'}</div>
          <div class="bcm-lbl">Ola máx (m)</div>
        </div>
        <div class="bcm">
          <div class="bcm-icon"><i class="fas fa-clock"></i></div>
          <div class="bcm-val">${summary.bestPeriod > 0 ? summary.bestPeriod : '--'}</div>
          <div class="bcm-lbl">Período (s)</div>
        </div>
        <div class="bcm">
          <div class="bcm-icon"><i class="fas fa-compass"></i></div>
          <div class="bcm-val">${summary.avgDir > 0 ? degToCardinal(summary.avgDir) : '--'}</div>
          <div class="bcm-lbl">Dirección</div>
        </div>
        <div class="bcm">
          <div class="bcm-icon"><i class="fas fa-bolt"></i></div>
          <div class="bcm-val">${summary.maxEnergy > 0 ? summary.maxEnergy : '--'}</div>
          <div class="bcm-lbl">Energía (kJ)</div>
        </div>
      </div>

      <div class="day-card-tide">
        <div class="bct-row">
          <span class="bct-high"><i class="fas fa-arrow-up"></i> ${summary.maxTide != null ? summary.maxTide + ' m' : '--'}</span>
          <span class="bct-low"><i class="fas fa-arrow-down"></i> ${summary.minTide != null ? summary.minTide + ' m' : '--'}</span>
        </div>
      </div>
    </div>`;
}

async function loadBeachData() {
  const grid = document.getElementById('daysGrid');
  const errorEl = document.getElementById('forecastError');
  if (!grid) return;

  grid.innerHTML = '<div class="beach-loading"><div class="forecast-spinner"></div><p>Cargando datos del océano...</p></div>';
  errorEl.style.display = 'none';

  try {
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${BARRANQUITO.lat}&longitude=${BARRANQUITO.lon}&hourly=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,sea_level_height_msl&timezone=America%2FLima&forecast_days=4`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${BARRANQUITO.lat}&longitude=${BARRANQUITO.lon}&hourly=wind_speed_10m,wind_direction_10m&timezone=America%2FLima&forecast_days=4`;

    const [mRes, wRes] = await Promise.all([fetch(marineUrl), fetch(weatherUrl)]);
    const marine = await mRes.json();
    const weather = wRes.ok ? await wRes.json() : null;

    const now = new Date();
    const todayIdx = now.getDate();

    // Build 4 day cards
    let cards = '';
    for (let d = 0; d < 4; d++) {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() + d);
      const isToday = d === 0;
      const summary = getDailySummary(marine, weather, d);
      cards += buildDayCard(dayDate, summary, isToday);
    }

    grid.innerHTML = cards;
    document.getElementById('lastUpdated').textContent = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  } catch (err) {
    console.error('Forecast error:', err);
    grid.innerHTML = '';
    errorEl.style.display = 'block';
  }
}

loadBeachData();
setInterval(loadBeachData, 15 * 60 * 1000);

/* ===== EXPOSE TO WINDOW ===== */
window.loadBeachData = loadBeachData;
