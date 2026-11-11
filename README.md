# 🌐 IndexPulse — SERP Studio & SEO Suite

<p align="center">
  <img src="public/img/icon.png" alt="IndexPulse Logo" width="128" height="128" />
</p>

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()

[Español](#español) · [English](#english)

---

## Español

### Índice

- [Descripción](#descripción)
- [Características](#características)
- [Instalación y uso](#instalación-y-uso)
- [Licencia](#licencia)

### Descripción

**IndexPulse** es una suite profesional de auditoría SEO, diagnóstico de indexación en buscadores, simulación SERP con Rich Snippets, análisis de velocidad web (Core Web Vitals) y evaluación de seguridad web en tiempo real.

### Características

#### 1. Diagnóstico de indexación en buscadores

- **Google, Bing, DuckDuckGo, Yahoo! y Yandex**: comprueba la presencia de cualquier URL en los índices de búsqueda.
- **Directivas técnicas**: inspección exhaustiva de `robots.txt` (reglas Disallow/Allow), `<meta name="robots">` (`noindex`, `nofollow`), cabecera HTTP `X-Robots-Tag`, etiqueta `<link rel="canonical">` y detección de sitemap XML.

#### 2. Simulador SERP en vivo y redes sociales

- **Google escritorio**: renderizado fotorrealista con favicon, migas de pan, título azul interactivo con medidor de píxeles (~580 px de límite) y descripción.
- **Google móvil**: simulación de tarjeta nativa para pantallas de smartphone.
- **Microsoft Bing**: previsualización con el formato original de Bing.
- **Redes sociales (Open Graph y Twitter Cards)**: vista previa para compartir en WhatsApp, Facebook, LinkedIn y X (Twitter).
- **Editor interactivo en tiempo real**: modifica el `<title>` y la `<meta name="description">` al vuelo para calcular longitud y evitar truncamientos (`...`).

#### 3. Velocidad web y Core Web Vitals (Google PageSpeed)

- **Puntuación de rendimiento (0-100)**, calibrada con los estándares de Google Lighthouse.
- **Métricas Core Web Vitals**:
  - **LCP** (*Largest Contentful Paint*): velocidad de renderizado del elemento visual principal.
  - **FCP** (*First Contentful Paint*): aparición del primer contenido visual.
  - **CLS** (*Cumulative Layout Shift*): estabilidad visual sin desplazamientos bruscos.
  - **TBT** (*Total Blocking Time*): bloqueo del hilo principal por scripts.
  - **TTFB** (*Time to First Byte*): tiempo de respuesta del servidor.
  - **Speed Index**: tasa de visualización del contenido.
- **Velocidad de rastreo (crawl speed)**: evaluación de latencia para Googlebot y Bingbot para preservar el crawl budget.
- **Inventario de recursos**: análisis de peso HTML, compresión Gzip/Brotli, cantidad de CSS y scripts externos, con enlaces directos a Google PageSpeed Insights.

#### 4. Auditoría de seguridad y cabeceras HTTP

- **Puntuación de seguridad (0-100)** y diagnóstico de defensas activas del servidor.
- **Cabeceras HTTP inspeccionadas**:
  - `Strict-Transport-Security (HSTS)`: fuerza conexiones cifradas.
  - `Content-Security-Policy (CSP)`: mitiga inyecciones XSS.
  - `X-Frame-Options`: protege frente a clickjacking.
  - `X-Content-Type-Options: nosniff`: evita el MIME sniffing.
  - `Referrer-Policy` y `Permissions-Policy`.
- **Detección de contenido mixto (mixed content)**: imágenes, scripts o estilos HTTP sin cifrar dentro de páginas HTTPS.

#### 5. Datos estructurados Schema.org y Rich Snippets

- **Simulador de resultados enriquecidos**: visualización en Google de estrellas de valoración (⭐⭐⭐⭐⭐ `AggregateRating`), precios y stock de productos (`Offers`) y preguntas frecuentes (`FAQPage`).
- **Inspector JSON-LD**: desglose de todos los esquemas semánticos detectados en el código fuente.

#### 6. SEO internacional y geolocalización (`hreflang`)

- Detección y validación de etiquetas `<link rel="alternate" hreflang="...">`.
- Validación de autorreferencia de idioma y comprobación del atributo `<html lang>`.

#### 7. Auditoría SEO on-page exhaustiva

- **Puntuación global de salud SEO (0-100)** con indicador circular animado.
- Conteo de palabras y ratio texto/código HTML.
- Jerarquía de encabezados `<h1>` a `<h4>` (detecta H1 faltante o duplicado).
- Detección de imágenes sin atributo `alt` obligatorio y galería visual de muestra.
- Análisis y tabla de densidad de palabras clave principales.

#### 8. Recomendaciones, checklist y exportación a PDF

- Integración unificada de todos los fallos (indexación, SEO, seguridad, velocidad y Schema).
- Filtros por severidad: 🔴 críticos, 🟡 advertencias y 🟢 aprobados.
- **Botón de imprimir / exportar informe**: genera un PDF completo con todas las pestañas y secciones de forma consecutiva.

### Instalación y uso

1. **Clona el repositorio**:

   ```bash
   git clone https://github.com/alberto2005-coder/gestion_web.git
   cd gestion_web
   ```

2. **Instala las dependencias**:

   ```bash
   npm install
   ```

3. **Inicia el servidor**:

   ```bash
   npm start
   ```

4. **Abre el navegador** en [http://localhost:3000](http://localhost:3000).

### Licencia

Este proyecto está bajo la [Licencia GNU General Public License v3.0 (GPL-3.0)](LICENSE).

---

## English

### Table of contents

- [Overview](#overview)
- [Features](#features)
- [Getting started](#getting-started)
- [License](#license)

### Overview

**IndexPulse** is an all-in-one professional SEO audit suite: search engine indexation checker, SERP and Rich Snippet simulator, web speed analyzer (Core Web Vitals) and real-time HTTP security inspector.

### Features

#### 1. Search engine indexation diagnosis

- **Google, Bing, DuckDuckGo, Yahoo! and Yandex**: verifies whether any webpage is indexed across major search engines.
- **Technical directives**: deep analysis of `robots.txt` (Disallow/Allow rules), `<meta name="robots">` (`noindex`, `nofollow`), the HTTP `X-Robots-Tag` header, `<link rel="canonical">` tags and XML sitemap detection.

#### 2. Live SERP simulator and social cards

- **Google desktop**: photorealistic result with favicon, breadcrumbs, a clickable blue title with a pixel-length gauge (~580 px cut-off) and the meta description snippet.
- **Google mobile**: native smartphone card simulation.
- **Microsoft Bing**: authentic Bing layout rendering.
- **Social cards (Open Graph and Twitter Cards)**: previews for WhatsApp, Facebook, LinkedIn and X (Twitter).
- **Interactive live editor**: edit `<title>` and `<meta name="description">` in real time to check length and prevent truncation (`...`).

#### 3. Web speed and Core Web Vitals (Google PageSpeed)

- **Performance score (0-100)**, calibrated against Google Lighthouse standards.
- **Core Web Vitals metrics**:
  - **LCP** (*Largest Contentful Paint*): perceived loading speed of the main content.
  - **FCP** (*First Contentful Paint*): time to render the very first visual element.
  - **CLS** (*Cumulative Layout Shift*): unexpected layout shifts affecting visual stability.
  - **TBT** (*Total Blocking Time*): main-thread delays caused by JavaScript.
  - **TTFB** (*Time to First Byte*): server responsiveness and initial latency.
  - **Speed Index**: how quickly the content becomes visible.
- **Crawl speed**: Googlebot and Bingbot latency assessment to protect the crawl budget.
- **Resource inventory**: HTML payload size, Gzip/Brotli compression, external CSS/JS counts and direct links to Google PageSpeed Insights.

#### 4. HTTP security and headers audit

- **Security score (0-100)** and evaluation of the server's active defences.
- **HTTP headers inspected**:
  - `Strict-Transport-Security (HSTS)`: enforces encrypted connections.
  - `Content-Security-Policy (CSP)`: mitigates XSS and code injection.
  - `X-Frame-Options`: defends against clickjacking.
  - `X-Content-Type-Options: nosniff`: prevents MIME-type sniffing.
  - `Referrer-Policy` and `Permissions-Policy`.
- **Mixed content detection**: insecure HTTP images, stylesheets or scripts loaded inside HTTPS pages.

#### 5. Schema.org structured data and rich snippets

- **Rich results simulator**: preview how Google renders rating stars (⭐⭐⭐⭐⭐ `AggregateRating`), product prices and stock (`Offers`) and FAQ accordions (`FAQPage`).
- **JSON-LD inspector**: lists every semantic `@type` schema detected in the source.

#### 6. International SEO and multilingual support (`hreflang`)

- Detection and validation of `<link rel="alternate" hreflang="...">` language/region tags.
- Self-referencing language validation and `<html lang>` attribute checks.

#### 7. Comprehensive on-page SEO audit

- **Global SEO health score (0-100)** with an animated circular gauge.
- Word count and text-to-HTML ratio.
- Heading hierarchy audit (`<h1>` through `<h4>`), flagging missing or duplicate H1 tags.
- Image audit for missing `alt` attributes, with visual preview cards.
- Keyword density calculation and frequency table.

#### 8. Actionable checklist and PDF export

- Aggregates every detected issue (indexation, SEO, security, performance and Schema).
- Severity filters: 🔴 critical, 🟡 warnings and 🟢 passed.
- **Print / export report button**: generates a single clean PDF rendering every module in sequence.

### Getting started

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

4. **Open your browser** at [http://localhost:3000](http://localhost:3000).

### License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
