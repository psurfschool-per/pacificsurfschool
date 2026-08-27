window.scrollTo(0, 0);

/* ===== EMAILJS INITIALIZATION ===== */
function initEmailJS() {
  if (typeof emailjs !== 'undefined' && emailjs.init) {
    try {
      emailjs.init({ publicKey: 'l7cB9DCkKYmalVubB' });
    } catch (e) {
      console.warn('[EmailJS] Init warning:', e);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailJS);
} else {
  initEmailJS();
}

/* ===== NAVBAR & SCROLL BEHAVIOR ===== */
const navbar = document.getElementById('navbar');
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.prepend(scrollProgress);

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
      }
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      scrollProgress.style.width = pct + '%';
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

/* ===== MOBILE MENU (HAMBURGER) ===== */
const hamburger = document.getElementById('hamburger');
const navInner = document.querySelector('.nav-inner');
if (hamburger && navInner) {
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
}

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

/* ==========================================================================
   RESERVAS & MODAL CONTROLLER
   ========================================================================== */
const overlay = document.getElementById('modalOverlay');
const modal = overlay ? overlay.querySelector('.modal') : null;
let currentStep = 1;
let selectedHorario = null;
let reservaData = null;

const precios = { individual: 150, grupal: 110, paquete: 400, paquete8: 720, paquete12: 1020 };
const nombres = { individual: 'Clase Individual', grupal: 'Clase Grupal', paquete: 'Pack x4 Clases', paquete8: 'Pack x8 Clases', paquete12: 'Pack x12 Clases' };

const horariosLunesASabado = ['6:00 am', '8:00 am', '10:00 am', '11:30 am', '2:00 pm', '4:00 pm'];
const horariosDomingo = ['8:00 am', '10:00 am'];
const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const CULQI_COMMISSION_RATE = 0.0344;
const CULQI_FIXED_FEE = 0.77;

function calculateTotalWithCommission(basePrice) {
  return Math.ceil((basePrice + CULQI_FIXED_FEE) / (1 - CULQI_COMMISSION_RATE));
}

function openModal(tipo) {
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetModal();
  goToStep(1);
  if (tipo) {
    const radio = document.querySelector(`input[name="tipoClase"][value="${tipo}"]`);
    if (radio) {
      radio.checked = true;
      radio.closest('.opt-card')?.classList.add('selected');
      const personasField = document.getElementById('personas-field');
      if (personasField) {
        personasField.style.display = tipo === 'grupal' ? '' : 'none';
      }
    }
  }
}

function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function resetModal() {
  if (!overlay) return;
  overlay.querySelectorAll('input[type="radio"]').forEach(r => {
    r.checked = false;
    r.closest('.opt-card')?.classList.remove('selected');
  });
  overlay.querySelectorAll('input[type="text"], input[type="tel"], input[type="date"], input[type="number"]').forEach(i => i.value = '');
  overlay.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  const horariosWrap = document.getElementById('horarios-wrap');
  if (horariosWrap) horariosWrap.style.display = 'none';
  const personasField = document.getElementById('personas-field');
  if (personasField) personasField.style.display = 'none';
  selectedHorario = null;
  clearErrors();
  reservaData = null;
}

function goToStep(n) {
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`paso${i}`);
    if (step) {
      step.classList.toggle('hidden', i !== n);
      if (i === n) step.classList.add('modal-step-active');
    }
    const dot = document.getElementById(`step-dot-${i}`);
    if (dot) {
      dot.classList.remove('active', 'done');
      if (i === n) dot.classList.add('active');
      if (i < n) dot.classList.add('done');
    }
  }
  document.querySelectorAll('.step-line').forEach((line, idx) => {
    line.classList.toggle('done', idx < n - 1);
  });
  currentStep = n;
  if (modal) modal.scrollTop = 0;
}

