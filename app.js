/* ===== IMAGE SYNC — corrige .jpg → .jpeg automáticamente ===== */
document.querySelectorAll('img[src^="img/"]').forEach(img => {
  img.addEventListener('error', function() {
    const src = this.getAttribute('src');
    // Intentar con .jpeg si falla .jpg o .png
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

const hamburger = document.getElementById('hamburger');
const navInner = document.querySelector('.nav-inner');
hamburger.addEventListener('click', () => navInner.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navInner.classList.remove('open'));
});

/* ===== FADE-UP ON SCROLL ===== */
const fadeEls = document.querySelectorAll(
  '.clase-card, .reason, .gal-item, .stat-item, .faq-item'
);
fadeEls.forEach(el => el.classList.add('fade-up'));
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => observer.observe(el));

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
let currentStep = 1;

const precios = { individual: 'S/ 120', grupal: 'S/ 70', paquete: 'S/ 300', trip: 'S/ 180' };
const nombres = { individual: 'Clase Individual', grupal: 'Clase Grupal', paquete: 'Pack x5 Clases', trip: 'Surf Trip' };

function openModal(tipo) {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  goToStep(1);
  if (tipo) {
    const radio = document.querySelector(`input[name="tipoClase"][value="${tipo}"]`);
    if (radio) radio.checked = true;
  }
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function goToStep(n) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`paso${i}`).classList.toggle('hidden', i !== n);
    const dot = document.getElementById(`step-dot-${i}`);
    dot.classList.remove('active', 'done');
    if (i === n) dot.classList.add('active');
    if (i < n) dot.classList.add('done');
  }
  document.querySelectorAll('.step-line').forEach((line, idx) => {
    line.classList.toggle('done', idx < n - 1);
  });
  currentStep = n;
}

function nextStep(n) {
  if (n === 2) {
    const tipo = document.querySelector('input[name="tipoClase"]:checked');
    if (!tipo) { alert('Por favor selecciona un tipo de clase.'); return; }
  }
  if (n === 3) {
    const fecha = document.getElementById('res-fecha').value;
    const turno = document.querySelector('input[name="turno"]:checked');
    if (!fecha) { alert('Por favor selecciona una fecha.'); return; }
    if (!turno) { alert('Por favor selecciona un turno (Mañana o Tarde).'); return; }
  }
  if (n === 4) {
    const nombre = document.getElementById('res-nombre').value.trim();
    const wsp = document.getElementById('res-wsp').value.trim();
    const nivel = document.getElementById('res-nivel').value;
    if (!nombre) { alert('Por favor ingresa tu nombre.'); return; }
    if (!wsp) { alert('Por favor ingresa tu WhatsApp.'); return; }
    if (!nivel) { alert('Por favor selecciona tu nivel de surf.'); return; }
    buildResumen();
  }
  goToStep(n);
}

/* turno → horarios */
document.querySelectorAll('input[name="turno"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const sel = document.getElementById('res-horario');
    const horariosMañana = ['7:00 am', '9:00 am', '11:00 am'];
    const horariosTarde = ['2:00 pm', '4:00 pm'];
    const lista = radio.value === 'mañana' ? horariosMañana : horariosTarde;
    sel.innerHTML = lista.map(h => `<option value="${h}">${h}</option>`).join('');
  });
});

/* min date */
const fechaInput = document.getElementById('res-fecha');
if (fechaInput) fechaInput.min = new Date().toISOString().split('T')[0];

function buildResumen() {
  const tipo = document.querySelector('input[name="tipoClase"]:checked')?.value;
  const fecha = document.getElementById('res-fecha').value;
  const turno = document.querySelector('input[name="turno"]:checked')?.value;
  const horario = document.getElementById('res-horario').value;
  const nombre = document.getElementById('res-nombre').value.trim();
  const wsp = document.getElementById('res-wsp').value.trim();
  const nivel = document.getElementById('res-nivel').value;
  const personas = document.getElementById('res-personas').value;

  const fechaFmt = fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

  document.getElementById('resumenBox').innerHTML = `
    <p><span>Clase:</span> <strong>${nombres[tipo] || tipo}</strong></p>
    <p><span>Fecha:</span> ${fechaFmt}</p>
    <p><span>Turno:</span> ${turno} · ${horario}</p>
    <p><span>Personas:</span> ${personas}</p>
    <p><span>Nombre:</span> ${nombre}</p>
    <p><span>WhatsApp:</span> ${wsp}</p>
    <p><span>Nivel:</span> ${nivel}</p>
    <p><span>Total estimado:</span> ${precios[tipo] || ''} / persona</p>
  `;

  // store for whatsapp
  window._reservaData = { tipo, fecha: fechaFmt, turno, horario, nombre, wsp, nivel, personas, precio: precios[tipo] };
}

function confirmarReserva() {
  const d = window._reservaData;
  if (!d) return;
  const msg = encodeURIComponent(
    `¡Hola! Quiero reservar una clase en Pacific Surf School 🏄\n\n` +
    `*Clase:* ${nombres[d.tipo]}\n` +
    `*Fecha:* ${d.fecha}\n` +
    `*Turno:* ${d.turno} · ${d.horario}\n` +
    `*Personas:* ${d.personas}\n` +
    `*Nivel:* ${d.nivel}\n` +
    `*Precio estimado:* ${d.precio} / persona\n\n` +
    `*Mi nombre:* ${d.nombre}\n` +
    `*WhatsApp:* ${d.wsp}`
  );
  window.open(`https://wa.me/51915168620?text=${msg}`, '_blank');
}
