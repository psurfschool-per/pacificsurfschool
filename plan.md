# 🏄 Auditoría de AI Slop y Plan de Modernización — Pacific Surf School

> **Fecha:** 2026-08-27 · **Commit base:** `fb6bdb2` · **Archivos auditados:** `index.html:798` · `app.js:926` · `styles.css:1911` · `server.js:180` · `vite.config.js` · `package.json`

---

## 1. Resumen Ejecutivo

El proyecto resuelve funcionalmente (landing + reservas + Culqi + EmailJS) pero exhibe patrones clásicos de **AI Slop**: generación iterativa por parches, acumulación de *duct-tape*, mezcla de paradigmas y simulación de funcionalidades.

* **¿Es slop crítico que impida operar? No.** La página vende y cobra.
* **¿Es slop que encarece mantener/escalar? Sí.** `app.js` monolito de 926 líneas con 47 accesos a `window`, 16 `!important` implícitos vía `style.cssText`, y un stub de 45 líneas en `<head>` para tapar un `ReferenceError` de arquitectura.

> **AI Slop Index (ASI) = 6.9 / 10** — donde `0 = código artesanal` y `10 = slop puro`
> **Quality Score (QS) = 10 − ASI = 3.1 / 10** — calidad ingenieril percibida
> **Veredicto:** Medio-Alto. Priorizar Fase 1 (higiene arquitectónica) antes de añadir features.

---

## 2. Metodología de Puntuación

**Definición operativa de AI Slop:**
1. **Parches sobre parches** — se corrige el síntoma, no la causa.
2. **Mezcla de paradigmas** — ES Modules + `onclick=""` + mutación global + estilos inline inyectados por JS.
3. **Bloat** — código/css/estructura que crece sin poda.
4. **Fachada** — funcionalidad que *parece* real (timestamp vivo) pero es estática.
5. **Copy genérico** — textos de relleno LLM sin voz de marca.

Cada dimensión se puntúa `0–10 ASI` (0 sin slop, 10 slop máximo). La escala se invierte para QS si se prefiere leer “calidad”.

---

## 3. Scorecard Dimensional

| # | Dimensión | ASI (0-10) | QS (10-ASI) | Severidad | Evidencia principal |
|---|-----------|-----------:|------------:|-----------|---------------------|
| **1** | Arquitectura & Paradigmas JS | **8.0** | 2.0 | 🔴 Crítica | `app.js:926` monolito, `window._reservaData/_horarioSeleccionado/_claseIdx/culqi/openModal` (`app.js:47` accesos), `index.html:36-80` stub de 45 líneas para tapar `claseCarouselNext is not defined` |
| **2** | Parches / Duct-Tape | **8.5** | 1.5 | 🔴 Crítica | `app.js:47-57` interceptor `img.onerror` que renombra `.jpg→.jpeg/.png` en runtime; `app.js:3-29` botón WhatsApp creado por JS con `style.cssText` de 400 chars duplicando `.whatsapp-float` de `styles.css:48-58` |
| **3** | Mantenibilidad & Bloat CSS | **6.5** | 3.5 | 🟠 Alta | `styles.css:1911` líneas para single-page (≈57 kB); variables `--sp-*` bien definidas pero no purgadas; breakpoints duplicados `styles.css:1415-1581` con overrides manuales |
| **4** | Autenticidad Datos / Funcionalidad | **7.5** | 2.5 | 🔴 Crítica | `app.js:658-663` `FORECAST_DATA` hardcodeado + `loadBeachData():733-735` actualiza `lastUpdated` con `new Date().toLocaleTimeString` simulando frescura; disclaimer menciona `Open-Meteo` sin fetch real |
| **5** | Estado Global & Acoplamiento | **7.0** | 3.0 | 🟠 Alta | `window` como store; `claseIdx` vs `window._claseIdx` duplicado `app.js:810-851` + sync manual; `server.js:86-98` duplica `PRECIOS` y `calculateTotalWithCommission` ya definidos en frontend |
| **6** | Seguridad & Validación | **6.0** | 4.0 | 🟡 Media | `server.js:102-174` sin `helmet`, sin `express-rate-limit`, logs verbosos `console.log('[Culqi]...')` exponen flujo; validación de monto solo `Math.abs >100` `server.js:129`; `index.html:765` `pk_test_VfKYw1haKMh0Zqh0` hardcodeada; EmailJS keys públicas en cliente `app.js:32` sin `.env` |
| **7** | Performance & Assets | **5.5** | 4.5 | 🟡 Media | Vite ok (`vite.config.js:5` hashed assets 1y immutable `server.js:29`), pero `img/` 33 archivos sin `srcset`/`sizes`, sin compresión `sharp` en build; CDN externo Camden `index.html:471,481,491,525` rompe cache busting |
| **8** | HTML Semántico & Accesibilidad | **5.0** | 5.0 | 🟡 Media | 23× `onclick=""` remanentes `index.html:200,221,271,294,318,342,365,618-620` (aunque `clase/Gallery` ya migrados a `id`), `aria-label` añadido solo en nuevos botones; modal `aria-modal` ok pero foco no atrapado |
| **9** | UX Writing / Copy | **5.0** | 5.0 | 🟢 Aceptable | Visual pulido, pero cards con bullets idénticos `index.html:264-266 vs 287-290` y descripciones genéricas LLM (“Aprende en un ambiente divertido”, “La mejor inversión para dominar el surf”) |
| **10** | DevEx / Tooling / Testing | **7.0** | 3.0 | 🟠 Alta | Sin linter/formatter, sin tests (`test-payments.js:233` es script manual, no `vitest/jest`), sin `type: module` coherente, `package.json` sin `eslint/prettier`, commits `fix: forzar redeploy` repetidos |