function clearErrors() {
  if (!overlay) return;
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
      if (firstCard) {
        firstCard.classList.add('shake');
        setTimeout(() => firstCard.classList.remove('shake'), 500);
      }
      return;
    }
  }

  if (n === 3) {
    const fecha = document.getElementById('res-fecha');
    if (!fecha || !fecha.value) {
      if (fecha) showError(fecha, 'Selecciona una fecha');
      return;
    }
    if (!selectedHorario) {
      const grid = document.getElementById('horarios-grid');
      if (grid) {
        grid.classList.add('shake');
        setTimeout(() => grid.classList.remove('shake'), 500);
      }
      return;
    }
  }

  if (n === 4) {
    const nombre = document.getElementById('res-nombre');
    const wsp = document.getElementById('res-wsp');
    const email = document.getElementById('res-email');
    const experiencia = document.getElementById('res-experiencia');
    const nivel = document.getElementById('res-nivel');

    if (!nombre.value.trim()) { showError(nombre, 'Ingresa tu nombre'); return; }
    if (!wsp.value.trim()) { showError(wsp, 'Ingresa tu WhatsApp'); return; }
    if (!wsp.value.match(/^[\d\s\+\-]{7,15}$/)) { showError(wsp, 'Formato inválido'); return; }
    if (!email.value.trim()) { showError(email, 'Ingresa tu correo electrónico'); return; }
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showError(email, 'Correo electrónico inválido'); return; }
    if (!experiencia.value) { showError(experiencia, 'Selecciona tu experiencia'); return; }
    if (!nivel.value) { showError(nivel, 'Selecciona tu nivel'); return; }
    buildResumen();
  }

  goToStep(n);
}

/* ===== DATE & DYNAMIC HOURS PICKER ===== */
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

    if (horariosLabel) {
      horariosLabel.textContent = `Horarios disponibles — ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`;
    }
    if (horariosGrid) {
      horariosGrid.innerHTML = horarios.map(h =>
        `<button type="button" class="horario-btn" data-hora="${h}">${h}</button>`
      ).join('');

      horariosGrid.querySelectorAll('.horario-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          horariosGrid.querySelectorAll('.horario-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedHorario = btn.dataset.hora;
        });
      });
    }

    if (horariosWrap) horariosWrap.style.display = 'block';
    selectedHorario = null;
  });
}

