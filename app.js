window.scrollTo(0, 0);

/* ===== WHATSAPP FLOAT (JS — inline styles for mobile reliability) ===== */
(function() {
  var wa = document.createElement('a');
  wa.href = 'https://wa.me/message/Z3HDXG2KB5VZL1';
  wa.target = '_blank';
  wa.setAttribute('aria-label', 'Contactar por WhatsApp');
  wa.setAttribute('role', 'button');
  wa.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;width:58px;height:58px;border-radius:50%;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.6rem;box-shadow:0 4px 20px rgba(37,211,102,0.5);text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;will-change:transform;transform:translateZ(0);-webkit-transform:translateZ(0);';
  wa.innerHTML = '<i class="fab fa-whatsapp"></i>';
  wa.addEventListener('mouseenter', function(){ this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 30px rgba(37,211,102,0.6)'; });
  wa.addEventListener('mouseleave', function(){ this.style.transform='translateZ(0)'; this.style.boxShadow='0 4px 20px rgba(37,211,102,0.5)'; });
  document.body.appendChild(wa);
  if (window.innerWidth <= 480) {
    wa.style.width = '52px';
    wa.style.height = '52px';
    wa.style.fontSize = '1.4rem';
    wa.style.bottom = '16px';
    wa.style.right = '16px';
  }
  if (window.innerWidth <= 360) {
    wa.style.width = '48px';
    wa.style.height = '48px';
    wa.style.fontSize = '1.3rem';
    wa.style.bottom = '14px';
    wa.style.right = '14px';
  }
})();

/* ===== EMAILJS ===== */
if (typeof emailjs !== 'undefined' && emailjs.init) {
  emailjs.init({ publicKey: 'l7cB9DCkKYmalVubB' });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof emailjs !== 'undefined' && emailjs.init) {
      emailjs.init({ publicKey: 'l7cB9DCkKYmalVubB' });
    }
  });
  window.addEventListener('load', () => {
    if (typeof emailjs !== 'undefined' && emailjs.init && !emailjs._initialized) {
      try { emailjs.init({ publicKey: 'l7cB9DCkKYmalVubB' }); } catch(e) {}
    }
  });
}

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

/* ===== SCROLL PROGRESS BAR ===== */
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.prepend(scrollProgress);

/* ===== COMBINED SCROLL LISTENER (throttled with rAF) ===== */
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      scrollProgress.style.width = pct + '%';
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const navInner = document.querySelector('.nav-inner');
const navBackdrop = document.getElementById('navBackdrop');

function openMobileMenu() {
  if (!navInner || !hamburger) return;
  navInner.classList.add('open');
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  if (navbar) navbar.classList.add('menu-open');
  if (navBackdrop) navBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  if (!navInner || !hamburger) return;
  navInner.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  if (navbar) navbar.classList.remove('menu-open');
  if (navBackdrop) navBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}
window.closeMobileMenu = closeMobileMenu;

if (hamburger && navInner) {
  hamburger.addEventListener('click', () => {
    if (navInner.classList.contains('open')) closeMobileMenu();
    else openMobileMenu();
  });
  if (navBackdrop) navBackdrop.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navInner.classList.contains('open')) closeMobileMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navInner.classList.contains('open')) closeMobileMenu();
  }, { passive: true });
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

/* ===== MODAL ===== */
const overlay = document.getElementById('modalOverlay');
const modal = overlay.querySelector('.modal');
let currentStep = 1;

const precios = { individual: 150, grupal: 110, videoanalisis: 180, paquete: 400, paquete8: 720, paquete12: 1020 };
const nombres = { individual: 'Clase Privada', grupal: 'Clase Grupal', videoanalisis: 'Plan Surf + Video Análisis', paquete: 'Pack x4 Clases', paquete8: 'Pack x8 Clases', paquete12: 'Pack x12 Clases' };

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
      const personasField = document.getElementById('personas-field');
      const personasSel = document.getElementById('res-personas');
      if (personasField) {
        personasField.style.display = tipo === 'grupal' ? '' : 'none';
        if (tipo === 'grupal' && personasSel) personasSel.value = '2';
      }
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
  const personasField = document.getElementById('personas-field');
  if (personasField) personasField.style.display = 'none';
  window._horarioSeleccionado = null;
  clearErrors();
  window._reservaData = null;
}

overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

