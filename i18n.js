/* ===== I18N — ES / EN / DE (selector de idioma en la misma página) =====
   Cómo usarlo en HTML:
   - data-i18n="clave"              → reemplaza textContent
   - data-i18n-html="clave"         → reemplaza innerHTML (solo contenido estático de confianza)
   - data-i18n-placeholder="clave"  → reemplaza attribute placeholder
   - data-i18n-alt="clave"          → reemplaza attribute alt
   - data-i18n-aria="clave"         → reemplaza attribute aria-label
   - data-i18n-content="clave"      → reemplaza attribute content (meta tags)
   - Diccionario anidado: data-i18n="nav.inicio" ↔ dict.nav.inicio
   - Soporte de variables: t('modal.horarios', { dia: 'Lunes' }) con {dia} en la plantilla
*/

const dicts = {
es: {
  meta: {
    title: "Pacific Surf School – Playa Barranquito, Lima",
    desc: "Aprende a surfear desde cero en Lima con Pacific Surf School. Ofrecemos una experiencia 100% segura, divertida y personalizada en Playa Barranquito, Costa Verde (Lima). Incluimos todo el equipo de alta calidad (tabla y wetsuit) e instructores dedicados para clases individuales o grupales. Nos enfocamos en la mejor técnica, la máxima diversión y en que vivas una experiencia inolvidable en el mar, sin importar si es tu primera vez.",
    ogTitle: "Pacific Surf School – Clases de Surf en Playa Barranquito, Lima",
    ogDesc: "Aprende a surfear desde cero en Lima con Pacific Surf School. Experiencia 100% segura, divertida y personalizada en Playa Barranquito. Equipo incluido. Clases individuales o grupales.",
    twTitle: "Pacific Surf School – Clases de Surf en Playa Barranquito, Lima",
    twDesc: "Clases de surf individuales, grupales y packs en Playa Barranquito, Lima. Instructores certificados ISA."
  },
  nav: {
    menu: "Menú",
    inicio: "Inicio",
    clases: "Clases",
    nosotros: "Nosotros",
    galeria: "Galería",
    oleaje: "Oleaje",
    ubicacion: "Ubicación",
    faq: "FAQ",
    reservar: "Reservar Clase"
  },
  lang: {
    label: "Idioma",
    es: "Español",
    en: "English",
    de: "Deutsch"
  },
  hero: {
    title: "Clases de Surf<br>en <span class=\"highlight-yellow\">Lima</span>",
    strong: "Surfing por primera vez?",
    desc: "Aprende con instructores capacitados. Desde cero hasta el nivel avanzado en la costa verde, Lima.",
    langsLabel: "Clases en"
  },
  stats: {
    alumnos: "Alumnos formados",
    google: "Calificación Google",
    experiencia: "Años de experiencia"
  },
  clases: {
    tag: "Nuestras clases",
    h2: "Elige tu experiencia",
    desc: "Desde tu primera ola hasta maniobras avanzadas. Equipamiento completo incluido en todas las clases.",
    carouselLabel: "Clases de surf",
    prev: "Anterior",
    next: "Siguiente",
    dotsLabel: "Paginación de clases",
    dotAria: "Grupo {i} de {total}",
    cardAria: "Reservar {name}",
    hint: "Desliza o arrastra",
    reservar: "Reservar",
    perPersona: "/ persona",
    sesion: "/ sesión",
    pack: "/ pack",
    masPopular: "Más popular",
    badgeGrupal: "Grupal",
    badgePrivada: "Privada",
    badgeVideo: "Video Análisis",
    badgeP8: "Paquete x8",
    badgeP12: "Paquete x12",
    g_h3: "Clase Grupal",
    g_desc: "Aprende en un ambiente divertido. Grupos de 2 a 5 personas. Mín. 2.",
    i_h3: "Clase Privada",
    i_desc: "Atención 100% personalizada. Ideal para avanzar rápido o corregir técnica.",
    v_h3: "Plan Surf + Video Análisis",
    v_desc: "1 clase + análisis de video frame a frame para pulir tu técnica.",
    p8_h3: "Pack Full Grupal",
    p8_desc: "8 clases grupales para una transformación completa. Ahorra significativo.",
    p12_desc: "12 clases grupales. La mejor inversión para dominar el surf.",
    li_horas: "1.5 horas con instructor",
    li_equipo: "Tabla + traje de neopreno",
    li_niveles: "Todos los niveles",
    li_video: "Video análisis personalizado",
    li_8: "8 clases grupales",
    li_12: "12 clases grupales",
    altGrupal: "Clase Grupal de Surf",
    altPrivada: "Clase Privada de Surf",
    altVideo: "Plan Surf Video Análisis",
    altP8: "Pack Full Grupal x8",
    altP12: "Pack Full Grupal x12"
  },
  nosotros: {
    altImg: "Equipo Pacific Surf School en la playa",
    tag: "¿Por qué elegirnos?",
    h2: "Surf seguro, divertido y profesional",
    desc: "En Pacific Surf School combinamos seguridad, técnica y pasión por el océano. Cada clase está diseñada para que salgas del agua con una sonrisa y ganas de volver.",
    r1s: "Instructores certificados",
    r1p: "Instructores capacitados. Tu seguridad es primero.",
    r2s: "Grupos reducidos",
    r2p: "Máximo 5 alumnos por instructor para atención real.",
    r3s: "Equipo de primera",
    r3p: "Tablas de foam, neoprenos de calidad y leashes certificados.",
    r4s: "Fotos y video",
    r4p: "Capturamos tus mejores olas para que las recuerdes siempre.",
    r5s: "Playa Barranquito",
    r5p: "La playa ideal para aprender: olas perfectas para todos los niveles.",
    r6s: "Comunidad surf",
    r6p: "Únete a cientos de alumnos que ya forman parte de la familia PSS."
  },
  equipo: {
    nav: "Equipo",
    tag: "Nuestro equipo",
    h2: "Conoce a quien te enseña a surfear",
    desc: "Detrás de cada clase hay personas reales de Barranquito que viven por el surf. Este es el equipo que te espera en la arena.",
    role1: "Instructor certificado",
    bio1: "Surfea en Barranquito desde que tiene memoria. Especialista en principiantes: te hace reír en cada caída y te levanta con ganas de seguir.",
    role2: "Instructor",
    bio2: "Formado en técnica y seguridad en el agua. Su clase es la favorita de los grupos: energía, paciencia y muchas fotos de tus mejores olas.",
    role3: "Instructor",
    bio3: "Instructor de la escuela: paciente y especialista en que tus primeras olas sean seguras y divertidas.",
    alt1: "Rodri, instructor de Pacific Surf School",
    alt2: "Miguel, instructor de Pacific Surf School",
    alt3: "Elias, instructor de Pacific Surf School"
  },
  membresia: {
    nav: "Membresía",
    tag: "Membresía Pacific",
    h2: "Surfea más, paga menos",
    desc: "Un solo precio al mes con clases y beneficios extra para que vivas el surf toda la semana.",
    perMonth: "al mes",
    v30: "Vigencia: 30 días",
    incTitle: "Incluido en tu membresía",
    b1t: "4 clases grupales al mes",
    b1d: "Con instructor certificado y equipo incluido.",
    b2t: "Fotos y video de tus olas",
    b2d: "Grabamos tus mejores sesiones para que las compartas.",
    b3t: "10% de descuento en Camden",
    b3d: "En ponchos y accesorios de nuestro partner oficial.",
    b4t: "Reserva prioritaria",
    b4d: "Elige tus horarios antes que nadie cada semana.",
    b5t: "Invitado del mes",
    b5d: "Trae a un amigo a una clase sin costo adicional.",
    b6t: "Comunidad PSS",
    b6d: "Acceso a paseos de surf y eventos para miembros.",
    sticker: "🎉 Invitado del mes incluido",
    planTitle: "Tu plan mensual",
    planSub: "Todo lo que necesitas para surfear cada semana — vigencia de 30 días",
    priceSub: "al mes · 30 días",
    cta: "Reservar por WhatsApp"
  },
  resenas: {
    nav: "Reseñas",
    tag: "Reseñas",
    h2: "Lo que dicen nuestros alumnos",
    desc: "Experiencias reales de quienes ya se atrevieron a dar su primera ola con nosotros.",
    googleCount: "21 reseñas en Google",
    srcGoogle: "Reseña de Google",
    date1: "Abr 2025",
    date2: "Jun 2024",
    q1: "We had the best experience with pacific!! Gabriel and all the coaches were very attentive and skilled. We always felt super safe and made progress pretty quickly. We would totally recommend it! Thank youu we had so much fun!",
    q2: "La mejor escuela de la costa verde con precios cómodos y variados, los coaches son los mejores y te paras en la primera clase. RECOMENDADO!!!",
    q3: "Con Pacific no solo aprendi a surfear de una manera segura con coach altamente calificados, tambien encontre una comunidad compuestas por profes y alumnos, que nos ayudamos y compartimos tanto dentro como fuera del agua, Pacific Surf School 100% recomendada",
    q4: "Una excelente escuela! Los coaches son super capos, y saben como llegar al alumno. Un excelente deporte para que todos disfruten.",
    q5: "Muy recomendable!. Gabriel, el coach, siempre muy atento con sus alumnos y se preocupa porque estén y se sientan seguros en el mar. Incluso es un excelente profesor para niños.",
    q6: "La mejor escuela, te hacen surfear desde el día 1, los profesores son amigables y super profesionales, lleven toalla y chanclas 😎 el resto te lo da la escuela incluido en el pago.",
    q7: "Un éxito… me encantan las clases dan sigan así por favor. Que el frío no los detenga!!",
    q8: "The perfect activity if you are visiting Lima: you could go surfing in the morning, enjoy a nice lunch, and explore the city in the afternoon / evening. The school will provide you with the full equipment, so you just need to wear comfortable clothes and bring a small water bottle. The coaches are very friendly, patient, and professional. The perfect choice for both beginners and experienced surfers."
  },
  galeria: {
    tag: "Galería",
    h2: "La experiencia en imágenes",
    descPrefix: "¿Listo para tu primera ola? Síguenos en ",
    carouselLabel: "Galería Pacific Surf School",
    prev: "Anterior",
    next: "Siguiente",
    expand: "Ver en pantalla completa",
    dotsLabel: "Paginación galería",
    thumbsLabel: "Miniaturas",
    ig: "Ver más en Instagram",
    note: "+800 alumnos · 5★ en Google",
    lightbox: "Galería ampliada",
    close: "Cerrar",
    cap1: "Clase grupal · Barranquito",
    cap2: "Tu primera parada",
    cap3: "Buena Vibra",
    cap4: "Surf para peques · 7+ años",
    cap5: "Instructores Calificados",
    cap6: "Compañerismo",
    cap7: "Perseverancia",
    cap8: "Comunidad que te impulsa",
    alt1: "Clase grupal de surf en Barranquito",
    alt2: "Alumno aprendiendo surf",
    alt3: "Alumna celebrando su primera ola",
    alt4: "Niña surfeando en Barranquito",
    alt5: "Instructor mirando el mar",
    alt6: "Surfista en la ola",
    alt7: "Grupo surfista en la playa",
    alt8: "Alumnos Pacific Surf School",
    dotAria: "Imagen {i} de {total}",
    thumbAria: "Ver imagen {i}"
  },
  forecast: {
    tag: "Costa Verde",
    h2: "Pronóstico de Surf",
    desc: "Condiciones del mar en Playa Barranquito — Pronóstico 4 días.",
    updatePrefix: "Última actualización:",
    loading: "Cargando datos del océano...",
    error: "No se pudieron cargar los datos. Intenta de nuevo más tarde.",
    retry: "Reintentar",
    disclaimerPrefix: "Estimación basada en datos de ",
    disclaimerSuffix: ". Las condiciones reales pueden variar. Consulta a tus instructores.",
    hoy: "Hoy",
    q_nodata: "Sin datos",
    q_excellent: "Excelente",
    q_good: "Buenas",
    q_fair: "Regular",
    q_poor: "Difícil",
    m_wave: "Ola máx (m)",
    m_period: "Período (s)",
    m_dir: "Dirección",
    m_energy: "Energía (kJ)"
  },
  camden: {
    tag: "Partner Oficial",
    desc: "Ponchos de playa 100% peruanos. Te cambias con estilo después del surf.",
    visit: "Visitar tienda",
    p1t: "Azul Marino - Lila",
    p1d: "Elegancia que abriga, comodidad y color que acompaña.",
    p2t: "Rojo - Azul Marino",
    p2d: "Diseño relajado, corte amplio para una sensación de libertad total.",
    p3t: "Azul Marino - Turquesa",
    p3d: "El color que te define. Sabemos que cada persona es única.",
    f1t: "Mangas amplias",
    f1d: "Libertad al moverte mientras te protegen del viento y mantienen tu cuerpo seco.",
    f2t: "Cambiador premium",
    f2d: "Comodidad, carácter y funcionalidad para los que viven entre el agua y la ciudad.",
    f3t: "Tu color",
    f3d: "Muchos colores para que encuentres el que más te representa.",
    f4t: "Calidad que se siente",
    f4d: "Elegir bien es sentirse cómodo y moverse con libertad.",
    ctaH: "Te acompaña desde el agua hasta casa",
    ctaP: "Absorbente, práctico y tan ligero que puedes ir con él hasta casa sin preocuparte por nada.",
    ctaBtn: "Ver colección",
    altPoncho: "Poncho Camden Azul Marino",
    altPonchoRojo: "Poncho Camden Rojo",
    altPonchoTurquesa: "Poncho Camden Turquesa",
    altCta: "Persona usando poncho Camden en la playa",
    fb: "Camden en Facebook",
    ig: "Camden en Instagram",
    tt: "Camden en TikTok"
  },
  ubicacion: {
    tag: "¿Dónde encontrarnos?",
    h2: "Playa Barranquito, Lima",
    dir: "Costa Verde, Barranco – Lima, Perú",
    horario: "Lunes a Domingo · 7:00 am – 6:00 pm",
    mapTitle: "Ubicación Pacific Surf School en Playa Barranquito"
  },
  faq: {
    tag: "Preguntas frecuentes",
    q1: "¿Necesito saber nadar para tomar clases?",
    a1: "No es obligatorio ser nadador experto. Nuestros instructores te enseñan técnicas de seguridad y siempre estamos contigo en el agua. Eso sí, debes sentirte cómodo/a en el mar.",
    q2: "¿Qué debo llevar a la clase?",
    a2: "Traje de baño, bloqueador solar resistente al agua, agua para hidratarte y muchas ganas. Todo el equipo de surf (tabla, neopreno, leash) está incluido en el precio.",
    q3: "¿Cuáles son los horarios disponibles?",
    a3: "Ofrecemos turnos de mañana (6am, 8am, 10am) y tarde (4pm, 6pm) de lunes a domingo. Los horarios exactos se confirman al reservar según disponibilidad y condición del mar.",
    q4: "¿Puedo cancelar o reprogramar mi clase?",
    a4: "Sí. Puedes cancelar o reprogramar sin costo hasta 48 horas antes de tu clase. Después de ese plazo se aplica una penalidad del 50%.",
    q5: "¿Qué pasa si el mar está muy picado?",
    a5: "La seguridad es lo primero. Si las condiciones del mar no son aptas, reprogramamos tu clase sin ningún costo adicional.",
    q6: "¿Hay clases para niños?",
    a6: "¡Sí! Tenemos clases para niños desde los 7 años con instructores especializados en surf infantil y medidas de seguridad adicionales."
  },
  footer: {
    lugar: "Playa Barranquito, Lima, Perú",
    nav: "Navegación",
    clases: "Clases",
    contacto: "Contacto",
    inicio: "Inicio",
    galeria: "Galería",
    ubicacion: "Ubicación",
    individual: "Clase Individual",
    grupal: "Clase Grupal",
    p4: "Pack x4",
    p8: "Pack x8",
    p12: "Pack x12",
    rights: "© 2026 Pacific Surf School · RUC: 20613070142 · Todos los derechos reservados",
    terms: "Términos y condiciones",
    privacy: "Política de privacidad",
    changes: "Políticas de cambio/devolución",
    book: "Libro de reclamaciones",
    admin: "Admin"
  },
  modal: {
    close: "Cerrar",
    title: "Reservar Clase",
    stepClase: "Clase",
    stepHorario: "Horario",
    stepDatos: "Datos",
    stepConfirmar: "Confirmar",
    h3tipo: "¿Qué tipo de clase quieres?",
    optGrupal: "Grupal",
    optGrupalSmall: "S/ 110 c/u · mín. 2",
    optPrivada: "Privada",
    optVideo: "Video Análisis",
    next: "Siguiente",
    h3cuando: "¿Cuándo quieres surfear?",
    fecha: "Fecha",
    back: "Atrás",
    h3datos: "Tus datos",
    nombre: "Nombre completo *",
    nombrePh: "Tu nombre completo",
    wsp: "WhatsApp *",
    email: "Correo electrónico *",
    emailPh: "tu@email.com",
    peso: "Peso (kg)",
    pesoPh: "Ej: 70",
    altura: "Altura (cm)",
    alturaPh: "Ej: 170",
    expLabel: "¿Has hecho surf antes? *",
    expSel: "Seleccionar",
    expNunca: "Nunca he surfeado",
    expPocas: "Pocas veces (1-3)",
    expAlgunas: "Algunas veces (4-10)",
    expFrecuente: "Surfeo frecuentemente",
    nivelLabel: "Nivel de surf *",
    nivelPrincipiante: "Principiante",
    nivelBasico: "Básico",
    nivelIntermedio: "Intermedio",
    nivelAvanzado: "Avanzado",
    personasLabel: "N° de personas * — Grupal: 2 a 5",
    personas2: "2 personas",
    personas3: "3 personas",
    personas4: "4 personas",
    personas5: "5 personas",
    personasHint: "Mínimo 2 personas para clase grupal.",
    pagoLabel: "Medio de pago *",
    pagoTransferencia: "Transferencia",
    pagoEfectivo: "Efectivo",
    pagoInfo: "Coordinas el pago por WhatsApp después de confirmar tu reserva.",
    resumen: "Ver resumen",
    h3confirma: "Confirma tu reserva",
    resumenNota: "Confirma tu reserva por WhatsApp y coordina el pago.",
    calendar: "Agregar a mi calendario",
    whatsapp: "Confirmar por WhatsApp",
    redirect: "¡Redirigiendo...",
    horarios: "Horarios disponibles — {dia}",
    errFecha: "Selecciona una fecha",
    errNombre: "Ingresa tu nombre",
    errWsp: "Ingresa tu WhatsApp",
    errFormato: "Formato inválido",
    errEmail: "Ingresa tu correo electrónico",
    errEmailInvalid: "Correo electrónico inválido",
    errExp: "Selecciona tu experiencia",
    errNivel: "Selecciona tu nivel",
    errMin: "Mínimo 2 personas para grupal",
    errMax: "Máximo 5 personas para grupal",
    rClase: "Clase",
    rFecha: "Fecha",
    rHorario: "Horario",
    rPersonas: "Personas",
    rNombre: "Nombre",
    rCorreo: "Correo",
    rPeso: "Peso",
    rAltura: "Altura",
    rExperiencia: "Experiencia",
    rNivel: "Nivel",
    rPago: "Medio de pago",
    rTotal: "Total a pagar",
    expN: "Nunca",
    exp1: "1-3 veces",
    exp2: "4-10 veces",
    expF: "Frecuente",
    pagoEfectivoS: "Efectivo",
    pagoTransferenciaS: "Transferencia",
    pagoTarjeta: "Tarjeta",
    calTitle: "Clase de Surf - {clase}",
    calDetails: "Reserva en Pacific Surf School\nClase: {clase}\nHorario: {horario}\nPersonas: {personas}\nNombre: {nombre}"
  },
  classes: {
    individual: "Clase Privada",
    grupal: "Clase Grupal",
    videoanalisis: "Plan Surf + Video Análisis",
    paquete: "Pack x4 Clases",
    paquete8: "Pack x8 Clases",
    paquete12: "Pack x12 Clases"
  },
  wa: {
    float: "Contactar por WhatsApp"
  },
  dias: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  diasCortos: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  meses: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
},
en: {
  meta: {
    title: "Pacific Surf School – Barranquito Beach, Lima",
    desc: "Learn to surf from scratch in Lima with Pacific Surf School. We offer a 100% safe, fun and personalized experience at Barranquito Beach, Costa Verde (Lima). All high-quality gear (board and wetsuit) and dedicated instructors for private or group lessons are included. We focus on great technique, maximum fun and giving you an unforgettable experience in the ocean — whether it's your first time or not.",
    ogTitle: "Pacific Surf School – Surf Lessons at Barranquito Beach, Lima",
    ogDesc: "Learn to surf from scratch in Lima with Pacific Surf School. A 100% safe, fun and personalized experience at Barranquito Beach. Gear included. Private or group lessons.",
    twTitle: "Pacific Surf School – Surf Lessons at Barranquito Beach, Lima",
    twDesc: "Private, group and pack surf lessons at Barranquito Beach, Lima. ISA-certified instructors."
  },
  nav: {
    menu: "Menu",
    inicio: "Home",
    clases: "Lessons",
    nosotros: "About us",
    galeria: "Gallery",
    oleaje: "Surf report",
    ubicacion: "Location",
    faq: "FAQ",
    reservar: "Book a Lesson"
  },
  lang: {
    label: "Language",
    es: "Español",
    en: "English",
    de: "Deutsch"
  },
  hero: {
    title: "Surf Lessons<br>in <span class=\"highlight-yellow\">Lima</span>",
    strong: "Surfing for the first time?",
    desc: "Learn with trained instructors. From zero to advanced level on Lima's Costa Verde.",
    langsLabel: "Lessons in"
  },
  stats: {
    alumnos: "Students trained",
    google: "Google rating",
    experiencia: "Years of experience"
  },
  clases: {
    tag: "Our lessons",
    h2: "Choose your experience",
    desc: "From your first wave to advanced maneuvers. Full equipment included in every lesson.",
    carouselLabel: "Surf lessons",
    prev: "Previous",
    next: "Next",
    dotsLabel: "Lesson pagination",
    dotAria: "Group {i} of {total}",
    cardAria: "Book {name}",
    hint: "Swipe or drag",
    reservar: "Book",
    perPersona: "/ person",
    sesion: "/ session",
    pack: "/ pack",
    masPopular: "Most popular",
    badgeGrupal: "Group",
    badgePrivada: "Private",
    badgeVideo: "Video Analysis",
    badgeP8: "8-pack",
    badgeP12: "12-pack",
    g_h3: "Group Lesson",
    g_desc: "Learn in a fun environment. Groups of 2 to 5 people. Min. 2.",
    i_h3: "Private Lesson",
    i_desc: "100% personalized attention. Ideal for fast progress or fixing your technique.",
    v_h3: "Surf Plan + Video Analysis",
    v_desc: "1 lesson + frame-by-frame video analysis to polish your technique.",
    p8_h3: "Full Group Pack",
    p8_desc: "8 group lessons for a complete transformation. Significant savings.",
    p12_desc: "12 group lessons. The best investment to master surfing.",
    li_horas: "1.5 hours with instructor",
    li_equipo: "Board + wetsuit",
    li_niveles: "All levels",
    li_video: "Personalized video analysis",
    li_8: "8 group lessons",
    li_12: "12 group lessons",
    altGrupal: "Group surf lesson in Barranquito",
    altPrivada: "Private surf lesson",
    altVideo: "Surf plan video analysis",
    altP8: "Full group pack x8",
    altP12: "Full group pack x12"
  },
  nosotros: {
    altImg: "Pacific Surf School team at the beach",
    tag: "Why choose us?",
    h2: "Safe, fun and professional surfing",
    desc: "At Pacific Surf School we combine safety, technique and passion for the ocean. Every lesson is designed so you leave the water with a smile and wanting to come back.",
    r1s: "Certified instructors",
    r1p: "Trained instructors. Your safety comes first.",
    r2s: "Small groups",
    r2p: "Max 5 students per instructor for real attention.",
    r3s: "Top-quality gear",
    r3p: "Foam boards, quality wetsuits and certified leashes.",
    r4s: "Photos and video",
    r4p: "We capture your best waves so you can always remember them.",
    r5s: "Barranquito Beach",
    r5p: "The ideal beach to learn: perfect waves for every level.",
    r6s: "Surf community",
    r6p: "Join hundreds of students who are already part of the PSS family."
  },
  equipo: {
    nav: "Team",
    tag: "Our team",
    h2: "Meet the people who'll teach you to surf",
    desc: "Behind every lesson there are real people from Barranquito who live for surfing. This is the team waiting for you on the sand.",
    role1: "Certified instructor",
    bio1: "He's been surfing in Barranquito since he can remember. A specialist in beginners: he'll have you laughing at every wipeout and paddling back out for more.",
    role2: "Instructor",
    bio2: "Trained in technique and water safety. His lessons are the group favorite: energy, patience and plenty of photos of your best waves.",
    role3: "Instructor",
    bio3: "Instructor at the school: patient and a specialist at making your first waves safe and fun.",
    alt1: "Rodri, instructor at Pacific Surf School",
    alt2: "Miguel, instructor at Pacific Surf School",
    alt3: "Elias, instructor at Pacific Surf School"
  },
  membresia: {
    nav: "Membership",
    tag: "Pacific Membership",
    h2: "Surf more, pay less",
    desc: "One price per month with lessons and extra benefits so you can live surfing all week.",
    perMonth: "per month",
    v30: "Valid for 30 days",
    incTitle: "Included in your membership",
    b1t: "4 group lessons per month",
    b1d: "With certified instructor and equipment included.",
    b2t: "Photos and video of your waves",
    b2d: "We film your best sessions so you can share them.",
    b3t: "10% off at Camden",
    b3d: "On ponchos and accessories from our official partner.",
    b4t: "Priority booking",
    b4d: "Choose your time slots before anyone else each week.",
    b5t: "Guest of the month",
    b5d: "Bring a friend to one lesson at no extra cost.",
    b6t: "PSS community",
    b6d: "Access to surf trips and events for members.",
    sticker: "🎉 Guest of the month included",
    planTitle: "Your monthly plan",
    planSub: "Everything you need to surf every week — valid for 30 days",
    priceSub: "per month · 30 days",
    cta: "Book via WhatsApp"
  },
  resenas: {
    nav: "Reviews",
    tag: "Reviews",
    h2: "What our students say",
    desc: "Real experiences from those who already dared to catch their first wave with us.",
    googleCount: "21 reviews on Google",
    srcGoogle: "Google review",
    date1: "Apr 2025",
    date2: "Jun 2024",
    q1: "We had the best experience with pacific!! Gabriel and all the coaches were very attentive and skilled. We always felt super safe and made progress pretty quickly. We would totally recommend it! Thank youu we had so much fun!",
    q2: "La mejor escuela de la costa verde con precios cómodos y variados, los coaches son los mejores y te paras en la primera clase. RECOMENDADO!!!",
    q3: "Con Pacific no solo aprendi a surfear de una manera segura con coach altamente calificados, tambien encontre una comunidad compuestas por profes y alumnos, que nos ayudamos y compartimos tanto dentro como fuera del agua, Pacific Surf School 100% recomendada",
    q4: "Una excelente escuela! Los coaches son super capos, y saben como llegar al alumno. Un excelente deporte para que todos disfruten.",
    q5: "Muy recomendable!. Gabriel, el coach, siempre muy atento con sus alumnos y se preocupa porque estén y se sientan seguros en el mar. Incluso es un excelente profesor para niños.",
    q6: "La mejor escuela, te hacen surfear desde el día 1, los profesores son amigables y super profesionales, lleven toalla y chanclas 😎 el resto te lo da la escuela incluido en el pago.",
    q7: "Un éxito… me encantan las clases dan sigan así por favor. Que el frío no los detenga!!",
    q8: "The perfect activity if you are visiting Lima: you could go surfing in the morning, enjoy a nice lunch, and explore the city in the afternoon / evening. The school will provide you with the full equipment, so you just need to wear comfortable clothes and bring a small water bottle. The coaches are very friendly, patient, and professional. The perfect choice for both beginners and experienced surfers."
  },
  galeria: {
    tag: "Gallery",
    h2: "The experience in pictures",
    descPrefix: "Ready for your first wave? Follow us on ",
    carouselLabel: "Pacific Surf School gallery",
    prev: "Previous",
    next: "Next",
    expand: "View fullscreen",
    dotsLabel: "Gallery pagination",
    thumbsLabel: "Thumbnails",
    ig: "See more on Instagram",
    note: "+800 students · 5★ on Google",
    lightbox: "Expanded gallery",
    close: "Close",
    cap1: "Group lesson · Barranquito",
    cap2: "Your first stand-up",
    cap3: "Good Vibes",
    cap4: "Surf for kids · 7+ years",
    cap5: "Qualified Instructors",
    cap6: "Companionship",
    cap7: "Perseverance",
    cap8: "A community that pushes you",
    alt1: "Group surf lesson in Barranquito",
    alt2: "Student learning to surf",
    alt3: "Student celebrating her first wave",
    alt4: "Girl surfing in Barranquito",
    alt5: "Instructor watching the ocean",
    alt6: "Surfer riding a wave",
    alt7: "Surf group at the beach",
    alt8: "Pacific Surf School students",
    dotAria: "Image {i} of {total}",
    thumbAria: "View image {i}"
  },
  forecast: {
    tag: "Costa Verde",
    h2: "Surf Forecast",
    desc: "Sea conditions at Barranquito Beach — 4-day forecast.",
    updatePrefix: "Last updated:",
    loading: "Loading ocean data...",
    error: "Could not load the data. Please try again later.",
    retry: "Retry",
    disclaimerPrefix: "Estimate based on data from ",
    disclaimerSuffix: ". Real conditions may vary. Ask your instructors.",
    hoy: "Today",
    q_nodata: "No data",
    q_excellent: "Excellent",
    q_good: "Good",
    q_fair: "Fair",
    q_poor: "Poor",
    m_wave: "Max wave (m)",
    m_period: "Period (s)",
    m_dir: "Direction",
    m_energy: "Energy (kJ)"
  },
  camden: {
    tag: "Official Partner",
    desc: "100% Peruvian beach ponchos. Change in style after your surf.",
    visit: "Visit store",
    p1t: "Navy Blue - Lilac",
    p1d: "Elegance that keeps you warm, comfort and color by your side.",
    p2t: "Red - Navy Blue",
    p2d: "Relaxed design, wide cut for a feeling of total freedom.",
    p3t: "Navy Blue - Turquoise",
    p3d: "The color that defines you. We know every person is unique.",
    f1t: "Wide sleeves",
    f1d: "Freedom to move while protecting you from the wind and keeping you dry.",
    f2t: "Premium changing robe",
    f2d: "Comfort, character and functionality for those who live between the water and the city.",
    f3t: "Your color",
    f3d: "Many colors so you can find the one that represents you best.",
    f4t: "Quality you can feel",
    f4d: "Choosing well means feeling comfortable and moving freely.",
    ctaH: "With you from the water to home",
    ctaP: "Absorbent, practical and so light you can wear it home without a care.",
    ctaBtn: "View collection",
    altPoncho: "Camden Navy Blue poncho",
    altPonchoRojo: "Camden Red poncho",
    altPonchoTurquesa: "Camden Turquoise poncho",
    altCta: "Person wearing a Camden poncho at the beach",
    fb: "Camden on Facebook",
    ig: "Camden on Instagram",
    tt: "Camden on TikTok"
  },
  ubicacion: {
    tag: "Where to find us?",
    h2: "Barranquito Beach, Lima",
    dir: "Costa Verde, Barranco – Lima, Peru",
    horario: "Monday to Sunday · 7:00 am – 6:00 pm",
    mapTitle: "Pacific Surf School location at Barranquito Beach"
  },
  faq: {
    tag: "Frequently asked questions",
    q1: "Do I need to know how to swim to take lessons?",
    a1: "You don't have to be an expert swimmer. Our instructors teach you safety techniques and we're always with you in the water. You should, however, feel comfortable in the sea.",
    q2: "What should I bring to the lesson?",
    a2: "Swimwear, water-resistant sunscreen, water to stay hydrated and lots of enthusiasm. All surf gear (board, wetsuit, leash) is included in the price.",
    q3: "What time slots are available?",
    a3: "We offer morning slots (6am, 8am, 10am) and afternoon slots (4pm, 6pm), Monday to Sunday. Exact times are confirmed when you book, depending on availability and sea conditions.",
    q4: "Can I cancel or reschedule my lesson?",
    a4: "Yes. You can cancel or reschedule free of charge up to 48 hours before your lesson. After that, a 50% fee applies.",
    q5: "What if the sea is too rough?",
    a5: "Safety comes first. If sea conditions are not suitable, we reschedule your lesson at no extra cost.",
    q6: "Are there lessons for kids?",
    a6: "Yes! We have lessons for kids from 7 years old with instructors specialized in children's surf and additional safety measures."
  },
  footer: {
    lugar: "Barranquito Beach, Lima, Peru",
    nav: "Navigation",
    clases: "Lessons",
    contacto: "Contact",
    inicio: "Home",
    galeria: "Gallery",
    ubicacion: "Location",
    individual: "Private Lesson",
    grupal: "Group Lesson",
    p4: "4-pack",
    p8: "8-pack",
    p12: "12-pack",
    rights: "© 2026 Pacific Surf School · RUC: 20613070142 · All rights reserved",
    terms: "Terms and conditions",
    privacy: "Privacy policy",
    changes: "Change / refund policy",
    book: "Complaint book",
    admin: "Admin"
  },
  modal: {
    close: "Close",
    title: "Book a Lesson",
    stepClase: "Lesson",
    stepHorario: "Time",
    stepDatos: "Details",
    stepConfirmar: "Confirm",
    h3tipo: "What type of lesson do you want?",
    optGrupal: "Group",
    optGrupalSmall: "S/ 110 each · min. 2",
    optPrivada: "Private",
    optVideo: "Video Analysis",
    next: "Next",
    h3cuando: "When do you want to surf?",
    fecha: "Date",
    back: "Back",
    h3datos: "Your details",
    nombre: "Full name *",
    nombrePh: "Your full name",
    wsp: "WhatsApp *",
    email: "Email address *",
    emailPh: "you@email.com",
    peso: "Weight (kg)",
    pesoPh: "E.g. 154",
    altura: "Height (cm)",
    alturaPh: "E.g. 67",
    expLabel: "Have you surfed before? *",
    expSel: "Select",
    expNunca: "I have never surfed",
    expPocas: "A few times (1-3)",
    expAlgunas: "Some times (4-10)",
    expFrecuente: "I surf frequently",
    nivelLabel: "Surf level *",
    nivelPrincipiante: "Beginner",
    nivelBasico: "Basic",
    nivelIntermedio: "Intermediate",
    nivelAvanzado: "Advanced",
    personasLabel: "Number of people * — Group: 2 to 5",
    personas2: "2 people",
    personas3: "3 people",
    personas4: "4 people",
    personas5: "5 people",
    personasHint: "Minimum 2 people for a group lesson.",
    pagoLabel: "Payment method *",
    pagoTransferencia: "Bank transfer",
    pagoEfectivo: "Cash",
    pagoInfo: "You coordinate payment via WhatsApp after confirming your booking.",
    resumen: "View summary",
    h3confirma: "Confirm your booking",
    resumenNota: "Confirm your booking via WhatsApp and arrange the payment.",
    calendar: "Add to my calendar",
    whatsapp: "Confirm via WhatsApp",
    redirect: "Redirecting...",
    horarios: "Available times — {dia}",
    errFecha: "Select a date",
    errNombre: "Enter your name",
    errWsp: "Enter your WhatsApp number",
    errFormato: "Invalid format",
    errEmail: "Enter your email address",
    errEmailInvalid: "Invalid email address",
    errExp: "Select your experience",
    errNivel: "Select your level",
    errMin: "Minimum 2 people for group lessons",
    errMax: "Maximum 5 people for group lessons",
    rClase: "Lesson",
    rFecha: "Date",
    rHorario: "Time",
    rPersonas: "People",
    rNombre: "Name",
    rCorreo: "Email",
    rPeso: "Weight",
    rAltura: "Height",
    rExperiencia: "Experience",
    rNivel: "Level",
    rPago: "Payment method",
    rTotal: "Total to pay",
    expN: "Never",
    exp1: "1-3 times",
    exp2: "4-10 times",
    expF: "Frequent",
    pagoEfectivoS: "Cash",
    pagoTransferenciaS: "Bank transfer",
    pagoTarjeta: "Card",
    calTitle: "Surf Lesson - {clase}",
    calDetails: "Booking at Pacific Surf School\nLesson: {clase}\nTime: {horario}\nPeople: {personas}\nName: {nombre}"
  },
  classes: {
    individual: "Private Lesson",
    grupal: "Group Lesson",
    videoanalisis: "Surf Plan + Video Analysis",
    paquete: "4-Class Pack",
    paquete8: "8-Class Pack",
    paquete12: "12-Class Pack"
  },
  wa: {
    float: "Contact us on WhatsApp"
  },
  dias: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  diasCortos: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  meses: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
},
de: {
  meta: {
    title: "Pacific Surf School – Barranquito-Strand, Lima",
    desc: "Lerne Surfen von Grund auf in Lima mit der Pacific Surf School. Wir bieten eine 100 % sichere, lustige und personalisierte Erfahrung am Barranquito-Strand, Costa Verde (Lima). Hochwertige Ausrüstung (Surfbrett und Neoprenanzug) und engagierte Einzel- oder Gruppenstunden sind inklusive. Wir setzen auf gute Technik, maximalen Spaß und eine unvergessliche Erfahrung im Meer – egal ob zum ersten Mal.",
    ogTitle: "Pacific Surf School – Surfunterricht am Barranquito-Strand, Lima",
    ogDesc: "Lerne Surfen von Grund auf in Lima mit der Pacific Surf School. Eine 100 % sichere, lustige und personalisierte Erfahrung am Barranquito-Strand. Ausrüstung inklusive. Einzel- oder Gruppenstunden.",
    twTitle: "Pacific Surf School – Surfunterricht am Barranquito-Strand, Lima",
    twDesc: "Einzel-, Gruppen- und Paketstunden am Barranquito-Strand, Lima. ISA-zertifizierte Instruktoren."
  },
  nav: {
    menu: "Menü",
    inicio: "Start",
    clases: "Kurse",
    nosotros: "Über uns",
    galeria: "Galerie",
    oleaje: "Wellenbericht",
    ubicacion: "Anfahrt",
    faq: "FAQ",
    reservar: "Kurs buchen"
  },
  lang: {
    label: "Sprache",
    es: "Español",
    en: "English",
    de: "Deutsch"
  },
  hero: {
    title: "Surfkurse<br>in <span class=\"highlight-yellow\">Lima</span>",
    strong: "Zum ersten Mal surfen?",
    desc: "Lerne bei ausgebildeten Instruktoren. Von null bis zum fortgeschrittenen Niveau an Limas Costa Verde.",
    langsLabel: "Kurse auf"
  },
  stats: {
    alumnos: "Ausbildende Schüler",
    google: "Google-Bewertung",
    experiencia: "Jahre Erfahrung"
  },
  clases: {
    tag: "Unsere Kurse",
    h2: "Wähle dein Erlebnis",
    desc: "Von deiner ersten Welle bis zu fortgeschrittenen Manövern. Komplette Ausrüstung in allen Kursen inklusive.",
    carouselLabel: "Surfkurse",
    prev: "Zurück",
    next: "Weiter",
    dotsLabel: "Kurs-Navigation",
    dotAria: "Gruppe {i} von {total}",
    cardAria: "{name} buchen",
    hint: "Wischen oder ziehen",
    reservar: "Buchen",
    perPersona: "/ Person",
    sesion: "/ Sitzung",
    pack: "/ Paket",
    masPopular: "Am beliebtesten",
    badgeGrupal: "Gruppe",
    badgePrivada: "Privat",
    badgeVideo: "Videoanalyse",
    badgeP8: "8er-Paket",
    badgeP12: "12er-Paket",
    g_h3: "Gruppenkurs",
    g_desc: "Lerne in einer lustigen Umgebung. Gruppen von 2 bis 5 Personen. Mind. 2.",
    i_h3: "Privatkurs",
    i_desc: "100 % personalisierte Betreuung. Ideal für schnelle Fortschritte oder Technikkorrekturen.",
    v_h3: "Surfplan + Videoanalyse",
    v_desc: "1 Kurs + Videoanalyse Bild für Bild, um deine Technik zu verfeinern.",
    p8_h3: "Gruppen-Paket",
    p8_desc: "8 Gruppenstunden für eine komplette Transformation. Deutliche Ersparnis.",
    p12_desc: "12 Gruppenstunden. Die beste Investition, um Surfen zu meistern.",
    li_horas: "1,5 Stunden mit Instruktor",
    li_equipo: "Brett + Neoprenanzug",
    li_niveles: "Alle Level",
    li_video: "Personalisierte Videoanalyse",
    li_8: "8 Gruppenstunden",
    li_12: "12 Gruppenstunden",
    altGrupal: "Surfgruppenkurs in Barranquito",
    altPrivada: "Privater Surfunterricht",
    altVideo: "Surfplan mit Videoanalyse",
    altP8: "Gruppenpaket x8",
    altP12: "Gruppenpaket x12"
  },
  nosotros: {
    altImg: "Pacific-Surf-School-Team am Strand",
    tag: "Warum wir?",
    h2: "Sicheres, lustiges und professionelles Surfen",
    desc: "Bei der Pacific Surf School verbinden wir Sicherheit, Technik und Leidenschaft für den Ozean. Jeder Kurs ist so gestaltet, dass du mit einem Lächeln aus dem Wasser kommst und wiederkommen möchtest.",
    r1s: "Zertifizierte Instruktoren",
    r1p: "Ausbildete Instruktoren. Deine Sicherheit hat Vorrang.",
    r2s: "Kleine Gruppen",
    r2p: "Max. 5 Schüler pro Instruktor für echte Betreuung.",
    r3s: "Ausrüstung erste Klasse",
    r3p: "Foam-Bretter, hochwertige Neoprenanzüge und zertifizierte Leashes.",
    r4s: "Fotos und Video",
    r4p: "Wir halten deine besten Wellen fest, damit du sie nie vergisst.",
    r5s: "Barranquito-Strand",
    r5p: "Der ideale Strand zum Lernen: perfekte Wellen für alle Level.",
    r6s: "Surf-Community",
    r6p: "Schließe dich Hunderten von Schülern an, die bereits Teil der PSS-Familie sind."
  },
  equipo: {
    nav: "Team",
    tag: "Unser Team",
    h2: "Lerne kennen, wer dir das Surfen beibringt",
    desc: "Hinter jedem Kurs stehen echte Menschen aus Barranquito, die vom Surfen leben. Dieses Team erwartet dich am Strand.",
    role1: "Zertifizierter Instruktor",
    bio1: "Er surft seit er denken kann in Barranquito. Spezialist für Anfänger: Er lässt dich bei jedem Sturz lachen und motiviert dich für die nächste Welle.",
    role2: "Instruktor",
    bio2: "Ausbildet in Technik und Wassersicherheit. Seine Kurse sind bei Gruppen am beliebtesten: Energie, Geduld und viele Fotos deiner besten Wellen.",
    role3: "Instruktor",
    bio3: "Instruktor der Schule: geduldig und Spezialist dafür, dass deine ersten Wellen sicher und lustig sind.",
    alt1: "Rodri, Instruktor der Pacific Surf School",
    alt2: "Miguel, Instruktor der Pacific Surf School",
    alt3: "Elias, Instruktor der Pacific Surf School"
  },
  membresia: {
    nav: "Mitgliedschaft",
    tag: "Pacific Mitgliedschaft",
    h2: "Mehr surfen, weniger zahlen",
    desc: "Ein Preis pro Monat mit Kursen und Extra-Vorteilen, damit du die ganze Woche surfen lebst.",
    perMonth: "pro Monat",
    v30: "Gültig: 30 Tage",
    incTitle: "In deiner Mitgliedschaft enthalten",
    b1t: "4 Gruppenkurse pro Monat",
    b1d: "Mit zertifiziertem Instruktor und inklusive Ausrüstung.",
    b2t: "Fotos und Video deiner Wellen",
    b2d: "Wir filmen deine besten Sessions zum Teilen.",
    b3t: "10 % Rabatt bei Camden",
    b3d: "Bei Ponchos und Accessoires unseres offiziellen Partners.",
    b4t: "Priorisierte Buchung",
    b4d: "Wähle deine Zeiten jede Woche zuerst.",
    b5t: "Gast des Monats",
    b5d: "Nimm einen Freund mit zu einem Kurs ohne Zusatzkosten.",
    b6t: "PSS-Community",
    b6d: "Zugang zu Surftrips und Events für Mitglieder.",
    sticker: "🎉 Gast des Monats inklusive",
    planTitle: "Dein Monatsplan",
    planSub: "Alles, was du brauchst, um jede Woche zu surfen — gültig 30 Tage",
    priceSub: "pro Monat · 30 Tage",
    cta: "Per WhatsApp buchen"
  },
  resenas: {
    nav: "Bewertungen",
    tag: "Bewertungen",
    h2: "Was unsere Schüler sagen",
    desc: "Echte Erlebnisse von denen, die ihre erste Welle bereits bei uns gewagt haben.",
    googleCount: "21 Bewertungen bei Google",
    srcGoogle: "Google-Bewertung",
    date1: "Apr 2025",
    date2: "Jun 2024",
    q1: "We had the best experience with pacific!! Gabriel and all the coaches were very attentive and skilled. We always felt super safe and made progress pretty quickly. We would totally recommend it! Thank youu we had so much fun!",
    q2: "La mejor escuela de la costa verde con precios cómodos y variados, los coaches son los mejores y te paras en la primera clase. RECOMENDADO!!!",
    q3: "Con Pacific no solo aprendi a surfear de una manera segura con coach altamente calificados, tambien encontre una comunidad compuestas por profes y alumnos, que nos ayudamos y compartimos tanto dentro como fuera del agua, Pacific Surf School 100% recomendada",
    q4: "Una excelente escuela! Los coaches son super capos, y saben como llegar al alumno. Un excelente deporte para que todos disfruten.",
    q5: "Muy recomendable!. Gabriel, el coach, siempre muy atento con sus alumnos y se preocupa porque estén y se sientan seguros en el mar. Incluso es un excelente profesor para niños.",
    q6: "La mejor escuela, te hacen surfear desde el día 1, los profesores son amigables y super profesionales, lleven toalla y chanclas 😎 el resto te lo da la escuela incluido en el pago.",
    q7: "Un éxito… me encantan las clases dan sigan así por favor. Que el frío no los detenga!!",
    q8: "The perfect activity if you are visiting Lima: you could go surfing in the morning, enjoy a nice lunch, and explore the city in the afternoon / evening. The school will provide you with the full equipment, so you just need to wear comfortable clothes and bring a small water bottle. The coaches are very friendly, patient, and professional. The perfect choice for both beginners and experienced surfers."
  },
  galeria: {
    tag: "Galerie",
    h2: "Das Erlebnis in Bildern",
    descPrefix: "Bereit für deine erste Welle? Folge uns auf ",
    carouselLabel: "Pacific Surf School Galerie",
    prev: "Zurück",
    next: "Weiter",
    expand: "Vollbild anzeigen",
    dotsLabel: "Galerie-Navigation",
    thumbsLabel: "Miniaturen",
    ig: "Mehr auf Instagram",
    note: "+800 Schüler · 5★ bei Google",
    lightbox: "Vergößerte Galerie",
    close: "Schließen",
    cap1: "Gruppenkurs · Barranquito",
    cap2: "Dein erster Stand",
    cap3: "Gute Vibes",
    cap4: "Surfen für Kids · ab 7 Jahren",
    cap5: "Qualifizierte Instruktoren",
    cap6: "Kameradschaft",
    cap7: "Durchhaltevermögen",
    cap8: "Community, die dich antreibt",
    alt1: "Surfgruppenkurs in Barranquito",
    alt2: "Schüler lernt Surfen",
    alt3: "Schülerin feiert ihre erste Welle",
    alt4: "Mädchen surfend in Barranquito",
    alt5: "Instruktoren blicken aufs Meer",
    alt6: "Surfer auf der Welle",
    alt7: "Surfgruppe am Strand",
    alt8: "Pacific-Surf-School-Schüler",
    dotAria: "Bild {i} von {total}",
    thumbAria: "Bild {i} ansehen"
  },
  forecast: {
    tag: "Costa Verde",
    h2: "Surf-Wetterbericht",
    desc: "Seebedingungen am Barranquito-Strand — 4-Tage-Prognose.",
    updatePrefix: "Zuletzt aktualisiert:",
    loading: "Ozeandaten werden geladen...",
    error: "Die konnten nicht geladen werden. Bitte später erneut versuchen.",
    retry: "Erneut versuchen",
    disclaimerPrefix: "Schätzung basierend auf Daten von ",
    disclaimerSuffix: ". Die realen Bedingungen können abweichen. Frag deine Instruktoren.",
    hoy: "Heute",
    q_nodata: "Keine Daten",
    q_excellent: "Ausgezeichnet",
    q_good: "Gut",
    q_fair: "Mäßig",
    q_poor: "Schwierig",
    m_wave: "Max. Welle (m)",
    m_period: "Periode (s)",
    m_dir: "Richtung",
    m_energy: "Energie (kJ)"
  },
  camden: {
    tag: "Offizieller Partner",
    desc: "100 % peruanische Strandponchos. Wechsle stylisch nach dem Surfen.",
    visit: "Zum Shop",
    p1t: "Marineblau - Flieder",
    p1d: "Eleganz, die wärmt, Komfort und Farbe an deiner Seite.",
    p2t: "Rot - Marineblau",
    p2d: "Entspanntes Design, weite Passform für totale Freiheit.",
    p3t: "Marineblau - Türkis",
    p3d: "Die Farbe, die dich ausmacht. Wir wissen: Jeder Mensch ist einzigartig.",
    f1t: "Weite Ärmel",
    f1d: "Freiheit bei Bewegung, während sie dich vor Wind schützen und trocken halten.",
    f2t: "Premium Umkleideponcho",
    f2d: "Komfort, Charakter und Funktionalität für alle, die zwischen Wasser und Stadt leben.",
    f3t: "Deine Farbe",
    f3d: "Viele Farben, damit du die findest, die dich am besten repräsentiert.",
    f4t: "Qualität, die man spürt",
    f4d: "Richtig wählen heißt: sich wohl fühlen und frei bewegen.",
    ctaH: "Vom Wasser bis nach Hause an deiner Seite",
    ctaP: "Saugfähig, praktisch und so leicht, dass du ihn bedenkenlos nach Hause tragen kannst.",
    ctaBtn: "Kollektion ansehen",
    altPoncho: "Camden Marineblau Poncho",
    altPonchoRojo: "Camden Roter Poncho",
    altPonchoTurquesa: "Camden Türkiser Poncho",
    altCta: "Person mit Camden-Poncho am Strand",
    fb: "Camden bei Facebook",
    ig: "Camden bei Instagram",
    tt: "Camden bei TikTok"
  },
  ubicacion: {
    tag: "Wo findest du uns?",
    h2: "Barranquito-Strand, Lima",
    dir: "Costa Verde, Barranco – Lima, Peru",
    horario: "Montag bis Sonntag · 7:00 – 18:00 Uhr",
    mapTitle: "Standort der Pacific Surf School am Barranquito-Strand"
  },
  faq: {
    tag: "Häufige Fragen",
    q1: "Muss ich schwimmen können, um Kurse zu nehmen?",
    a1: "Du musst kein Experte im Schwimmen sein. Unsere Instruktoren bringen dir Sicherheitstechniken bei und sind immer bei dir im Wasser. Du solltest dich im Meer jedoch wohlfühlen.",
    q2: "Was soll ich zum Kurs mitbringen?",
    a2: "Badekleidung, wasserfeste Sonnencreme, Wasser zum Trinken und viel Lust. Die gesamte Surfausrüstung (Brett, Neopren, Leash) ist im Preis enthalten.",
    q3: "Welche Zeiten gibt es?",
    a3: "Wir bieten Vormittagstermine (6, 8, 10 Uhr) und Nachmittagstermine (16, 18 Uhr) von Montag bis Sonntag. Die genauen Zeiten werden bei der Buchung je nach Verfügbarkeit und Meeresbedingungen bestätigt.",
    q4: "Kann ich meinen Kurs absagen oder verschieben?",
    a4: "Ja. Du kannst bis 48 Stunden vor dem Kurs kostenlos absagen oder verschieben. Danach fällt eine Gebühr von 50 % an.",
    q5: "Was, wenn das Meer zu wild ist?",
    a5: "Sicherheit hat Vorrang. Wenn die Meeresbedingungen ungeeignet sind, verschieben wir deinen Kurs ohne zusätzliche Kosten.",
    q6: "Gibt es Kurse für Kinder?",
    a6: "Ja! Wir haben Kurse für Kinder ab 7 Jahren mit auf Kinder spezialisierten Instruktoren und zusätzlichen Sicherheitsmaßnahmen."
  },
  footer: {
    lugar: "Barranquito-Strand, Lima, Peru",
    nav: "Navigation",
    clases: "Kurse",
    contacto: "Kontakt",
    inicio: "Start",
    galeria: "Galerie",
    ubicacion: "Anfahrt",
    individual: "Privatkurs",
    grupal: "Gruppenkurs",
    p4: "4er-Paket",
    p8: "8er-Paket",
    p12: "12er-Paket",
    rights: "© 2026 Pacific Surf School · RUC: 20613070142 · Alle Rechte vorbehalten",
    terms: "AGB",
    privacy: "Datenschutzerklärung",
    changes: "Umtausch-/Rückerstattungsrichtlinie",
    book: "Beschwerdebuch",
    admin: "Admin"
  },
  modal: {
    close: "Schließen",
    title: "Kurs buchen",
    stepClase: "Kurs",
    stepHorario: "Zeit",
    stepDatos: "Daten",
    stepConfirmar: "Bestätigen",
    h3tipo: "Welche Art von Kurs möchtest du?",
    optGrupal: "Gruppe",
    optGrupalSmall: "S/ 110 p. P. · mind. 2",
    optPrivada: "Privat",
    optVideo: "Videoanalyse",
    next: "Weiter",
    h3cuando: "Wann möchtest du surfen?",
    fecha: "Datum",
    back: "Zurück",
    h3datos: "Deine Daten",
    nombre: "Vollständiger Name *",
    nombrePh: "Dein vollständiger Name",
    wsp: "WhatsApp *",
    email: "E-Mail-Adresse *",
    emailPh: "du@email.com",
    peso: "Gewicht (kg)",
    pesoPh: "z. B. 70",
    altura: "Größe (cm)",
    alturaPh: "z. B. 170",
    expLabel: "Hast du schon einmal Surfen gelernt? *",
    expSel: "Auswählen",
    expNunca: "Nie Surfen gelernt",
    expPocas: "Ein paar Mal (1-3)",
    expAlgunas: "Einige Male (4-10)",
    expFrecuente: "Ich surfe regelmäßig",
    nivelLabel: "Surflevel *",
    nivelPrincipiante: "Anfänger",
    nivelBasico: "Grundlagen",
    nivelIntermedio: "Mittelstufe",
    nivelAvanzado: "Fortgeschritten",
    personasLabel: "Personenzahl * — Gruppe: 2 bis 5",
    personas2: "2 Personen",
    personas3: "3 Personen",
    personas4: "4 Personen",
    personas5: "5 Personen",
    personasHint: "Mindestens 2 Personen für einen Gruppenkurs.",
    pagoLabel: "Zahlungsart *",
    pagoTransferencia: "Überweisung",
    pagoEfectivo: "Bar",
    pagoInfo: "Die Zahlung koordinierst du per WhatsApp, nachdem du deine Buchung bestätigt hast.",
    resumen: "Zusammenfassung ansehen",
    h3confirma: "Bestätige deine Buchung",
    resumenNota: "Bestätige deine Buchung per WhatsApp und vereinbare die Zahlung.",
    calendar: "Zu meinem Kalender hinzufügen",
    whatsapp: "Per WhatsApp bestätigen",
    redirect: "Weiterleitung...",
    horarios: "Verfügbare Zeiten — {dia}",
    errFecha: "Wähle ein Datum",
    errNombre: "Gib deinen Namen ein",
    errWsp: "Gib deine WhatsApp-Nummer ein",
    errFormato: "Ungültiges Format",
    errEmail: "Gib deine E-Mail-Adresse ein",
    errEmailInvalid: "Ungültige E-Mail-Adresse",
    errExp: "Wähle deine Erfahrung",
    errNivel: "Wähle dein Level",
    errMin: "Mindestens 2 Personen für Gruppenkurse",
    errMax: "Höchstens 5 Personen für Gruppenkurse",
    rClase: "Kurs",
    rFecha: "Datum",
    rHorario: "Zeit",
    rPersonas: "Personen",
    rNombre: "Name",
    rCorreo: "E-Mail",
    rPeso: "Gewicht",
    rAltura: "Größe",
    rExperiencia: "Erfahrung",
    rNivel: "Level",
    rPago: "Zahlungsart",
    rTotal: "Gesamtbetrag",
    expN: "Nie",
    exp1: "1-3 Mal",
    exp2: "4-10 Mal",
    expF: "Regelmäßig",
    pagoEfectivoS: "Bar",
    pagoTransferenciaS: "Überweisung",
    pagoTarjeta: "Karte",
    calTitle: "Surfkurs - {clase}",
    calDetails: "Buchung bei Pacific Surf School\nKurs: {clase}\nZeit: {horario}\nPersonen: {personas}\nName: {nombre}"
  },
  classes: {
    individual: "Privatkurs",
    grupal: "Gruppenkurs",
    videoanalisis: "Surfplan + Videoanalyse",
    paquete: "4er-Kurspaket",
    paquete8: "8er-Kurspaket",
    paquete12: "12er-Kurspaket"
  },
  wa: {
    float: "Kontakt per WhatsApp"
  },
  dias: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
  diasCortos: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  meses: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
}
};