/* ===== RADIO CARD INTERACTION ===== */
if (overlay) {
  overlay.querySelectorAll('.clase-opt input').forEach(radio => {
    radio.addEventListener('change', () => {
      const group = radio.closest('.clase-options');
      if (group) {
        group.querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
      }
      radio.closest('.opt-card')?.classList.add('selected');
    });
  });

  overlay.querySelectorAll('input[name="tipoClase"]').forEach(r => {
    r.addEventListener('change', () => {
      const personasField = document.getElementById('personas-field');
      if (personasField) {
        personasField.style.display = r.value === 'grupal' ? '' : 'none';
      }
    });
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

/* ===== BUILD RESUMEN ===== */
function buildResumen() {
  const tipo = document.querySelector('input[name="tipoClase"]:checked')?.value || 'individual';
  const fecha = document.getElementById('res-fecha')?.value || '';
  const horario = selectedHorario || '';
  const nombre = document.getElementById('res-nombre')?.value.trim() || '';
  const wsp = document.getElementById('res-wsp')?.value.trim() || '';
  const email = document.getElementById('res-email')?.value.trim() || '';
  const peso = document.getElementById('res-peso')?.value || '';
  const altura = document.getElementById('res-altura')?.value || '';
  const experiencia = document.getElementById('res-experiencia')?.value || '';
  const nivel = document.getElementById('res-nivel')?.value || '';
  const personas = document.getElementById('res-personas')?.value || '1';
  const pago = document.getElementById('res-pago')?.value || 'culqi';

  const fechaFmt = fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : '';

  const precioUnit = precios[tipo] || 0;
  const numPersonas = parseInt(personas, 10) || 1;
  const total = precioUnit * numPersonas;

  const experienciaFmt = { nunca: 'Nunca', pocas: '1-3 veces', algunas: '4-10 veces', frecuente: 'Frecuente' }[experiencia] || experiencia;
  const nivelFmt = { principiante: 'Principiante', basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }[nivel] || nivel;
  const pagoFmt = { culqi: 'Tarjeta / Yape' }[pago] || pago;

  const resumenBox = document.getElementById('resumenBox');
  if (resumenBox) {
    resumenBox.innerHTML = `
      <p><span>Clase:</span> <strong>${nombres[tipo] || tipo}</strong></p>
      <p><span>Fecha:</span> ${fechaFmt}</p>
      <p><span>Horario:</span> ${horario}</p>
      <p><span>Personas:</span> ${personas}</p>
      <p><span>Nombre:</span> ${nombre}</p>
      <p><span>WhatsApp:</span> ${wsp}</p>
      <p><span>Correo:</span> ${email}</p>
      ${peso ? `<p><span>Peso:</span> ${peso} kg</p>` : ''}
      ${altura ? `<p><span>Altura:</span> ${altura} cm</p>` : ''}
      <p><span>Experiencia:</span> ${experienciaFmt}</p>
      <p><span>Nivel:</span> ${nivelFmt}</p>
      <p><span>Medio de pago:</span> ${pagoFmt}</p>
      <p class="resumen-total"><span>Total a pagar:</span> <strong>S/ ${calculateTotalWithCommission(total)}</strong></p>
      <p class="resumen-nota" style="font-size:0.75rem;color:#888;margin-top:4px;">Incluye comisión de procesamiento</p>
    `;
  }

  reservaData = {
    tipo, fecha: fechaFmt, horario, nombre, wsp, email, peso, altura,
    experiencia: experienciaFmt, nivel: nivelFmt, personas, pago: pagoFmt,
    precioUnit, total
  };
}

/* ===== CULQI PAYMENTS ===== */
function payWithCulqi() {
  if (!reservaData) return;

  const totalWithCommission = calculateTotalWithCommission(reservaData.total);
  reservaData.totalConComision = totalWithCommission;

  if (typeof Culqi !== 'undefined') {
    Culqi.settings({
      title: 'Pacific Surf School',
      currency: 'PEN',
      amount: totalWithCommission * 100,
    });
    Culqi.open();
  } else {
    alert('El módulo de pagos no está disponible en este momento. Por favor contacta por WhatsApp.');
  }
}

function sendConfirmationEmail(data) {
  const reservationId = 'PSS-' + Date.now().toString(36).toUpperCase();
  const templateParams = {
    nombre: data.nombre,
    email: data.email,
    clase: nombres[data.tipo] || data.tipo,
    fecha: data.fecha,
    horario: data.horario,
    precio: data.total,
    reserva: reservationId
  };

  if (typeof emailjs !== 'undefined' && emailjs.send) {
    return emailjs.send('service_pss05', 'template_yx981r7', templateParams)
      .then(res => console.log('[EmailJS] Enviado:', res))
      .catch(err => console.error('[EmailJS] Error:', err));
  }
  return Promise.resolve();
}

async function processCulqiPayment(token, email) {
  if (!reservaData) {
    console.error('[Culqi] No hay datos de reserva');
    return;
  }

  const btn = document.getElementById('btnCulqiPay');
  if (!btn) return;

  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
  btn.style.pointerEvents = 'none';

  const finalAmount = reservaData.totalConComision || calculateTotalWithCommission(reservaData.total);
  const amountInCentavos = finalAmount * 100;

  try {
    const res = await fetch('/api/culqi-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        amount: amountInCentavos,
        email: email || 'cliente@pacificsurfschool.com',
        tipo: reservaData.tipo,
        personas: reservaData.personas,
        fecha: reservaData.fecha,
        horario: reservaData.horario,
        nombre: reservaData.nombre
      })
    });

    const data = await res.json();
    if (data.success) {
      btn.innerHTML = '<i class="fas fa-check"></i> ¡Pago exitoso!';
      btn.classList.add('btn-success');
      sendConfirmationEmail({ ...reservaData, email, total: finalAmount });
      setTimeout(() => {
        confirmarReserva();
      }, 1500);
    } else {
      const errorMsg = data.error || 'Error al procesar el pago. Intenta de nuevo.';
      alert(errorMsg);
      btn.innerHTML = originalText;
      btn.style.pointerEvents = '';
    }
  } catch (err) {
    console.error('[Culqi] Error de conexión:', err);
    alert('Error de conexión con el servidor. Intenta de nuevo.');
    btn.innerHTML = originalText;
    btn.style.pointerEvents = '';
  }
}

function culqiHandler() {
  if (typeof Culqi === 'undefined') return;

  if (Culqi.token) {
    const token = Culqi.token.id;
    const email = Culqi.token.email || '';
    Culqi.close();
    processCulqiPayment(token, email);
  } else if (Culqi.error) {
    console.error('[Culqi] Error:', Culqi.error);
    const msg = Culqi.error.user_message || 'Error al procesar el pago. Intenta de nuevo.';
    alert(msg);
    const btn = document.getElementById('btnCulqiPay');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-credit-card"></i> Pagar ahora';
      btn.style.pointerEvents = '';
    }
  }
}

// Global hook required by Culqi Checkout v4 script
window.culqi = culqiHandler;