document.querySelectorAll('input[name="tipoClase"]').forEach(r => {
  r.addEventListener('change', () => {
    const personasField = document.getElementById('personas-field');
    const personasSel = document.getElementById('res-personas');
    if (personasField) {
      const isGrupal = r.value === 'grupal';
      personasField.style.display = isGrupal ? '' : 'none';
      if (isGrupal && personasSel) personasSel.value = '2';
    }
  });
});

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
    const email = document.getElementById('res-email');
    const peso = document.getElementById('res-peso');
    const altura = document.getElementById('res-altura');
    const experiencia = document.getElementById('res-experiencia');
    const nivel = document.getElementById('res-nivel');
    const pago = document.getElementById('res-pago');

    if (!nombre.value.trim()) { showError(nombre, 'Ingresa tu nombre'); return; }
    if (!wsp.value.trim()) { showError(wsp, 'Ingresa tu WhatsApp'); return; }
    if (!wsp.value.match(/^[\d\s\+\-]{7,15}$/)) { showError(wsp, 'Formato inválido'); return; }
    if (!email.value.trim()) { showError(email, 'Ingresa tu correo electrónico'); return; }
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showError(email, 'Correo electrónico inválido'); return; }
    if (!experiencia.value) { showError(experiencia, 'Selecciona tu experiencia'); return; }
    if (!nivel.value) { showError(nivel, 'Selecciona tu nivel'); return; }
    // Validación grupal: mínimo 2 personas
    const tipoSel = document.querySelector('input[name="tipoClase"]:checked')?.value;
    const personasSel = document.getElementById('res-personas');
    if (tipoSel === 'grupal') {
      const n = parseInt(personasSel?.value || '0', 10);
      if (isNaN(n) || n < 2) { showError(personasSel, 'Mínimo 2 personas para grupal'); return; }
      if (n > 5) { showError(personasSel, 'Máximo 5 personas para grupal'); return; }
    }
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
  const email = document.getElementById('res-email').value.trim();
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
    <p><span>Correo:</span> ${email}</p>
    ${peso ? `<p><span>Peso:</span> ${peso} kg</p>` : ''}
    ${altura ? `<p><span>Altura:</span> ${altura} cm</p>` : ''}
    <p><span>Experiencia:</span> ${experienciaFmt}</p>
    <p><span>Nivel:</span> ${nivelFmt}</p>
    <p><span>Medio de pago:</span> ${pagoFmt}</p>
    <p class="resumen-total"><span>Total a pagar:</span> <strong>S/ ${calculateTotalWithCommission(total)}</strong></p>
    <p class="resumen-nota" style="font-size:0.75rem;color:#888;margin-top:4px;">Incluye comisión de procesamiento</p>
  `;

  window._reservaData = {
    tipo, fecha: fechaFmt, horario, nombre, wsp, email, peso, altura,
    experiencia: experienciaFmt, nivel: nivelFmt, personas, pago: pagoFmt,
    precioUnit, total
  };
}

/* ===== CULQI — CHECKOUT EMPEBIDO ===== */
const CULQI_COMMISSION_RATE = 0.0344;
const CULQI_FIXED_FEE = 0.77;

function calculateTotalWithCommission(basePrice) {
  return Math.ceil((basePrice + CULQI_FIXED_FEE) / (1 - CULQI_COMMISSION_RATE));
}

function payWithCulqi() {
  const d = window._reservaData;
  if (!d) return;

  const totalWithCommission = calculateTotalWithCommission(d.total);
  d.totalConComision = totalWithCommission;

  Culqi.settings({
    title: 'Pacific Surf School',
    currency: 'PEN',
    amount: totalWithCommission * 100,
  });

  Culqi.open();
}

/* ===== ENVIAR EMAIL DE CONFIRMACIÓN (EmailJS) ===== */
function sendConfirmationEmail(data) {
  const reservationId = 'PSS-' + Date.now().toString(36).toUpperCase();
  const classNames = {
    individual: 'Clase Privada',
    grupal: 'Clase Grupal',
    videoanalisis: 'Plan Surf + Video Análisis',
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
  console.log('[Culqi] Callback recibido');

  if (typeof Culqi === 'undefined') {
    console.error('[Culqi] SDK no cargado');
    alert('Error: El sistema de pago no se cargó correctamente. Recarga la página.');
    return;
  }

  if (Culqi.token) {
    console.log('[Culqi] Token recibido:', Culqi.token.id);
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
  } else {
    console.warn('[Culqi] Callback sin token ni error');
  }
}

async function processCulqiPayment(token, email) {
  const d = window._reservaData;
  if (!d) {
    console.error('[Culqi] No hay datos de reserva');
    return;
  }

  const btn = document.getElementById('btnCulqiPay');
  if (!btn) return;

  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
  btn.style.pointerEvents = 'none';

  const finalAmount = d.totalConComision || calculateTotalWithCommission(d.total);
  const amountInCentavos = finalAmount * 100;

  console.log('[Culqi] Enviando pago:', { token, amount: amountInCentavos, email, tipo: d.tipo });

  try {
    const res = await fetch('/api/culqi-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        amount: amountInCentavos,
        email: email || d.email || 'cliente@pacificsurfschool.com',
        tipo: d.tipo,
        personas: d.personas,
        fecha: d.fecha,
        horario: d.horario,
        nombre: d.nombre,
        telefono: d.wsp || '',
        wsp: d.wsp || ''
      })
    });

    console.log('[Culqi] Respuesta HTTP:', res.status);
    const data = await res.json();
    console.log('[Culqi] Datos respuesta:', data);

    if (data.success) {
      btn.innerHTML = '<i class="fas fa-check"></i> ¡Pago exitoso!';
      btn.classList.add('btn-success');
      sendConfirmationEmail({ ...d, email, total: finalAmount });
      // Si se compró un PACK, el backend crea/actualiza la cuenta del portal
      if (data.cuenta && data.cuenta.email) {
        const passInfo = data.cuenta.creada
          ? `\n\n🎓 Tu cuenta del Portal Alumno fue creada:\nUsuario: ${data.cuenta.email}\nClave temporal: ${data.cuenta.passwordTemporal}\n\nEntra aquí: ${location.origin}/portal.html\nGuarda tu clave y marca tus días de clase.`
          : `\n\n🎓 Tu Pack se activó en tu cuenta (${data.cuenta.email}).\nEntra aquí: ${location.origin}/portal.html`;
        setTimeout(() => { alert('¡Pago exitoso!' + passInfo); }, 400);
      }
      setTimeout(() => {
        confirmarReserva();
      }, data.cuenta ? 2500 : 1500);
    } else {
      const errorMsg = data.error || 'Error al procesar el pago. Intenta de nuevo.';
      console.error('[Culqi] Error del servidor:', errorMsg);
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

window.culqi = culqiHandler;
window.payWithCulqi = payWithCulqi;
console.log('[Culqi] Handler registrado en window.culqi');

/* ===== CONFIRMAR RESERVA → WHATSAPP ===== */
function confirmarReserva() {
  const d = window._reservaData;
  if (!d) return;

  const finalPrice = d.totalConComision || calculateTotalWithCommission(d.total);

  const msg = encodeURIComponent(
    `Hola! Quiero reservar en Pacific Surf School\n\n` +
    `*Clase:* ${nombres[d.tipo]}\n` +
    `*Fecha:* ${d.fecha}\n` +
    `*Horario:* ${d.horario}\n` +
    `*Personas:* ${d.personas}\n` +
    `*Nombre:* ${d.nombre}\n` +
    `*WhatsApp:* ${d.wsp}\n` +
    `*Correo:* ${d.email}\n` +
    (d.peso ? `*Peso:* ${d.peso} kg\n` : '') +
    (d.altura ? `*Altura:* ${d.altura} cm\n` : '') +
    `*Experiencia:* ${d.experiencia}\n` +
    `*Nivel:* ${d.nivel}\n` +
    `*Medio de pago:* Culqi (tarjeta)\n` +
    `*Total pagado:* S/ ${finalPrice}`
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
  { olas: 0.8, periodo: 18, direccion: 225, energia: 108, marea_alta: 0.81, marea_baja: 0.2 },
  { olas: 0.8, periodo: 16, direccion: 225, energia: 99, marea_alta: 0.85, marea_baja: 0.17 },
  { olas: 0.7, periodo: 15, direccion: 225, energia: 130, marea_alta: 0.88, marea_baja: 0.14 },
  { olas: 0.7, periodo: 20, direccion: 202, energia: 241, marea_alta: 0.91, marea_baja: 0.13 },
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

  const lastUpdated = document.getElementById('lastUpdated');
  if (lastUpdated) {
    lastUpdated.textContent = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}

loadBeachData();

/* ===== GALLERY CAROUSEL — MODERNO + THUMBS + LIGHTBOX ===== */
let carouselIndex = 0;
let carouselTimer = null;
let galleryPaused = false;
function initCarousel() {
  const track = document.getElementById('galleryTrack') || document.querySelector('.carousel-track');
  const dotsContainer = document.getElementById('carouselDots');
  const counter = document.getElementById('galleryCounter');
  const progress = document.getElementById('galleryProgress');
  const thumbsWrap = document.getElementById('galleryThumbs');
  const section = document.querySelector('.gallery-carousel');
  if (!track || !dotsContainer || !section) return;
  const realSlides = Array.from(track.querySelectorAll('.carousel-slide'));
  const total = realSlides.length;
  if (total === 0) return;

  // — infinito sin fin: clona primera y última —
  const firstClone = realSlides[0].cloneNode(true);
  const lastClone = realSlides[total - 1].cloneNode(true);
  firstClone.classList.add('is-clone'); firstClone.setAttribute('aria-hidden','true');
  lastClone.classList.add('is-clone'); lastClone.setAttribute('aria-hidden','true');
  track.appendChild(firstClone);
  track.insertBefore(lastClone, realSlides[0]);
  const slides = track.querySelectorAll('.carousel-slide'); // ahora total+2
  let pos = 1; // posición en track con clones (1 = primer real)
  let isAnimating = false;
  track.style.transform = `translateX(-${pos * 100}%)`;

  // dots
  dotsContainer.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Imagen ${i + 1} de ${total}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goToReal(i));
    dotsContainer.appendChild(dot);
  }

  // thumbs (ocultos por CSS pero se mantienen por si se reactivan)
  if (thumbsWrap) {
    thumbsWrap.innerHTML = '';
    realSlides.forEach((sl, i) => {
      const img = sl.querySelector('img');
      const btn = document.createElement('button');
      btn.className = 'gallery-thumb' + (i === 0 ? ' active' : '');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Ver ${img?.alt || 'imagen ' + (i+1)}`);
      btn.innerHTML = `<img src="${img.src}" alt="" loading="lazy" decoding="async"/>`;
      btn.addEventListener('click', () => goToReal(i));
      thumbsWrap.appendChild(btn);
    });
  }

  function pad(n){ return String(n).padStart(2,'0'); }
  function syncUI() {
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
      const on = i === carouselIndex;
      d.classList.toggle('active', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (counter) counter.innerHTML = `<strong>${pad(carouselIndex+1)}</strong> / ${pad(total)}`;
    if (progress) progress.style.width = ((carouselIndex+1)/total*100)+'%';
    if (thumbsWrap) {
      thumbsWrap.querySelectorAll('.gallery-thumb').forEach((t,i) => t.classList.toggle('active', i===carouselIndex));
      const activeThumb = thumbsWrap.querySelector('.gallery-thumb.active');
      if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    syncLightbox();
  }
  function jumpWithoutAnim(newPos){
    track.style.transition = 'none';
    pos = newPos;
    track.style.transform = `translateX(-${pos * 100}%)`;
    // force reflow
    void track.offsetHeight;
    track.style.transition = '';
  }
  function goToReal(n, fromAuto=false){
    if (isAnimating) return;
    const targetReal = ((n % total) + total) % total;
    const targetPos = targetReal + 1;
    // si es salto directo por dot, sin pasar por clone
    if (!fromAuto && Math.abs(targetReal - carouselIndex) > 1 && !(targetReal===0 && carouselIndex===total-1) && !(targetReal===total-1 && carouselIndex===0)){
      // salto largo: sin animación infinita, directo
      isAnimating = true;
      track.style.transition = 'transform 0.45s cubic-bezier(0.33,1,0.68,1)';
      pos = targetPos;
      carouselIndex = targetReal;
      track.style.transform = `translateX(-${pos * 100}%)`;
      syncUI();
      setTimeout(()=>{ isAnimating=false; }, 500);
      if (!fromAuto) resetTimer();
      return;
    }
    // navegación secuencial infinita
    isAnimating = true;
    track.style.transition = 'transform 0.5s cubic-bezier(0.33,1,0.68,1)';
    // detecta si va al clone
    if (n >= total){ // siguiente después del último -> clone first
      pos = total + 1;
      track.style.transform = `translateX(-${pos * 100}%)`;
      carouselIndex = 0;
      syncUI();
      setTimeout(()=>{ jumpWithoutAnim(1); syncUI(); isAnimating=false; }, 520);
    } else if (n < 0){ // anterior antes del primero -> clone last
      pos = 0;
      track.style.transform = `translateX(-${pos * 100}%)`;
      carouselIndex = total - 1;
      syncUI();
      setTimeout(()=>{ jumpWithoutAnim(total); syncUI(); isAnimating=false; }, 520);
    } else {
      pos = targetPos;
      carouselIndex = targetReal;
      track.style.transform = `translateX(-${pos * 100}%)`;
      syncUI();
      setTimeout(()=>{ isAnimating=false; }, 510);
    }
    if (!fromAuto) resetTimer();
  }
  // compatibilidad: goToSlide solía ser módulo simple
  function goToSlide(n){ goToReal(n); }
  function getInterval(){ return window.innerWidth <= 768 ? 5500 : 4200; }
  function resetTimer(){
    clearInterval(carouselTimer);
    carouselTimer = setInterval(()=>{ if(!galleryPaused && !isAnimating){ goToReal(carouselIndex+1, true); } }, getInterval());
  }
  function stopTimer(){ clearInterval(carouselTimer); }
  function pause(){ galleryPaused=true; stopTimer(); }
  function resume(){ galleryPaused=false; resetTimer(); }
  window.moveCarousel = function(dir){ goToReal(carouselIndex+dir); };
  // autoplay visibility
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) resetTimer(); else stopTimer(); });
  },{threshold:0.3});
  observer.observe(section);
  let touchStartX=0;
  section.addEventListener('touchstart', e=>{ touchStartX=e.touches[0].clientX; pause(); },{passive:true});
  section.addEventListener('touchend', e=>{
    const diff=touchStartX - e.changedTouches[0].clientX;
    if(Math.abs(diff)>48) window.moveCarousel(diff>0?1:-1);
    setTimeout(resume, 3500);
  },{passive:true});
  section.addEventListener('mouseenter', pause);
  section.addEventListener('mouseleave', resume);
  // lightbox
  const lb = document.getElementById('galleryLightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');
  function syncLightbox(){
    if(!lb || !lbImg || lb.hidden) return;
    const sl = realSlides[carouselIndex];
    const img = sl.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = sl.querySelector('.slide-caption')?.textContent || img.alt;
    lbCounter.textContent = `${carouselIndex+1} / ${total}`;
  }
  function openLb(){
    if(!lb) return;
    pause();
    lb.hidden=false;
    document.body.style.overflow='hidden';
    syncLightbox();
  }
  function closeLb(){
    if(!lb) return;
    lb.hidden=true;
    document.body.style.overflow='';
    resume();
  }
  // click en slide real abre lightbox (ignora clones)
  realSlides.forEach((sl,i)=>{
    sl.addEventListener('click', ()=>{ goToReal(i); openLb(); });
  });
  document.getElementById('galleryExpand')?.addEventListener('click', openLb);
  document.getElementById('lbClose')?.addEventListener('click', closeLb);
  document.getElementById('lbPrev')?.addEventListener('click', ()=> goToReal(carouselIndex-1));
  document.getElementById('lbNext')?.addEventListener('click', ()=> goToReal(carouselIndex+1));
  lb?.addEventListener('click', (e)=>{ if(e.target===lb) closeLb(); });
  document.addEventListener('keydown', (e)=>{
    if(lb && !lb.hidden){
      if(e.key==='Escape') closeLb();
      if(e.key==='ArrowLeft') goToReal(carouselIndex-1);
      if(e.key==='ArrowRight') goToReal(carouselIndex+1);
    }
  });
  // bind nav
  document.getElementById('galleryPrevBtn')?.addEventListener('click', ()=> window.moveCarousel(-1));
  document.getElementById('galleryNextBtn')?.addEventListener('click', ()=> window.moveCarousel(1));
  // keyboard on section
  section.setAttribute('tabindex','0');
  section.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowLeft'){ e.preventDefault(); window.moveCarousel(-1); }
    if(e.key==='ArrowRight'){ e.preventDefault(); window.moveCarousel(1); }
  });
  syncUI();
}
document.addEventListener('DOMContentLoaded', initCarousel);