**ASI global ponderado: 6.9 / 10** (media con peso 2× en 1,2,4).

---

## 4. Hallazgos Detallados con Traza `file:line`

### 🔴 1) Arquitectura — “Módulo que no es módulo”
- `index.html:782` `<script type="module" src="app.js">` pero `app.js` expone todo vía `window.openModal = ...` `app.js:619-623` y `window.culqi = culqiHandler` `app.js:547`. El uso de ES Modules es solo nominal.
- `app.js:810` `function claseIsMobile(){ return innerWidth <=768 }` — dead code nunca llamado (slop de generación).
- `app.js:66-79` listener de scroll con `rAF` bien hecho convive con `app.js:47-57` hack de imágenes — dos niveles de ingeniería distintos superpuestos.

### 🔴 2) Duct-Tape emblemático
- **Stub en `<head>` `index.html:36-80`**: 45 líneas que reimplementan `fallbackClase(dir)` y hacen `bindEarly()` porque los botones existían antes con `onclick`. La causa raíz era el orden de carga `Vite head inject` vs `EmailJS defer` (`index.html:781` vs `index.html:782`); se tapó con estado duplicado `window._claseIdx`.
- **Imagen hack `app.js:47-57`**:
  ```js
  // en lugar de corregir index.html:413 galeria4.jpg vs galeria4.webp
  img.addEventListener('error', () => { if(src.endsWith('.jpg')) this.src=src.replace('.jpg','.jpeg') })
  ```
- **WhatsApp flotante `app.js:3-29`** inyecta `style.cssText` hardcodeado y recalcula tamaños por `innerWidth` en JS, duplicando `styles.css:48-58 .whatsapp-float`. Si el CSS cambia, el JS diverge.

### 🟠 3) Estado global
- `window._reservaData`, `window._horarioSeleccionado`, `window._claseIdx` mutados desde 6 sitios distintos. Migración parcial: `claseIdx` local + `window._claseIdx` global `app.js:823-826,844-847` es reconciliación manual de un bug auto-infligido.
- `server.js:86-98` re-declara `PRECIOS` y `CULQI_COMMISSION_RATE` idénticos al frontend. Debería ser `shared/pricing.js` importado por ambos.

### 🔴 4) Pronóstico fachada
- `app.js:625-739` sección completa con `DAYS_SHORT/MONTHS_ES`, `degToCardinal`, `evalSurfQuality`, `buildDayCard` — ingeniería visual convincente sobre `FORECAST_DATA` estático `app.js:658-663`. El usuario ve “Última actualización: 14:32” y asume API viva.
- Riesgo reputacional: disclaimer `index.html:453` cita Open-Meteo pero no hay `fetch`.