/* ===== CONFIRMAR RESERVA VIA WHATSAPP ===== */
function confirmarReserva() {
  if (!reservaData) return;

  const finalPrice = reservaData.totalConComision || calculateTotalWithCommission(reservaData.total);
  const msg = encodeURIComponent(
    `Hola! Quiero reservar en Pacific Surf School\n\n` +
    `*Clase:* ${nombres[reservaData.tipo]}\n` +
    `*Fecha:* ${reservaData.fecha}\n` +
    `*Horario:* ${reservaData.horario}\n` +
    `*Personas:* ${reservaData.personas}\n` +
    `*Nombre:* ${reservaData.nombre}\n` +
    `*WhatsApp:* ${reservaData.wsp}\n` +
    `*Correo:* ${reservaData.email}\n` +
    (reservaData.peso ? `*Peso:* ${reservaData.peso} kg\n` : '') +
    (reservaData.altura ? `*Altura:* ${reservaData.altura} cm\n` : '') +
    `*Experiencia:* ${reservaData.experiencia}\n` +
    `*Nivel:* ${reservaData.nivel}\n` +
    `*Medio de pago:* Culqi (tarjeta)\n` +
    `*Total pagado:* S/ ${finalPrice}`
  );

  const btn = document.getElementById('btnWhatsapp');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Redirigiendo...';
    btn.classList.add('btn-success');
  }

  setTimeout(() => {
    window.open(`https://wa.me/51915168620?text=${msg}`, '_blank');
    setTimeout(() => {
      closeModal();
      if (btn) {
        btn.innerHTML = '<i class="fab fa-whatsapp"></i> Confirmar por WhatsApp';
        btn.classList.remove('btn-success');
      }
    }, 1500);
  }, 600);
}

/* ===== AGREGAR A GOOGLE CALENDAR ===== */
function addToCalendar() {
  if (!reservaData) return;

  const dateStr = reservaData.fecha.replace(/(\d+).*?(\d+).*?(\d+)/, (_, y, m, day) => {
    const months = { enero:'01', febrero:'02', marzo:'03', abril:'04', mayo:'05', junio:'06',
      julio:'07', agosto:'08', septiembre:'09', octubre:'10', noviembre:'11', diciembre:'12' };
    return `${y}-${months[m] || '01'}-${day.padStart(2,'0')}`;
  });

  const timeMap = {
    '6:00 am':'0600', '8:00 am':'0800', '10:00 am':'1000', '11:30 am':'1130',
    '2:00 pm':'1400', '4:00 pm':'1600'
  };
  const timeClean = reservaData.horario.replace(/\./g, '');
  const start_time = timeMap[timeClean] || '0800';
  const end_time = String(parseInt(start_time, 10) + 200).padStart(4, '0');

  const dates = `${dateStr.replace(/-/g,'')}T${start_time}00/${dateStr.replace(/-/g,'')}T${end_time}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Clase de Surf - ${nombres[reservaData.tipo]}`,
    dates,
    location: 'Playa Barranquito, Lima, Peru',
    details: `Reserva en Pacific Surf School\nClase: ${nombres[reservaData.tipo]}\nHorario: ${reservaData.horario}\nPersonas: ${reservaData.personas}\nNombre: ${reservaData.nombre}`
  });

  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
}

/* ==========================================================================
   EVENT DELEGATION & MODAL BINDINGS (NO INLINE ONCLICK)
   ========================================================================== */
function setupEventDelegation() {
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open-modal]');
    if (openBtn) {
      e.preventDefault();
      const tipo = openBtn.getAttribute('data-open-modal') || undefined;
      openModal(tipo);
      return;
    }

    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) {
      e.preventDefault();
      closeModal();
      return;
    }

    const nextBtn = e.target.closest('[data-next-step]');
    if (nextBtn) {
      e.preventDefault();
      const step = parseInt(nextBtn.getAttribute('data-next-step'), 10);
      nextStep(step);
      return;
    }

    const backBtn = e.target.closest('[data-step]');
    if (backBtn) {
      e.preventDefault();
      const step = parseInt(backBtn.getAttribute('data-step'), 10);
      goToStep(step);
      return;
    }
  });

  const btnCulqi = document.getElementById('btnCulqiPay');
  if (btnCulqi) {
    btnCulqi.addEventListener('click', (e) => {
      e.preventDefault();
      payWithCulqi();
    });
  }

  const btnCalendar = document.getElementById('btnCalendar');
  if (btnCalendar) {
    btnCalendar.addEventListener('click', (e) => {
      e.preventDefault();
      addToCalendar();
    });
  }

  const btnWhatsapp = document.getElementById('btnWhatsapp');
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', (e) => {
      e.preventDefault();
      confirmarReserva();
    });
  }

  const btnRetry = document.getElementById('btnForecastRetry');
  if (btnRetry) {
    btnRetry.addEventListener('click', (e) => {
      e.preventDefault();
      loadBeachData();
    });
  }
}