/* ===== CLASES — SIN FIN (igual que galería, clones + transform) ===== */
let claseIdx = 0;
let clasePos = 0;
let claseIsAnimating = false;
let claseClonesCount = 0;
let claseTotalReal = 0;
let clasesUIBound = false; // listeners globales (botones/drag/resize) se enlazan una sola vez

function claseGetVisible() {
  const w = window.innerWidth;
  if (w >= 1024) return 3;
  return 1;
}
function claseGetGap(track) {
  const g = parseFloat(getComputedStyle(track).gap || getComputedStyle(track).columnGap || '16');
  return isNaN(g) ? 16 : g;
}
function claseGetStep(track){
  const card = track.querySelector('.clase-card:not(.is-clone)');
  return (card ? card.offsetWidth : 300) + claseGetGap(track);
}
function claseGetPages(){
  return Math.max(1, claseTotalReal - claseGetVisible() + 1);
}
function claseSyncUI(){
  const dotsWrap = document.getElementById('clasesDots');
  const counter = document.getElementById('clasesCounter');
  const track = document.getElementById('clasesTrack') || document.querySelector('.clases-track');
  const pages = claseGetPages();
  if (dotsWrap){
    dotsWrap.querySelectorAll('.dot').forEach((d,i)=>{
      const on = i === claseIdx;
      d.classList.toggle('active', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  if (counter) counter.innerHTML = `<strong>${String(claseIdx+1).padStart(2,'0')}</strong> / ${String(pages).padStart(2,'0')}`;
  if (track){
    const realCards = track.querySelectorAll('.clase-card:not(.is-clone)');
    realCards.forEach((c,i)=>{
      const on = i >= claseIdx && i < claseIdx + claseGetVisible();
      c.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
  }
}
function claseJumpWithoutAnim(track, newPos){
  track.style.transition = 'none';
  clasePos = newPos;
  const step = claseGetStep(track);
  track.style.transform = `translateX(-${clasePos * step}px)`;
  void track.offsetHeight;
  track.style.transition = '';
}
function claseGoToReal(n, fromAuto=false){
  const track = document.getElementById('clasesTrack') || document.querySelector('.clases-track');
  if (!track || claseIsAnimating) return;
  const pages = claseGetPages();
  const targetReal = ((n % pages) + pages) % pages;
  // salto largo por dot clic directo
  const isJump = !fromAuto && Math.abs(targetReal - claseIdx) > 1 && !(targetReal===0 && claseIdx===pages-1) && !(targetReal===pages-1 && claseIdx===0);
  if (isJump){
    claseIsAnimating = true;
    track.style.transition = 'transform 0.45s cubic-bezier(0.33,1,0.68,1)';
    claseIdx = targetReal;
    clasePos = claseClonesCount + targetReal;
    track.style.transform = `translateX(-${clasePos * claseGetStep(track)}px)`;
    claseSyncUI();
    setTimeout(()=>{ claseIsAnimating=false; }, 470);
    if (!fromAuto) resetClasesTimer();
    window._claseIdx = claseIdx;
    return;
  }
  // secuencia infinita con clones
  claseIsAnimating = true;
  track.style.transition = 'transform 0.5s cubic-bezier(0.33,1,0.68,1)';
  const step = claseGetStep(track);
  if (n >= pages){ // más allá del final -> clone del inicio
    clasePos = claseClonesCount + pages;
    track.style.transform = `translateX(-${clasePos * step}px)`;
    claseIdx = 0;
    claseSyncUI();
    setTimeout(()=>{ claseJumpWithoutAnim(track, claseClonesCount); claseSyncUI(); claseIsAnimating=false; }, 520);
  } else if (n < 0){ // antes del inicio -> clone del final
    clasePos = claseClonesCount - 1;
    track.style.transform = `translateX(-${clasePos * step}px)`;
    claseIdx = pages - 1;
    claseSyncUI();
    setTimeout(()=>{ claseJumpWithoutAnim(track, claseClonesCount + pages - 1); claseSyncUI(); claseIsAnimating=false; }, 520);
  } else {
    claseIdx = targetReal;
    clasePos = claseClonesCount + targetReal;
    track.style.transform = `translateX(-${clasePos * step}px)`;
    claseSyncUI();
    setTimeout(()=>{ claseIsAnimating=false; }, 510);
  }
  window._claseIdx = claseIdx;
  if (!fromAuto) resetClasesTimer();
}
function claseCarouselPrev(){ claseGoToReal(claseIdx - 1); }
function claseCarouselNext(){ claseGoToReal(claseIdx + 1); }

let clasesTimer = null;
let clasesPaused = false;
let clasesRaf = null;
// Desactivado: el desplazamiento continuo (~28px/s) hacía que tras la 3ª card
// se tardara ~12s en cruzar el clon y se percibiera un vacío. Se usa autoplay por pasos.
let clasesContinuous = false;
let clasesOffsetPx = 0;
function resetClasesTimer(){
  clearInterval(clasesTimer);
  cancelAnimationFrame(clasesRaf);
  const pages = claseGetPages();
  if (pages <= 1){ // 3 cards en desktop = sin carrusel
    const ctr = document.getElementById('clasesCounter');
    const dots = document.getElementById('clasesDots');
    if (ctr) ctr.style.display = 'none';
    if (dots) dots.style.display = 'none';
    document.getElementById('clasePrevBtn')?.style.setProperty('display','none');
    document.getElementById('claseNextBtn')?.style.setProperty('display','none');
    return;
  }
  // restaura controles si estaban ocultos
  const ctr2 = document.getElementById('clasesCounter');
  const dots2 = document.getElementById('clasesDots');
  if (ctr2) ctr2.style.display = '';
  if (dots2) dots2.style.display = '';
  document.getElementById('clasePrevBtn')?.style.setProperty('display','');
  document.getElementById('claseNextBtn')?.style.setProperty('display','');
  if (clasesContinuous){
    startClasesContinuous();
    return;
  }
  const iv = window.innerWidth <= 768 ? 3500 : 4000;
  clasesTimer = setInterval(()=>{ if(!clasesPaused && !claseIsAnimating) claseGoToReal(claseIdx+1, true); }, iv);
}
function startClasesContinuous(){
  const track = document.getElementById('clasesTrack') || document.querySelector('.clases-track');
  if (!track) return;
  cancelAnimationFrame(clasesRaf);
  const pages = claseGetPages();
  if (pages <= 1) return;
  const step = claseGetStep(track);
  const totalPx = pages * step;
  let last = performance.now();
  const speed = window.innerWidth <= 768 ? 0.028 : 0.035; // px/ms ~ 28-35 px/s
  function tick(now){
    if (clasesPaused || claseIsAnimating){ clasesRaf = requestAnimationFrame(tick); last = now; return; }
    const delta = now - last;
    last = now;
    // avanza continuo
    clasesOffsetPx += delta * speed;
    // sincroniza idx según offset
    const prog = clasesOffsetPx / step;
    const newIdx = Math.floor(prog) % pages;
    if (newIdx !== claseIdx){
      claseIdx = newIdx;
      window._claseIdx = claseIdx;
      claseSyncUI();
    }
    // aplica transform continuo: pos base + offset fraccional
    const basePos = claseClonesCount * step;
    const x = basePos + clasesOffsetPx;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${x}px)`;
    if (clasesOffsetPx >= totalPx){
      clasesOffsetPx -= totalPx;
    }
    clasesRaf = requestAnimationFrame(tick);
  }
  clasesOffsetPx = claseIdx * step;
  clasesRaf = requestAnimationFrame(tick);
}
function stopClasesContinuous(){ cancelAnimationFrame(clasesRaf); clearInterval(clasesTimer); }
function pauseClases(){ clasesPaused=true; stopClasesContinuous(); }
function resumeClases(){ clasesPaused=false; resetClasesTimer(); }

function initClasesCarousel() {
  const track = document.getElementById('clasesTrack') || document.querySelector('.clases-track');
  if (!track) return;
  const carousel = track.closest('.clases-carousel');
  const dotsWrap = document.getElementById('clasesDots');
  const prevBtn = document.getElementById('clasePrevBtn');
  const nextBtn = document.getElementById('claseNextBtn');

  // guarda reales (solo visibles, excluye hidden) y limpia clones previos
  track.querySelectorAll('.is-clone').forEach(n=>n.remove());
  const realCards = Array.from(track.querySelectorAll('.clase-card:not([hidden]):not([style*="display: none"])'));
  claseTotalReal = realCards.length;
  if (claseTotalReal === 0) return;
  const visible = claseGetVisible();
  claseClonesCount = visible;
  const pages = claseGetPages();

  // crea clones
  const fragStart = document.createDocumentFragment();
  const fragEnd = document.createDocumentFragment();
  for (let i = claseTotalReal - visible; i < claseTotalReal; i++){
    const idx = (i + claseTotalReal) % claseTotalReal;
    const c = realCards[idx].cloneNode(true);
    c.classList.add('is-clone', 'visible'); c.classList.remove('fade-up');
    c.setAttribute('aria-hidden','true');
    fragStart.appendChild(c);
  }
  for (let i = 0; i < visible; i++){
    const c = realCards[i % claseTotalReal].cloneNode(true);
    c.classList.add('is-clone', 'visible'); c.classList.remove('fade-up');
    c.setAttribute('aria-hidden','true');
    fragEnd.appendChild(c);
  }
  track.prepend(fragStart);
  track.append(fragEnd);

  // — interactividad: card clic + teclado + tilt sutil (sin info nueva) —
  realCards.forEach(card=>{
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.setAttribute('aria-label', `Reservar ${card.querySelector('h3')?.textContent?.trim() || 'clase'}`);
    card.addEventListener('click', e=>{
      if (e.target.closest('.btn-reservar-card')) return;
      const tipo = card.dataset.clase;
      if (tipo) openModal(tipo);
    });
    card.addEventListener('keydown', e=>{
      if (e.key==='Enter' || e.key===' '){ e.preventDefault(); const t=card.dataset.clase; if(t) openModal(t); }
    });
    // tilt 3D sutil solo desktop con hover
    if (window.matchMedia('(hover:hover)').matches){
      card.addEventListener('mousemove', e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX - r.left)/r.width - 0.5;
        const y=(e.clientY - r.top)/r.height - 0.5;
        card.style.transform=`translateY(-8px) rotateY(${x*5}deg) rotateX(${-y*5}deg) scale(1.015)`;
      });
      card.addEventListener('mouseleave', ()=>{ card.style.transform=''; });
    }
  });

  // dots
  if (dotsWrap){
    dotsWrap.innerHTML='';
    for(let i=0;i<pages;i++){
      const b=document.createElement('button');
      b.className='dot'+(i===0?' active':'');
      b.type='button';
      b.setAttribute('role','tab');
      b.setAttribute('aria-label',`Grupo ${i+1} de ${pages}`);
      b.setAttribute('aria-selected', i===0?'true':'false');
      b.addEventListener('click', ()=> claseGoToReal(i));
      dotsWrap.appendChild(b);
    }
  }

  // pos inicial
  const startIdx = typeof window._claseIdx==='number' ? Math.max(0, Math.min(pages-1, window._claseIdx)) : 0;
  claseIdx = startIdx;
  clasePos = claseClonesCount + startIdx;
  track.style.transition='none';
  track.style.transform=`translateX(-${clasePos * claseGetStep(track)}px)`;
  void track.offsetHeight;
  track.style.transition='';
  claseSyncUI();

  if (prevBtn && !clasesUIBound) prevBtn.addEventListener('click', claseCarouselPrev);
  if (nextBtn && !clasesUIBound) nextBtn.addEventListener('click', claseCarouselNext);

  if (carousel && !clasesUIBound){
    carousel.setAttribute('tabindex','0');
    carousel.addEventListener('keydown', e=>{
      if(e.key==='ArrowLeft'){ e.preventDefault(); claseCarouselPrev(); }
      if(e.key==='ArrowRight'){ e.preventDefault(); claseCarouselNext(); }
    });
    carousel.addEventListener('mouseenter', pauseClases);
    carousel.addEventListener('mouseleave', resumeClases);
  }

  // drag (solo una vez; usa step recalculado en cada gesto)
  if (!clasesUIBound) {
  let isDown=false, startX=0, startPosPx=0, moved=false;
  const getTx = ()=> clasePos * claseGetStep(track);
  track.addEventListener('pointerdown', e=>{
    if(e.pointerType==='touch') return;
    isDown=true; moved=false;
    track.classList.add('is-dragging');
    track.setPointerCapture(e.pointerId);
    startX=e.clientX;
    startPosPx=getTx();
    track.style.transition='none';
    pauseClases();
  });
  track.addEventListener('pointermove', e=>{
    if(!isDown) return;
    const dx=e.clientX - startX;
    if(Math.abs(dx)>5) moved=true;
    track.style.transform=`translateX(-${startPosPx - dx}px)`;
  });
  const endDrag = e=>{
    if(!isDown) return;
    isDown=false;
    track.classList.remove('is-dragging');
    track.style.transition='';
    if(e) try{ track.releasePointerCapture(e.pointerId);}catch(_){}
    const dx = e ? (e.clientX - startX) : 0;
    if(Math.abs(dx) > 40){
      if(dx < 0) claseGoToReal(claseIdx+1);
      else claseGoToReal(claseIdx-1);
    } else {
      track.style.transition='transform 0.35s ease';
      track.style.transform=`translateX(-${clasePos * claseGetStep(track)}px)`;
    }
    setTimeout(resumeClases, 2500);
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('click', e=>{ if(moved){ e.preventDefault(); e.stopPropagation(); moved=false; } }, true);

  // touch swipe
  let tStart=0;
  track.addEventListener('touchstart', e=>{ tStart=e.touches[0].clientX; pauseClases(); }, {passive:true});
  track.addEventListener('touchend', e=>{
    const diff=tStart - e.changedTouches[0].clientX;
    if(Math.abs(diff)>48) claseGoToReal(diff>0?claseIdx+1:claseIdx-1);
    setTimeout(resumeClases, 3000);
  }, {passive:true});
  } // fin drag/touch (solo primera vez)

  // autoplay + visibility
  if (carousel && !carousel.dataset.clasesObs){
    carousel.dataset.clasesObs = '1';
    const obs=new IntersectionObserver(ents=>{
      ents.forEach(en=>{ if(en.isIntersecting) resetClasesTimer(); else clearInterval(clasesTimer); });
    },{threshold:0.3});
    obs.observe(carousel);
  }

  // resize rebuild
  if (!clasesUIBound) {
  let rT;
  window.addEventListener('resize', ()=>{
    clearTimeout(rT);
    rT=setTimeout(()=>{
      const newVisible = claseGetVisible();
      if(newVisible !== claseClonesCount){
        // rebuild clones si cambia visible
        initClasesCarousel();
        return;
      }
      track.style.transition='none';
      track.style.transform=`translateX(-${clasePos * claseGetStep(track)}px)`;
      void track.offsetHeight;
      track.style.transition='';
      // dots si cambió pages
      const newPages = claseGetPages();
      if(dotsWrap && dotsWrap.children.length !== newPages){
        dotsWrap.innerHTML='';
        for(let i=0;i<newPages;i++){
          const b=document.createElement('button');
          b.className='dot'+(i===claseIdx?' active':'');
          b.type='button';
          b.setAttribute('role','tab');
          b.addEventListener('click', ()=> claseGoToReal(i));
          dotsWrap.appendChild(b);
        }
        claseSyncUI();
      }
    },120);
  }, {passive:true});
  } // fin guard clasesUIBound
  clasesUIBound = true;

  resetClasesTimer();
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
window.claseCarouselPrev = claseCarouselPrev;
window.claseCarouselNext = claseCarouselNext;