export const SUPPORTED = ['es', 'en', 'de'];
const STORAGE_KEY = 'pss_lang';
const LOCALES = { es: 'es-PE', en: 'en-US', de: 'de-DE' };

let current = 'es';

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch (_) {}
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(nav) ? nav : 'es';
}

function resolve(lang, path) {
  let node = dicts[lang];
  for (const part of path.split('.')) {
    if (node == null) return null;
    node = node[part];
  }
  return node == null ? null : node;
}

export function t(key, vars) {
  let val = resolve(current, key);
  if (val == null) val = resolve('es', key);
  if (val == null) return key;
  if (typeof val !== 'string') return val;
  if (vars) {
    for (const k of Object.keys(vars)) val = val.split('{' + k + '}').join(vars[k]);
  }
  return val;
}

export function getLang() { return current; }
export function getLocale() { return LOCALES[current] || 'es-PE'; }

function setAttr(el, attr, value) {
  if (value != null && value !== '') el.setAttribute(attr, value);
}

export function applyLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = 'es';
  current = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.getAttribute('data-i18n'));
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const v = t(el.getAttribute('data-i18n-html'));
    if (typeof v === 'string') el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    setAttr(el, 'placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    setAttr(el, 'alt', t(el.getAttribute('data-i18n-alt')));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    setAttr(el, 'aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.querySelectorAll('[data-i18n-content]').forEach(el => {
    setAttr(el, 'content', t(el.getAttribute('data-i18n-content')));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    setAttr(el, 'title', t(el.getAttribute('data-i18n-title')));
  });

  // <title> y metas
  const title = t('meta.title');
  if (title && title !== 'meta.title') document.title = title;
  const upd = (sel, attr, key) => {
    const el = document.querySelector(sel);
    if (el) setAttr(el, attr, t(key));
  };
  upd('meta[name="description"]', 'content', 'meta.desc');
  upd('meta[property="og:title"]', 'content', 'meta.ogTitle');
  upd('meta[property="og:description"]', 'content', 'meta.ogDesc');
  upd('meta[name="twitter:title"]', 'content', 'meta.twTitle');
  upd('meta[name="twitter:description"]', 'content', 'meta.twDesc');

  // resalta opción activa del selector
  document.querySelectorAll('#langMenu [data-lang]').forEach(li => {
    const on = li.getAttribute('data-lang') === lang;
    li.classList.toggle('active', on);
    li.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  const cur = document.getElementById('langCurrent');
  if (cur) cur.textContent = lang.toUpperCase();

  window.dispatchEvent(new CustomEvent('pss:langchange', { detail: { lang } }));
}

export function setLang(lang, persist = true) {
  if (!SUPPORTED.includes(lang) || lang === current) return;
  applyLang(lang);
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
  }
}

export function onLangChange(fn) {
  window.addEventListener('pss:langchange', fn);
}

/* ===== SELECTOR DE IDIOMA (navbar) ===== */
function initSwitcher() {
  const btn = document.getElementById('langBtn');
  const menu = document.getElementById('langMenu');
  if (!btn || !menu) return;

  const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  const open = () => { menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });
  menu.querySelectorAll('[data-lang]').forEach(li => {
    li.addEventListener('click', () => { setLang(li.getAttribute('data-lang')); close(); });
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ===== ARRANQUE ===== */
applyLang(detectLang());
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSwitcher);
} else {
  initSwitcher();
}
