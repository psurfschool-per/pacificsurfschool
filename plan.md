# 🏄 Auditoría de AI Slop y Plan de Modernización – Pacific Surf School

## 1. 📊 Resumen Ejecutivo y Diagnóstico de "AI Slop"

El término **AI Slop** en desarrollo de software se refiere a patrones de código generados por IA caracterizados por:
- Parches rápidos ("duct-tape fixes") superpuestos para solucionar errores en lugar de corregir la causa raíz.
- Mezcla de paradigmas (inline `onclick`, inyecciones JS de CSS hardcodeado, hacks globales en `window`).
- Código inflado ("bloat") y redundante (CSS de >2,000 líneas para una landing page, lógica duplicada).
- Funcionalidades "maquilladas" (ej. pronóstico del mar con datos manuales estáticos pero con timestamp simulando tiempo real).
- Copywriting genérico con patrones típicos de plantillas generativas.

---

## 2. 🎯 Calificación Dimensional del Proyecto (AI Slop Index)

> **Puntuación de AI Slop Global:** **6.8 / 10** *(Nivel Medio-Alto de AI Slop detectado)*  
> *(10 = Código artesanal impecable / 1 = Código completamente desestructurado y lleno de slop)*

| Dimensión | Puntuación | Nivel de Slop | Hallazgo Principal |
| :--- | :---: | :---: | :--- |
| **1. Arquitectura y Paradigmas JS** | **5.5 / 10** | ⚠️ Alto | Inline `onclick` en HTML mezclado con ES Modules, stubs tempranos en `<head>` para evitar `ReferenceError`, estado global en `window`. |
| **2. Parches y Band-Aids** | **4.0 / 10** | 🚨 Crítico | Listener que intercepta errores de imagen para renombrar `.jpg` a `.jpeg`/`.png` en runtime en lugar de corregir las rutas en el HTML. |
| **3. Mantenibilidad y Bloat CSS** | **6.0 / 10** | ⚠️ Medio-Alto | 2,050 líneas de CSS (~72 KB) con selectores duplicados y estilos inyectados directamente desde JS (`whatsapp.style.cssText = ...`). |
| **4. Autenticidad de Datos / Funcionalidades** | **5.0 / 10** | ⚠️ Alto | Pronóstico de olas con array hardcodeado (`FORECAST_DATA`) pero con reloj de "Última actualización" dinámico y mención a Open-Meteo. |
| **5. Seguridad y Manejo de Estado** | **7.0 / 10** | 🟡 Aceptable | Sin rate limiting en endpoints de Express; llaves públicas de EmailJS y Culqi en el cliente sin encapsulación limpia. |
| **6. UX, Copywriting y Contenido** | **7.5 / 10** | 🟡 Aceptable | Diseño visual atractivo, pero con textos repetitivos en cards y dependencias de imágenes externas (CDN Shopify de Camden). |

---

## 3. 🔍 Desglose Detallado de Hallazgos ("AI Slop" Detectados)

### 🔴 1. Parches "Duct-Tape" y Código Defensivo Redundante
- **Script de rescate en `<head>` (`index.html:36-80`):** Define funciones fallback (`fallbackClase`, `window._claseIdx`) y hace un bind preventivo porque los botones en el HTML usan `onclick="openModal()"` antes de que el bundle de Vite o `app.js` termine de cargar.
- **Detector de extensión errónea (`app.js:47-57`):**
  ```javascript
  // Band-aid que intenta salvar imágenes rotas en lugar de arreglar el HTML
  img.addEventListener('error', function() {
    if (src.endsWith('.jpg')) this.src = src.replace('.jpg', '.jpeg');
  });
  ```
- **Botón de WhatsApp duplicado:** Creado e inyectado con estilos inline masivos en `app.js:3-29` a pesar de que ya existían reglas en `styles.css`.

### 🟡 2. Estado Global y Acoplamiento en `window`
- Variables mutables globales: `window._reservaData`, `window._horarioSeleccionado`, `window._claseIdx`, `window.culqi`, `window.openModal`, `window.nextStep`.
- Dificulta pruebas unitarias, modularización y genera riesgos de colisión de nombres.

