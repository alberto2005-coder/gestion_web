# IndexPulse — SERP Studio, SEO, Web Speed & Security Suite

Aplicación web profesional para comprobar el estado de indexación de cualquier página web, previsualizar exactamente cómo aparece en Google y Bing (SERP Snippet & Rich Snippets), auditar la seguridad web y cabeceras HTTP, diagnosticar SEO internacional (`hreflang`), medir la velocidad de carga (Core Web Vitals) y auditar la salud SEO en tiempo real.

---

## 🚀 Características Principales

1. **Diagnóstico de Indexación en Buscadores**:
   - **Google, Bing, DuckDuckGo, Yahoo! y Yandex**: Comprueba presencia en los resultados cuando puede consultarse directamente. Google y Yandex solo se marcan como indexados o no detectados cuando hay resultados verificables; si el buscador bloquea la consulta automática, se indica que no se pudieron verificar.
   - **Directivas Técnicas**: Análisis de `robots.txt` (reglas Disallow), `<meta name="robots">` (`noindex`, `nofollow`), cabecera HTTP `X-Robots-Tag`, etiqueta `<link rel="canonical">` y detección de Sitemap XML.

2. **Simulador SERP (Cómo sale en buscadores)**:
   - **Google Escritorio (Desktop)**: Renderizado fotorrealista con favicon, migas de pan (breadcrumbs), título en azul con medidor de longitud de píxeles (~580px) y fragmento de descripción.
   - **Google Móvil (Mobile)**: Simulación de tarjeta para smartphones.
   - **Microsoft Bing**: Previsualización con el formato nativo de Bing.
   - **Redes Sociales**: Tarjeta Open Graph (Facebook, WhatsApp, LinkedIn) y Twitter Card.
   - **Editor Interactivo en Vivo**: Permite editar el título y la descripción al vuelo para probar cómo encajaría en Google sin ser truncado con puntos suspensivos.

3. **Velocidad Web & Core Web Vitals (Google PageSpeed & Search Speed)**:
   - **Puntuación de Rendimiento (0-100)**: Medidor visual calibrado con los estándares de Google Lighthouse.
   - **Métricas Core Web Vitals**: LCP (Largest Contentful Paint), FCP (First Contentful Paint), CLS (Cumulative Layout Shift), TBT (Total Blocking Time), TTFB (Time to First Byte) y Speed Index con indicadores de estado (Bueno, Mejorable, Lento).
   - **Velocidad de Rastreo para Googlebot / Bingbot**: Evaluación del impacto en el Crawl Budget y latencia de respuesta directa del servidor.
   - **Inventario de Recursos**: Análisis de peso HTML, compresión Gzip/Brotli, cantidad de hojas de estilo (CSS), scripts (JS) y enlaces directos a Google PageSpeed Insights.

4. **Auditoría de Seguridad & Cabeceras HTTP**:
   - **Puntuación de Seguridad (0 a 100)** y medidor de confianza.
   - **Cabeceras de Defensa**: Análisis de HTTPS/TLS, HSTS (*Strict-Transport-Security*), CSP (*Content-Security-Policy*), *X-Frame-Options* (contra Clickjacking), *X-Content-Type-Options* y *Referrer-Policy*.
   - **Detección de Contenido Mixto (Mixed Content)**: Alerta si una web HTTPS carga imágenes, scripts o estilos en HTTP plano no seguro.

5. **Datos Estructurados Schema.org & Rich Snippets**:
   - **Simulación de Resultados Enriquecidos**: Visualización de estrellitas de valoración (⭐⭐⭐⭐⭐), precios de producto, disponibilidad de stock y acordeones de preguntas frecuentes (FAQ).
   - **Inspector de Esquemas JSON-LD**: Desglose de tipos declarados (`@type`: Article, Product, Organization, FAQPage, etc.).

6. **SEO Internacional & Multilingüe (`hreflang`)**:
   - Detección y validación de etiquetas `<link rel="alternate" hreflang="...">`.
   - Comprobación de autorreferencia de idioma y código de idioma ISO del elemento `<html lang>`.

7. **Auditoría SEO On-Page Exhaustiva**:
   - **Puntuación de Salud SEO (0 a 100)** con indicador circular animado y clasificación (Excelente, Bueno, Requiere Mejoras, Crítico).
   - Conteo de palabras, ratio texto/código HTML y tiempo de respuesta del servidor (TTFB).
   - Jerarquía de encabezados `<h1>` a `<h4>`, auditoría de imágenes sin `alt` y densidad de palabras clave.

8. **Recomendaciones y Checklist Accionable**:
   - Clasificación por severidad: 🔴 Crítico, 🟡 Advertencias y 🟢 Aprobados.
   - Filtros dinámicos y botón de **Imprimir / Exportar Informe a PDF**.

---

## 💻 Cómo Ejecutar la Aplicación

El servidor se ejecuta en:
👉 **[http://localhost:3000](http://localhost:3000)**

Para iniciarlo manualmente en cualquier momento:

```bash
# Instalar dependencias si no lo has hecho
npm install

# Iniciar el servidor
npm start
```

Luego abre en tu navegador: `http://localhost:3000`
