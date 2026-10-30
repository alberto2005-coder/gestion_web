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
