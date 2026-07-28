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
const preciosFmt = { individual: 'S/ 150', grupal: 'S/ 110', paquete: 'S/ 400', paquete8: 'S/ 720', paquete12: 'S/ 1020' };
const nombres = { individual: 'Clase Individual', grupal: 'Clase Grupal', paquete: 'Pack x4 Clases', paquete8: 'Pack x8 Clases', paquete12: 'Pack x12 Clases' };

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
  overlay.querySelectorAll('input[type="text"], input[type="tel"], input[type="date"]').forEach(i => i.value = '');
  overlay.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  const horario = document.getElementById('res-horario');
  if (horario) horario.innerHTML = '<option value="">Seleccionar turno primero</option>';
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
      if (firstCard) firstCard.classList.add('shake');
      setTimeout(() => firstCard?.classList.remove('shake'), 500);
      return;
    }
  }

  if (n === 3) {
    const fecha = document.getElementById('res-fecha');
    const turno = document.querySelector('input[name="turno"]:checked');
    if (!fecha.value) { showError(fecha, 'Selecciona una fecha'); return; }
    if (!turno) {
      overlay.querySelectorAll('.turno-options .opt-card').forEach(c => {
        c.classList.add('shake');
        setTimeout(() => c.classList.remove('shake'), 500);
      });
      return;
    }
    const horario = document.getElementById('res-horario');
    if (!horario.value) { showError(horario, 'Selecciona un horario'); return; }
  }

  if (n === 4) {
    const nombre = document.getElementById('res-nombre');
    const wsp = document.getElementById('res-wsp');
    const nivel = document.getElementById('res-nivel');
    if (!nombre.value.trim()) { showError(nombre, 'Ingresa tu nombre'); return; }
    if (!wsp.value.trim()) { showError(wsp, 'Ingresa tu WhatsApp'); return; }
    if (!wsp.value.match(/^[\d\s\+\-]{7,15}$/)) { showError(wsp, 'Formato de WhatsApp inválido'); return; }
    if (!nivel.value) { showError(nivel, 'Selecciona tu nivel'); return; }
    buildResumen();
  }

  goToStep(n);
}

/* ===== TURNO → HORARIOS ===== */
document.querySelectorAll('input[name="turno"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const sel = document.getElementById('res-horario');
    const horariosMañana = ['6:00 am', '8:00 am', '10:00 am'];
    const horariosTarde = ['4:00 pm', '6:00 pm'];
    const lista = radio.value === 'mañana' ? horariosMañana : horariosTarde;
    sel.innerHTML = '<option value="">Seleccionar horario</option>' +
      lista.map(h => `<option value="${h}">${h}</option>`).join('');
  });
});

/* ===== MIN DATE ===== */
const fechaInput = document.getElementById('res-fecha');
if (fechaInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  fechaInput.min = `${yyyy}-${mm}-${dd}`;
  fechaInput.max = `${yyyy + 1}-${mm}-${dd}`;
}

/* ===== RADIO SELECTION VISUAL ===== */
overlay.querySelectorAll('.clase-opt input, .turno-opt input').forEach(radio => {
  radio.addEventListener('change', () => {
    const group = radio.closest('.clase-options, .turno-options');
    group.querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
    radio.closest('.opt-card').classList.add('selected');
  });
});

/* ===== BUILD RESUMEN ===== */
function buildResumen() {
  const tipo = document.querySelector('input[name="tipoClase"]:checked')?.value;
  const fecha = document.getElementById('res-fecha').value;
  const turno = document.querySelector('input[name="turno"]:checked')?.value;
  const horario = document.getElementById('res-horario').value;
  const nombre = document.getElementById('res-nombre').value.trim();
  const wsp = document.getElementById('res-wsp').value.trim();
  const nivel = document.getElementById('res-nivel').value;
  const personas = document.getElementById('res-personas').value;

  const fechaFmt = fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : '';

  const precioUnit = precios[tipo] || 0;
  const numPersonas = parseInt(personas) || 1;
  const total = precioUnit * numPersonas;

  const nivelFmt = {
    principiante: 'Principiante',
    basico: 'Básico',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado'
  }[nivel] || nivel;

  document.getElementById('resumenBox').innerHTML = `
    <p><span>Clase:</span> <strong>${nombres[tipo] || tipo}</strong></p>
    <p><span>Fecha:</span> ${fechaFmt}</p>
    <p><span>Turno:</span> ${turno === 'mañana' ? 'Mañana' : 'Tarde'} · ${horario}</p>
    <p><span>Personas:</span> ${personas}</p>
    <p><span>Nivel:</span> ${nivelFmt}</p>
    <p><span>Nombre:</span> ${nombre}</p>
    <p><span>WhatsApp:</span> ${wsp}</p>
    <p class="resumen-total"><span>Total estimado:</span> <strong>S/ ${total}</strong></p>
  `;

  window._reservaData = {
    tipo, fecha: fechaFmt, turno, horario, nombre, wsp, nivel: nivelFmt,
    personas, precioUnit, total
  };
}

/* ===== CONFIRMAR RESERVA → WHATSAPP ===== */
function confirmarReserva() {
  const d = window._reservaData;
  if (!d) return;

  const msg = encodeURIComponent(
    `Hola! Quiero reservar en Pacific Surf School\n\n` +
    `Clase: ${nombres[d.tipo]}\n` +
    `Fecha: ${d.fecha}\n` +
    `Turno: ${d.turno === 'mañana' ? 'Mañana' : 'Tarde'} - ${d.horario}\n` +
    `Personas: ${d.personas}\n` +
    `Nivel: ${d.nivel}\n` +
    `Precio unitario: S/ ${d.precioUnit}\n` +
    `Total: S/ ${d.total}\n\n` +
    `Nombre: ${d.nombre}\n` +
    `WhatsApp: ${d.wsp}`
  );

  /* success animation */
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

/* ===== EXPOSE TO WINDOW (module scope) ===== */
window.openModal = openModal;
window.closeModal = closeModal;
window.nextStep = nextStep;
window.confirmarReserva = confirmarReserva;
