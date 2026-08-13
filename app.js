/* ===== PAYMENT STATUS — MercadoPago return ===== */
window.scrollTo(0, 0);
const urlParams = new URLSearchParams(window.location.search);
const pagoStatus = urlParams.get('pago');
if (pagoStatus) {
  const messages = {
    exitoso: { icon: '✅', title: '¡Pago exitoso!', text: 'Tu pago fue procesado. Te enviaremos la confirmación por WhatsApp.' },
    fallo: { icon: '❌', title: 'Pago fallido', text: 'Hubo un problema con el pago. Intenta de nuevo o contacta por WhatsApp.' },
    pendiente: { icon: '⏳', title: 'Pago pendiente', text: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.' }
  };
  const msg = messages[pagoStatus];
  if (msg) {
    const toast = document.createElement('div');
    toast.className = 'payment-toast';
    toast.innerHTML = `<div class="payment-toast-content"><span class="payment-toast-icon">${msg.icon}</span><div><strong>${msg.title}</strong><p>${msg.text}</p></div><button class="payment-toast-close" onclick="this.parentElement.parentElement.remove()">×</button></div>`;
    document.body.prepend(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 8000);
    window.history.replaceState({}, '', window.location.pathname);
  }
}

/* ===== EMAILJS ===== */
emailjs.init({ publicKey: 'l7cB9DCkKYmalVubB' });

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

/* ===== PAYMENT SETUP ===== */
function setupMpPayment() {
  // Culqi is the only payment method - always visible
}

/* ===== CULQI — CHECKOUT EMPEBIDO ===== */
function payWithCulqi() {
  const d = window._reservaData;
  if (!d) return;

  Culqi.settings({
    title: 'Pacific Surf School',
    currency: 'PEN',
    amount: d.total * 100,
  });

  Culqi.open();
}

/* ===== ENVIAR EMAIL DE CONFIRMACIÓN (EmailJS) ===== */
function sendConfirmationEmail(data) {
  const reservationId = 'PSS-' + Date.now().toString(36).toUpperCase();
  const classNames = {
    individual: 'Clase Individual',
    grupal: 'Clase Grupal',
    paquete: 'Pack x4 Clases',
    paquete8: 'Pack x8 Clases',
    paquete12: 'Pack x12 Clases'
  };

  const templateParams = {
    nombre: data.nombre,
    email: data.email,
    clase: classNames[data.tipo] || data.tipo,
    fecha: data.fecha,
    horario: data.horario,
    precio: data.total,
    reserva: reservationId
  };

  return emailjs.send('service_pss05', 'template_yx981r7', templateParams)
    .then(res => console.log('Email enviado:', res))
    .catch(err => console.error('Error email:', err));
}

function culqiHandler() {
  if (Culqi.token) {
    const token = Culqi.token.id;
    const email = Culqi.token.email || '';
    Culqi.close();

    processCulqiPayment(token, email);
  } else if (Culqi.error) {
    console.error('Culqi error:', Culqi.error);
    if (Culqi.error.user_message) {
      alert(Culqi.error.user_message);
    }
  }
}

async function processCulqiPayment(token, email) {
  const d = window._reservaData;
  if (!d) return;

  const btn = document.getElementById('btnCulqiPay');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
  btn.style.pointerEvents = 'none';

  try {
    const res = await fetch('/api/culqi-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        amount: d.total * 100,
        email: email || 'cliente@pacificsurfschool.com',
        tipo: d.tipo,
        personas: d.personas,
        fecha: d.fecha,
        horario: d.horario,
        nombre: d.nombre
      })
    });

    const data = await res.json();

    if (data.success) {
      btn.innerHTML = '<i class="fas fa-check"></i> ¡Pago exitoso!';
      btn.classList.add('btn-success');
      sendConfirmationEmail({ ...d, email });
      setTimeout(() => {
        confirmarReserva();
      }, 1500);
    } else {
      alert(data.error || 'Error al procesar el pago. Intenta de nuevo.');
      btn.innerHTML = originalText;
      btn.style.pointerEvents = '';
    }
  } catch (err) {
    console.error('Culqi error:', err);
    alert('Error de conexión. Intenta de nuevo.');
    btn.innerHTML = originalText;
    btn.style.pointerEvents = '';
  }
}

