<div align="center">
  <img src="public/img/icon.png" alt="IndexPulse Logo" width="128" height="128" />
  <h1>IndexPulse — SERP Studio & SEO Suite</h1>
  <p><strong>Diagnóstico de Indexación, Simulador SERP, Core Web Vitals y Auditoría de Seguridad Web</strong></p>

  [![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
  [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
  [![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()

  <br>

  <p>
    <strong>Languages / Idiomas:</strong> 
    <a href="#-versión-en-español">Español</a> • 
    <a href="#-english-version">English</a>
  </p>
</div>

---

# 🇪🇸 Versión en Español

**IndexPulse** es una suite profesional de auditoría SEO, diagnóstico de indexación en buscadores, simulación SERP con Rich Snippets, análisis de velocidad Web (Core Web Vitals) y evaluación de seguridad web en tiempo real.

---

## 🚀 Características Principales

### 1. Diagnóstico de Indexación en Buscadores
* **Google, Bing, DuckDuckGo, Yahoo! y Yandex**: Comprueba la presencia de cualquier URL en los índices de búsqueda.
* **Directivas Técnicas**: Inspección exhaustiva de `robots.txt` (reglas Disallow/Allow), `<meta name="robots">` (`noindex`, `nofollow`), cabecera HTTP `X-Robots-Tag`, etiqueta `<link rel="canonical">` y detección de Mapa del Sitio (Sitemap XML).

### 2. Simulador SERP en Vivo & Redes Sociales
* **Google Escritorio (Desktop)**: Renderizado fotorrealista con favicon, migas de pan (breadcrumbs), título azul interactivo con medidor de píxeles (~580px límite) y descripción.
* **Google Móvil (Mobile)**: Simulación de tarjeta nativa para pantallas de smartphones.
* **Microsoft Bing**: Previsualización con el formato original del buscador Bing.
* **Redes Sociales (Open Graph & Twitter Cards)**: Vista previa para compartir en WhatsApp, Facebook, LinkedIn y X (Twitter).
* **Editor Interactivo en Tiempo Real**: Modifica el `<title>` y `<meta name="description">` al vuelo para calcular longitud y evitar truncamientos (`...`).

### 3. Velocidad Web & Core Web Vitals (Google PageSpeed)
* **Puntuación de Rendimiento (0-100)**: Calibrado con los estándares de Google Lighthouse.
* **Métricas Core Web Vitals**:
  * **LCP** (*Largest Contentful Paint*): Velocidad de renderizado del elemento visual principal.
  * **FCP** (*First Contentful Paint*): Aparición del primer contenido visual.
  * **CLS** (*Cumulative Layout Shift*): Estabilidad visual sin desplazamientos bruscos.
  * **TBT** (*Total Blocking Time*): Medición de bloqueo del hilo principal por scripts.
  * **TTFB** (*Time to First Byte*): Tiempo de respuesta del servidor.
  * **Speed Index**: Tasa de visualización del contenido.
* **Velocidad de Rastreo (Crawl Speed)**: Evaluación de latencia para Googlebot y Bingbot para preservar el Crawl Budget.
* **Inventario de Recursos**: Análisis de peso HTML, compresión Gzip/Brotli, cantidad de CSS y scripts externos con enlaces directos a Google PageSpeed Insights oficial.

### 4. Auditoría de Seguridad & Cabeceras HTTP
* **Puntuación de Seguridad (0-100)** y diagnóstico de defensas activas del servidor.
* **Cabeceras HTTP Inspeccionadas**:
  * `Strict-Transport-Security (HSTS)`: Forzado de conexiones cifradas.
  * `Content-Security-Policy (CSP)`: Mitigación contra inyecciones XSS.
  * `X-Frame-Options`: Protección activa contra Clickjacking.
  * `X-Content-Type-Options: nosniff`: Prevención de MIME Sniffing.
  * `Referrer-Policy` y `Permissions-Policy`.
* **Detección de Contenido Mixto (Mixed Content)**: Detección de imágenes, scripts o estilos HTTP no cifrados en páginas HTTPS.

### 5. Datos Estructurados Schema.org & Rich Snippets
* **Simulador de Resultados Enriquecidos**: Visualización en Google de estrellas de valoración (⭐⭐⭐⭐⭐ `AggregateRating`), precios y stock de productos (`Offers`), y preguntas frecuentes (`FAQPage`).
* **Inspector JSON-LD**: Desglose de todos los esquemas semánticos detectados en el código fuente.

### 6. SEO Internacional & Geolocalización (`hreflang`)
* Detección y validación de etiquetas `<link rel="alternate" hreflang="...">`.
* Validación de autorreferencia de idioma y comprobación del atributo `<html lang>`.

### 7. Auditoría SEO On-Page Exhaustiva
* **Puntuación Global de Salud SEO (0-100)** con indicador circular animado.
* Conteo de palabras, ratio texto/código HTML.
* Jerarquía de encabezados `<h1>` a `<h4>` (detección de H1 faltante o duplicado).
* Detección de imágenes sin atributo `alt` obligatorio y galería visual de muestra.
* Análisis y tabla de densidad de palabras clave principales.

### 8. Recomendaciones, Checklist & Exportación a PDF
* Integración unificada de todos los fallos (Indexación, SEO, Seguridad, Velocidad y Schema).
* Filtros por severidad: 🔴 Críticos, 🟡 Advertencias y 🟢 Aprobados.
* **Botón de Imprimir / Exportar Informe**: Genera un informe PDF completo que imprime todas las pestañas y secciones de forma consecutiva y profesional.

---

## 💻 Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/alberto2005-coder/gestion_web.git
   cd gestion_web
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor**:
   ```bash
   npm start
   ```

4. **Abrir en el navegador**:
   Visita [http://localhost:3000](http://localhost:3000)

---
---

# 🇬🇧 English Version

**IndexPulse** is an all-in-one professional SEO audit suite, search engine indexation checker, SERP & Rich Snippet simulator, Web Speed analyzer (Core Web Vitals), and HTTP security inspector in real time.

---

## 🚀 Key Features

### 1. Search Engine Indexation Diagnosis
* **Google, Bing, DuckDuckGo, Yahoo!, and Yandex**: Verifies whether any webpage is indexed across major search engines.
* **Technical Directives**: Deep analysis of `robots.txt` (Disallow/Allow rules), `<meta name="robots">` (`noindex`, `nofollow`), HTTP `X-Robots-Tag` header, `<link rel="canonical">` canonical tags, and XML Sitemap detection.

### 2. Live SERP Simulator & Social Media Cards
* **Google Desktop**: Photorealistic SERP result featuring website favicon, breadcrumbs, clickable blue title with pixel-length gauge (~580px cut-off), and meta description snippet.
* **Google Mobile**: Native smartphone card simulation.
* **Microsoft Bing**: Authentic Bing SERP layout rendering.
* **Social Media Cards (Open Graph & Twitter Cards)**: Previews for WhatsApp, Facebook, LinkedIn, and X (Twitter).
* **Interactive Live Editor**: Edit `<title>` and `<meta name="description">` in real time to calculate character counts and prevent truncation (`...`).

### 3. Web Speed & Core Web Vitals (Google PageSpeed)
* **Performance Score (0-100)**: Calibrated against Google Lighthouse scoring standards.
* **Core Web Vitals Metrics**:
  * **LCP** (*Largest Contentful Paint*): Measures perceived loading speed of the main content.
  * **FCP** (*First Contentful Paint*): Time to render the very first DOM element.
  * **CLS** (*Cumulative Layout Shift*): Quantifies unexpected layout shifts for visual stability.
  * **TBT** (*Total Blocking Time*): Quantifies main thread execution delays caused by JavaScript.
  * **TTFB** (*Time to First Byte*): Server responsiveness and initial latency.
  * **Speed Index**: Content population visual progression.
* **Search Engine Crawl Speed**: Assesses Googlebot and Bingbot crawl latency to safeguard Crawl Budget.
* **Resource Inventory**: Inspection of HTML payload size, Gzip/Brotli server compression, external CSS/JS counts, and direct links to official Google PageSpeed Insights.

### 4. HTTP Security & Headers Audit
* **Security Score (0-100)** and server defense evaluation.
* **HTTP Headers Inspected**:
  * `Strict-Transport-Security (HSTS)`: Enforces secure SSL/TLS connections.
  * `Content-Security-Policy (CSP)`: Guards against XSS and code injection.
  * `X-Frame-Options`: Defends against Clickjacking attacks.
  * `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
  * `Referrer-Policy` & `Permissions-Policy`.
* **Mixed Content Detection**: Identifies insecure HTTP assets (images, stylesheets, scripts) loaded within HTTPS pages.

### 5. Schema.org Structured Data & Rich Snippets
* **Rich Snippets Simulator**: Preview how Google renders rating stars (⭐⭐⭐⭐⭐ `AggregateRating`), product prices/stock (`Offers`), and FAQ accordion dropdowns (`FAQPage`).
* **JSON-LD Schema Inspector**: Lists and validates all semantic `@type` schemas detected on the webpage.

### 6. International SEO & Multilingual Support (`hreflang`)
* Detection and validation of `<link rel="alternate" hreflang="...">` language/region tags.
* Verifies self-referencing canonicals and the root `<html lang>` attribute.

### 7. Comprehensive On-Page SEO Audit
* **Global SEO Health Score (0-100)** with animated circular gauge.
* Total word count and text-to-HTML ratio computation.
* Heading structure audit (`<h1>` through `<h4>`), flagging missing or duplicate H1 tags.
* Image audit identifying missing `alt` attributes with visual preview cards.
* Keyword density calculation and frequency breakdown table.

### 8. Actionable Checklist & PDF Report Export
* Aggregates all detected issues (Indexation, SEO, Security, Performance, and Schema) into a single checklist.
* Priority filtering: 🔴 Critical Issues, 🟡 Warnings, and 🟢 Passed Audits.
* **Print / Export PDF Report Button**: Generates a unified, clean document rendering all analysis modules sequentially for client reporting.

---

## 📄 Licencia

Este proyecto está bajo la [Licencia GNU General Public License v3.0 (GPL-3.0)](LICENSE).

---

## 💻 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/alberto2005-coder/gestion_web.git
   cd gestion_web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📄 License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
