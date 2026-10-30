# IndexPulse — SERP Studio & SEO Indexation Analyzer

Aplicación web profesional para comprobar el estado de indexación de cualquier página web, previsualizar exactamente cómo aparece en Google y Bing (SERP Snippet), y auditar su salud SEO en tiempo real.

---

## 🚀 Características Principales

1. **Diagnóstico de Indexación en Buscadores**:
   - **Google, Bing, DuckDuckGo, Yahoo! y Yandex**: Comprueba presencia en los resultados cuando puede consultarse directamente. Google y Yandex solo se marcan como indexados o no detectados cuando hay resultados verificables; si el buscador bloquea la consulta automática, se indica que no se pudieron verificar. La rastreabilidad por sí sola no demuestra que una página esté indexada.
   - **Directivas Técnicas**: Análisis de `robots.txt` (reglas Disallow), `<meta name="robots">` (`noindex`, `nofollow`), cabecera HTTP `X-Robots-Tag`, etiqueta `<link rel="canonical">` y detección de Sitemap XML.

2. **Simulador SERP (Cómo sale en buscadores)**:
   - **Google Escritorio (Desktop)**: Renderizado fotorrealista con favicon, migas de pan (breadcrumbs), título en azul con medidor de longitud de píxeles (~580px) y fragmento de descripción.
   - **Google Móvil (Mobile)**: Simulación de tarjeta para smartphones.
   - **Microsoft Bing**: Previsualización con el formato nativo de Bing.
   - **Redes Sociales**: Tarjeta Open Graph (Facebook, WhatsApp, LinkedIn) y Twitter Card.
   - **Editor Interactivo en Vivo**: Permite editar el título y la descripción al vuelo para probar cómo encajaría en Google sin ser truncado con puntos suspensivos.

3. **Auditoría SEO On-Page Exhaustiva**:
   - **Puntuación de Salud SEO (0 a 100)** con indicador circular animado y clasificación (Excelente, Bueno, Requiere Mejoras, Crítico).
   - Conteo de palabras, ratio texto/código HTML y tiempo de respuesta del servidor (TTFB).
   - Auditoría de encabezados `<h1>` a `<h4>` (detección de H1 faltante o duplicado).
   - Auditoría de imágenes: conteo de imágenes sin atributo `alt` obligatorio y galería de muestra.
   - Nube y tabla de densidad de palabras clave principales.
   - Enlaces internos vs externos y atributos `nofollow`.

4. **Recomendaciones y Checklist Accionable**:
   - Clasificación por severidad: 🔴 Crítico, 🟡 Advertencias y 🟢 Aprobados.
   - Filtros dinámicos y botón de **Imprimir / Exportar Informe a PDF**.

---

## 💻 Cómo Ejecutar la Aplicación

El servidor ya está ejecutándose en segundo plano en:
👉 **[http://localhost:3000](http://localhost:3000)**

Para iniciarlo manualmente en cualquier momento:

```bash
# Instalar dependencias si no lo has hecho
npm install

# Iniciar el servidor
npm start
```

Luego abre en tu navegador: `http://localhost:3000`



# IndexPulse — SERP Studio & SEO Indexation Analyzer

A professional web application designed to check any website's indexation status, preview exactly how it appears on Google and Bing (SERP Snippet), and audit its SEO health in real time.

---

## 🚀 Key Features

1. **Search Engine Indexation Diagnosis**:
* **Google, Bing, DuckDuckGo, Yahoo!, and Yandex**: Checks visibility across search engines when direct queries are possible. Google and Yandex are marked as indexed or undetected only when verifiable results are returned; if automated queries are blocked by the search engine, a "verification unavailable" status is displayed. Crawlability alone does not guarantee indexation.
* **Technical Directives**: Analysis of `robots.txt` (Disallow rules), `<meta name="robots">` (`noindex`, `nofollow`), HTTP `X-Robots-Tag` header, canonical tags (`<link rel="canonical">`), and XML Sitemap detection.


2. **SERP Simulator (Search Result Preview)**:
* **Google Desktop**: Photorealistic rendering featuring favicon, breadcrumbs, clickable blue title with pixel-length gauge (~580px max), and description snippet.
* **Google Mobile**: Card-style simulation optimized for smartphone displays.
* **Microsoft Bing**: Native Bing SERP layout preview.
* **Social Media Cards**: Open Graph (Facebook, WhatsApp, LinkedIn) and Twitter/X Card previews.
* **Live Interactive Editor**: Real-time editing of titles and meta descriptions to test character/pixel constraints before truncation (`...`).


3. **Comprehensive On-Page SEO Audit**:
* **SEO Health Score (0 to 100)** with an animated circular progress indicator and classification tiers (Excellent, Good, Needs Improvement, Critical).
* Word count, text-to-HTML ratio, and Time to First Byte (TTFB) server response monitoring.
* Heading hierarchy audit (`<h1>` through `<h4>`), detecting missing or duplicate H1 tags.
* Image audit: Image count, missing `alt` attributes check, and sample image gallery.
* Keyword density cloud and frequency breakdown table.
* Internal vs. external link analysis and `nofollow` attribute detection.


4. **Actionable Recommendations & Checklist**:
* Categorization by priority: 🔴 Critical Issues, 🟡 Warnings, and 🟢 Passed Audits.
* Dynamic filtering controls and a **Print / Export PDF Report** button.



---

## 💻 How to Run the Application

The server is running in the background at:
👉 **[http://localhost:3000](http://localhost:3000)**

To start it manually at any time:

```bash
# Install dependencies (if not installed yet)
npm install

# Start the server
npm start

```

Then open your browser and navigate to: `http://localhost:3000`