window.culqi = culqiHandler;
window.payWithCulqi = payWithCulqi;

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

/* ===== SURF FORECAST — 4 DAY CARDS — MANUAL DATA ===== */

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

/* ===== DATOS MANUALES — EDITAR AQUÍ ===== */
/* Formato: cada objeto es un día consecutivo desde HOY */
/* olas: altura máxima en metros | periodo: segundos | direccion: grados (N=0, E=90, S=180, W=270) | energia: kJ | marea_alta: metros | marea_baja: metros */
const FORECAST_DATA = [
  { olas: 1.3, periodo: 9, direccion: 180, energia: 257, marea_alta: 0.52, marea_baja: 0.37 },
  { olas: 1.1, periodo: 15, direccion: 225, energia: 496, marea_alta: 0.95, marea_baja: 0.07 },
  { olas: 1.3, periodo: 14, direccion: 202, energia: 578, marea_alta: 1.02, marea_baja: 0.02 },
  { olas: 1.2, periodo: 15, direccion: 202, energia: 576, marea_alta: 1.06, marea_baja: 0.0 },
  { olas: 1.6, periodo: 14, direccion: 202, energia: 1002, marea_alta: 1.06, marea_baja: 0.0 },
  { olas: 1.0, periodo: 12, direccion: 202, energia: 318, marea_alta: 0.66, marea_baja: 0.0 },
  { olas: 0.8, periodo: 19, direccion: 225, energia: 488, marea_alta: 0.69, marea_baja: 0.11 },
];
/* ===== FIN DATOS MANUALES ===== */

function buildDayCard(date, data, isToday) {
  const dayName = isToday ? 'Hoy' : DAYS_SHORT[date.getDay()];
  const dayNum = date.getDate();
  const month = MONTHS_ES[date.getMonth()];
  const quality = evalSurfQuality(data.olas, data.periodo);

  return `
    <div class="day-card ${isToday ? 'day-card--today' : ''}">
      <div class="day-card-header">
        <div class="day-card-date">
          <span class="day-name">${dayName}</span>
          <span class="day-num">${dayNum} ${month}</span>
        </div>
        <span class="quality-dot ${quality.css}">${quality.emoji} ${quality.label}</span>
      </div>

      <div class="day-card-metrics">
        <div class="bcm">
          <div class="bcm-icon"><i class="fas fa-water"></i></div>
          <div class="bcm-val">${data.olas}</div>
          <div class="bcm-lbl">Ola máx (m)</div>
        </div>
        <div class="bcm">
          <div class="bcm-icon"><i class="fas fa-clock"></i></div>
          <div class="bcm-val">${data.periodo}</div>
          <div class="bcm-lbl">Período (s)</div>
        </div>
        <div class="bcm">
          <div class="bcm-icon"><i class="fas fa-compass"></i></div>
          <div class="bcm-val">${degToCardinal(data.direccion)}</div>
          <div class="bcm-lbl">Dirección</div>
        </div>
        <div class="bcm">
          <div class="bcm-icon"><i class="fas fa-bolt"></i></div>
          <div class="bcm-val">${data.energia}</div>
          <div class="bcm-lbl">Energía (kJ)</div>
        </div>
      </div>

      <div class="day-card-tide">
        <div class="bct-row">
          <span class="bct-high"><i class="fas fa-arrow-up"></i> ${data.marea_alta} m</span>
          <span class="bct-low"><i class="fas fa-arrow-down"></i> ${data.marea_baja} m</span>
        </div>
      </div>
    </div>`;
}

function loadBeachData() {
  const grid = document.getElementById('daysGrid');
  const errorEl = document.getElementById('forecastError');
  if (!grid) return;

  errorEl.style.display = 'none';

  const now = new Date();
  let cards = '';

  for (let d = 0; d < 4; d++) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() + d);
    const isToday = d === 0;
    cards += buildDayCard(dayDate, FORECAST_DATA[d], isToday);
  }

  grid.innerHTML = cards;
}

loadBeachData();