### 🟡 3. Funcionalidad de Pronóstico Simulada
- El HTML promete conexión con *Open-Meteo*, pero `app.js` tiene 4 días fijos con valores estáticos:
  ```javascript
  const FORECAST_DATA = [
    { olas: 0.8, periodo: 18, direccion: 225, energia: 108, marea_alta: 0.81, marea_baja: 0.2 }, ...
  ];
  ```
- La función `loadBeachData()` actualiza el texto "Última actualización: HH:MM" con la hora del navegador para aparentar frescura de datos.

### 🟡 4. CSS Inflado e Imágenes Externas
- Más de 2,000 líneas de CSS para una single-page. Hay múltiples definiciones de botones, ribbons y carruseles que pueden unificarse con variables CSS y clases utilitarias limpias.
- Sección Camden usa imágenes directas de la tienda Shopify externa (`https://camdenperu.com/cdn/shop/files/...`), las cuales pueden romperse si la tienda externa actualiza o borra sus assets.

---

## 4. 🚀 Plan de Mejoras y Refactorización (Roadmap)

### Fase 1: Limpieza de "Duct-Tape" y Arquitectura JS (Prioridad Alta)
- [ ] **Eliminar el fallback script del `<head>`:** Reemplazar todos los `onclick="..."` en `index.html` por selectores y `addEventListener` declarativos dentro de `app.js` o módulos correspondientes.
- [ ] **Eliminar el interceptor de imágenes erróneas:** Corregir en el código fuente (`index.html`) todas las extensiones de imágenes correctas (`.webp`, `.jpeg`).
- [ ] **Encapsular el estado de reservas y carruseles:** Crear un módulo o clase `ReservationModal` y `Carousel` sin contaminar el objeto global `window`.
- [ ] **Limpiar el botón flotante de WhatsApp:** Mover su definición a HTML y sus estilos exclusivamente a `styles.css`.

### Fase 2: Integración Real del Pronóstico de Olas (Prioridad Media)
- [ ] **Conexión real a la API de Open-Meteo Marine:**
  - Consumir el endpoint público de olas de Barranquito/Lima (`https://marine-api.open-meteo.com/v1/marine?latitude=-12.1444&longitude=-77.0284&hourly=wave_height,wave_period,wave_direction`).
  - Implementar fallback resiliente: si la API falla, usar datos en caché o datos de respaldo con un indicador visual honesto.

### Fase 3: Optimización y Reducción de CSS (Prioridad Media)
- [ ] **Auditar y purgar `styles.css`:** Reducir de 2,050 líneas a ~800-1,000 líneas mediante consolidación de componentes, unificación de botones y eliminación de reglas muertas.
- [ ] **Descargar y alojar localmente assets de partners:** Guardar las imágenes de Camden en `/public/img/partners/` para evitar enlaces rotos de terceros.

### Fase 4: Robustez en Backend y Pagos (Prioridad Media-Baja)
- [ ] **Rate Limiting en Express:** Agregar `express-rate-limit` a `/api/culqi-charge` para prevenir abusos.
- [ ] **Sanitización de inputs:** Validar esquemas de datos entrantes (nombre, email, montos) antes de enviar a Culqi.

---

## 5. 📋 Matriz de Esfuerzo vs. Impacto

| Tarea | Impacto | Esfuerzo | Prioridad |
| :--- | :---: | :---: | :---: |
| Eliminar inline handlers y stubs en `<head>` | ⭐⭐⭐⭐⭐ (Alto) | 🟢 1 hora | P1 |
| Unificar botón de WhatsApp y corregir rutas de imágenes | ⭐⭐⭐⭐ (Alto) | 🟢 30 min | P1 |
| Conectar Open-Meteo Marine API real | ⭐⭐⭐⭐⭐ (Alto) | 🟡 1.5 horas | P2 |
| Reducción y refactorización de CSS | ⭐⭐⭐⭐ (Medio-Alto) | 🟡 2 horas | P2 |
| Rate-limiting y sanitización en Backend | ⭐⭐⭐ (Medio) | 🟢 45 min | P3 |