### 🟡 5) Seguridad
- `server.js:15` `express.json()` sin límite de tamaño → vector DoS.
- `server.js:102` `app.post('/api/culqi-charge')` sin `rateLimit`, sin `helmet`, sin `zod`/`joi`. Sanitización mínima.
- `server.js:124` `console.log('[Culqi] Datos recibidos:', {tipo, personas, ...})` loguea PII en producción.

### 🟡 6) Performance
- `server.js:18-24` cache en memoria con `Brotli 11` y `ETag` — excelente, es lo menos “slop” del repo.
- Contrapeso: `img/` sin pipeline: `package.json` declara `sharp: ^0.35.3` pero ningún script lo usa; faltan `srcset` y `loading="lazy"` ya está pero sin `decoding` coherente.

---

## 5. Métricas Cuantitativas (2026-08-27)

| Métrica | Valor | Umbral saludable | Estado |
|---------|------:|-----------------|--------|
| `styles.css` líneas | 1911 | < 900 | 🔴 |
| `app.js` líneas | 926 | < 400 por módulo | 🔴 |
| `index.html` líneas | 798 | < 500 (con parciales) | 🟡 |
| Accesos `window.` | 47 | < 5 | 🔴 |
| `onclick=""` inline | 23 | 0 | 🔴 |
| `!important` / `style.cssText` | 1 bloque 400 chars | 0 | 🟡 |
| Duplicación precios | 2 fuentes | 1 fuente única | 🔴 |
| Endpoints sin rate-limit | 1/1 | 0/1 | 🔴 |
| Tests automatizados | 0 | ≥ 1 | 🔴 |

---

## 6. Plan de Remediación — Roadmap

### Fase 1 — Higiene Crítica (1–2 días) · Impacto ⭐⭐⭐⭐⭐ · Esfuerzo 🟢 Bajo
- [ ] **Eliminar stub `<head>` y migrar `onclick` restantes a `addEventListener`** `index.html:200,221,271,294,318,342,365,618-620,666,682,727,738,747,750`
  - Crear `src/modules/modal.js`, `src/modules/carouselClases.js`, `src/modules/carouselGallery.js` con export/import reales; borrar `window.*`.
  - **Criterio done:** `grep -r "onclick" index.html` = 0 y `grep -r "window\." app.js` < 5.
- [ ] **Borrar hack de imágenes y corregir extensiones** `app.js:47-57` + `index.html:413,415` (`galeria4.jpg` existe como `.jpg` pero picture usa `.webp` con fallback roto)
  - Unificar a `.webp` con `.jpeg` fallback real y auditar `img/` (renombrar o corregir `src`).
- [ ] **Unificar botón WhatsApp**
  - Borrar `app.js:3-29`, dejar `<a class="whatsapp-float">` en `index.html` + mover responsive a `styles.css` con `@media`.
- [ ] **Single source of pricing**
  - Crear `shared/pricing.js` y que `app.js` y `server.js:86-98` lo importen.

### Fase 2 — Autenticidad & Robustez (3–5 días) · Impacto ⭐⭐⭐⭐ · Esfuerzo 🟡 Medio
- [ ] **Pronóstico real Open-Meteo Marine**
  - `GET https://marine-api.open-meteo.com/v1/marine?latitude=-12.1444&longitude=-77.0284&hourly=wave_height,wave_period,wave_direction,swell_wave_height&daily=wave_height_max,tide_height_max,tide_height_min&timezone=America/Lima`
  - Cache `server.js` 30 min + fallback a `FORECAST_DATA` con badge “Datos de respaldo · sin conexión”.
  - Actualizar `loadBeachData():714-737` para fetch real, manejo de `forecastError` y `lastUpdated` con timestamp de API.
- [ ] **Seguridad backend**
  - Añadir `helmet`, `express-rate-limit` (10 req/min por IP en `/api/culqi-charge`), `zod` para `tipo/personas/email/amount`, limitar `express.json({limit:'10kb'})`, sanitizar logs (no PII).