/* ===== GALLERY CAROUSEL ===== */
let carouselIndex = 0;
let carouselTimer = null;
let galleryPaused = false;
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  const dotsContainer = document.getElementById('carouselDots');
  const section = document.querySelector('.gallery-carousel');
  if (!track || !dotsContainer || !section) return;
  const slides = track.querySelectorAll('.carousel-slide');
  const total = slides.length;
  dotsContainer.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }
  function update() {
    track.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
  }
  function goToSlide(n) { carouselIndex = n; update(); resetTimer(); }
  function getInterval() { return window.innerWidth <= 768 ? 6000 : 4000; }
  function resetTimer() { clearInterval(carouselTimer); carouselTimer = setInterval(() => { if (!galleryPaused) { carouselIndex = (carouselIndex + 1) % total; update(); } }, getInterval()); }
  function stopTimer() { clearInterval(carouselTimer); }
  function pause() { galleryPaused = true; stopTimer(); }
  function resume() { galleryPaused = false; resetTimer(); }
  window.moveCarousel = function(dir) { carouselIndex = (carouselIndex + dir + total) % total; update(); resetTimer(); };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { resetTimer(); }
      else { stopTimer(); }
    });
  }, { threshold: 0.3 });
  observer.observe(section);
  let touchStartX = 0;
  section.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; pause(); }, { passive: true });
  section.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) window.moveCarousel(diff > 0 ? 1 : -1);
    setTimeout(resume, 4000);
  }, { passive: true });
  section.addEventListener('mouseenter', pause);
  section.addEventListener('mouseleave', resume);
}
document.addEventListener('DOMContentLoaded', initCarousel);

/* ===== CLASES CAROUSEL AUTO-SCROLL ===== */
function initClasesCarousel() {
  const track = document.querySelector('.clases-track');
  if (!track) return;
  const cards = track.querySelectorAll('.clase-card');
  const total = cards.length;
  let idx = 0;
  let timer = null;
  let isPaused = false;

  function getVisible() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 860) return 2;
    return 1;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function slide() {
    if (isPaused || isMobile()) return;
    const visible = getVisible();
    const maxIdx = Math.max(0, total - visible);
    const card = cards[0];
    if (!card) return;
    const gap = 20;
    const cardW = card.offsetWidth + gap;

    track.style.transition = 'transform 0.5s ease';
    track.style.transform = 'translateX(-' + (idx * cardW) + 'px)';
    idx++;

    if (idx > maxIdx) {
      setTimeout(() => {
        track.style.transition = 'none';
        idx = 0;
        track.style.transform = 'translateX(0)';
      }, 520);
    }
  }

  function resetTimer() {
    clearInterval(timer);
    if (!isMobile()) {
      timer = setInterval(slide, 4000);
    }
  }

  function pause() { isPaused = true; clearInterval(timer); }
  function resume() { isPaused = false; resetTimer(); }

  if (!isMobile()) {
    slide();
    resetTimer();
  }

  const carousel = track.closest('.clases-carousel');
  if (carousel) {
    if (!isMobile()) {
      carousel.addEventListener('mouseenter', pause);
      carousel.addEventListener('mouseleave', resume);
    }

    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    carousel.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      isDragging = true;
      if (!isMobile()) pause();
    }, { passive: true });

    carousel.addEventListener('touchmove', e => {
      if (!isDragging) return;
      touchEndX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        const visible = getVisible();
        const maxIdx = Math.max(0, total - visible);
        track.style.transition = 'transform 0.5s ease';
        if (diff > 0) {
          idx++;
          if (idx > maxIdx) idx = 0;
        } else {
          idx--;
          if (idx < 0) idx = maxIdx;
        }
        const card = cards[0];
        if (card) {
          const gap = 20;
          const cardW = card.offsetWidth + gap;
          track.style.transform = 'translateX(-' + (idx * cardW) + 'px)';
        }
      }
      setTimeout(resume, 3000);
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    idx = 0;
    track.style.transition = 'none';
    if (isMobile()) {
      clearInterval(timer);
      track.style.transform = 'translateX(0)';
    } else {
      slide();
      resetTimer();
    }
  });
}
document.addEventListener('DOMContentLoaded', initClasesCarousel);

/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}
document.addEventListener('DOMContentLoaded', initScrollAnimations);

/* ===== EXPOSE TO WINDOW ===== */
window.loadBeachData = loadBeachData;