/* ==========================================================================
   SURF FORECAST — 4 DAY CARDS
   ========================================================================== */
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

const FORECAST_DATA = [
  { olas: 0.8, periodo: 18, direccion: 225, energia: 108, marea_alta: 0.81, marea_baja: 0.2 },
  { olas: 0.8, periodo: 16, direccion: 225, energia: 99, marea_alta: 0.85, marea_baja: 0.17 },
  { olas: 0.7, periodo: 15, direccion: 225, energia: 130, marea_alta: 0.88, marea_baja: 0.14 },
  { olas: 0.7, periodo: 20, direccion: 202, energia: 241, marea_alta: 0.91, marea_baja: 0.13 },
];

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

  if (errorEl) errorEl.style.display = 'none';

  const now = new Date();
  let cards = '';

  for (let d = 0; d < 4; d++) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() + d);
    const isToday = d === 0;
    cards += buildDayCard(dayDate, FORECAST_DATA[d], isToday);
  }

  grid.innerHTML = cards;

  const lastUpdated = document.getElementById('lastUpdated');
  if (lastUpdated) {
    lastUpdated.textContent = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}

/* ==========================================================================
   CAROUSELS
   ========================================================================== */
function initGalleryCarousel() {
  const track = document.querySelector('.carousel-track');
  const dotsContainer = document.getElementById('carouselDots');
  const section = document.querySelector('.gallery-carousel');
  if (!track || !dotsContainer || !section) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const total = slides.length;
  let carouselIndex = 0;
  let carouselTimer = null;
  let galleryPaused = false;

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

  function goToSlide(n) {
    carouselIndex = n;
    update();
    resetTimer();
  }

  function moveCarousel(dir) {
    carouselIndex = (carouselIndex + dir + total) % total;
    update();
    resetTimer();
  }

  function getInterval() {
    return window.innerWidth <= 768 ? 6000 : 4000;
  }

  function resetTimer() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
      if (!galleryPaused) {
        carouselIndex = (carouselIndex + 1) % total;
        update();
      }
    }, getInterval());
  }

  function stopTimer() {
    clearInterval(carouselTimer);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) resetTimer();
      else stopTimer();
    });
  }, { threshold: 0.3 });
  observer.observe(section);

  let touchStartX = 0;
  section.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    galleryPaused = true;
    stopTimer();
  }, { passive: true });

  section.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) moveCarousel(diff > 0 ? 1 : -1);
    setTimeout(() => {
      galleryPaused = false;
      resetTimer();
    }, 4000);
  }, { passive: true });

  section.addEventListener('mouseenter', () => { galleryPaused = true; stopTimer(); });
  section.addEventListener('mouseleave', () => { galleryPaused = false; resetTimer(); });

  const prevBtn = document.getElementById('galleryPrevBtn');
  const nextBtn = document.getElementById('galleryNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));
}

function initClasesCarousel() {
  const track = document.querySelector('.clases-track');
  if (!track) return;

  const prevBtn = document.getElementById('clasePrevBtn');
  const nextBtn = document.getElementById('claseNextBtn');
  let claseIdx = 0;

  function getVisible() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 860) return 2;
    return 1;
  }

  function move(dir) {
    const cards = track.querySelectorAll('.clase-card');
    const total = cards.length;
    const visible = getVisible();
    const maxIdx = Math.max(0, total - visible);
    const card = cards[0];
    if (!card) return;
    const cardW = card.offsetWidth + 20;

    claseIdx += dir;
    if (claseIdx < 0) claseIdx = maxIdx;
    if (claseIdx > maxIdx) claseIdx = 0;

    track.style.transition = 'transform 0.5s ease';
    track.style.transform = `translateX(-${claseIdx * cardW}px)`;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => move(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => move(1));

  const carousel = track.closest('.clases-carousel');
  if (carousel) {
    let touchStartX = 0;
    let isDragging = false;

    carousel.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    carousel.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        move(diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      claseIdx = 0;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
    }, 150);
  }, { passive: true });
}

/* ==========================================================================
   SCROLL ANIMATIONS
   ========================================================================== */
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

/* ===== INIT ALL ===== */
document.addEventListener('DOMContentLoaded', () => {
  setupEventDelegation();
  loadBeachData();
  initGalleryCarousel();
  initClasesCarousel();
  initScrollAnimations();
});