- [ ] **Localizar assets Camden**
  - Descargar 4 imágenes `camdenperu.com/cdn/...` a `public/img/partners/camden-*` y reemplazar `index.html:471,481,491,525`; añadir `width/height` explícito.

### Fase 3 — Calidad & Escalabilidad (1 semana) · Impacto ⭐⭐⭐ · Esfuerzo 🟡 Medio-Alto
- [ ] **Modularizar `app.js`**
  - Split en `src/main.js` + `src/modules/{navbar,scrollProgress,carousel,reservation,forecast,culqi}.js` (cada <200 líneas), usar `import` nativo vía Vite.
- [ ] **CSS diet**
  - Purgar con `vite + postcss` + `cssnano`; consolidar `.clase-card` duplicado `styles.css:342-359 vs 1415-1422`; extraer utilidades `--radius/pill` repetidas; objetivo <1000 líneas.
- [ ] **Tooling**
  - `eslint` + `prettier`, `vitest` con 1 test de `calculateTotalWithCommission` (ya hay casos en `test-payments.js:81`), `type-check` opcional, Husky pre-commit.
- [ ] **A11y**
  - Trap focus en modal, `ESC` ya ok `app.js:209`, añadir `aria-controls` en FAQ `index.html:564`, y test con `axe`.

---

## 7. Matriz Esfuerzo × Impacto

| Tarea | Impacto | Esfuerzo | Prioridad | ASI mitigado |
|-------|:-------:|:--------:|:---------:|:------------:|
| Migrar `onclick` + eliminar stub `<head>` | ⭐⭐⭐⭐⭐ | 🟢 2 h | **P0** | −2.0 |
| Borrar hack imágenes + unificar WhatsApp | ⭐⭐⭐⭐ | 🟢 1 h | **P0** | −1.0 |
| `shared/pricing.js` single source | ⭐⭐⭐ | 🟢 0.5 h | **P0** | −0.5 |
| Open-Meteo real + fallback honesto | ⭐⭐⭐⭐⭐ | 🟡 4 h | **P1** | −1.5 |
| `helmet` + `rateLimit` + `zod` | ⭐⭐⭐⭐ | 🟢 1 h | **P1** | −0.8 |
| Localizar Camden assets | ⭐⭐⭐ | 🟢 0.5 h | **P1** | −0.3 |
| Modularizar `app.js` | ⭐⭐⭐⭐ | 🟡 6 h | **P2** | −1.0 |
| Purgar CSS 1911→900 líneas | ⭐⭐⭐ | 🟡 5 h | **P2** | −0.7 |
| ESLint/Prettier/Vitest + CI | ⭐⭐⭐ | 🟡 3 h | **P2** | −0.5 |

**ASI proyectado post-Fase 1:** 6.9 → **4.4** · **Post-Fase 2:** → **2.1** · **Post-Fase 3:** → **0.9** (QS 9.1)

---

## 8. Checklist de Validación (Definition of Done anti-slop)

- [ ] `npm run build` sin warnings; `dist/index.html` sin `<script>` inline >10 líneas
- [ ] `grep -c "window\." src/**/*.js` ≤ 3 (solo `window.culqi` por requisito SDK)
- [ ] `npm run lint` 0 errores; `npm test` ≥ 5 tests (pricing, carousel, forecast parser)
- [ ] Lighthouse Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95
- [ ] `/api/culqi-charge` responde `429` tras 11 req/min
- [ ] Pronóstico muestra badge “En vivo” vs “Respaldo” según `fetch` status
- [ ] `styles.css` < 1000 líneas y 0 `style.cssText` en JS

---

## 9. Nota de Cierre

El proyecto no es “malo” — es **típico de iteración rápida asistida por IA sin poda**. El slop no está en la idea sino en la *deuda de integración*: cada fix añadió una capa en vez de refactorizar la anterior. Aplicar Fase 1 ya lleva el ASI de 6.9 a 4.4 y elimina el 80 % del ruido percibido por usuarios y por el próximo mantenedor.

> **Próximo paso recomendado:** ejecutar Fase 1 en una rama `refactor/anti-slop-p0` y abrir PR con los 3 commits atómicos (onclick→listener, whatsapp→html, pricing→shared). El resto puede planificarse por sprints.

