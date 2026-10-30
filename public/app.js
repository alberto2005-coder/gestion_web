// ==========================================================================
// IndexPulse — Client Application Logic
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchForm = document.getElementById('searchForm');
  const urlInput = document.getElementById('urlInput');
  const pasteBtn = document.getElementById('pasteBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const btnText = analyzeBtn.querySelector('.btn-text');
  const btnArrow = analyzeBtn.querySelector('.btn-arrow');
  const spinner = analyzeBtn.querySelector('.spinner');

  const errorBanner = document.getElementById('errorBanner');
  const errorMessage = document.getElementById('errorMessage');
  const resultsSection = document.getElementById('resultsSection');

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const chipExamples = document.querySelectorAll('.chip-example');

  // Summary Elements
  const resDomainBadge = document.getElementById('resDomainBadge');
  const resProtocolBadge = document.getElementById('resProtocolBadge');
  const resStatusBadge = document.getElementById('resStatusBadge');
  const resSpeedBadge = document.getElementById('resSpeedBadge');
  const resTargetUrl = document.getElementById('resTargetUrl');
  const indexVerdictBox = document.getElementById('indexVerdictBox');
  const verdictIcon = document.getElementById('verdictIcon');
  const verdictTitle = document.getElementById('verdictTitle');
  const verdictDesc = document.getElementById('verdictDesc');

  // Score Elements
  const scoreCircle = document.getElementById('scoreCircle');
  const scoreValue = document.getElementById('scoreValue');
  const scoreBadge = document.getElementById('scoreBadge');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // SERP Switchers
  const serpTypeBtns = document.querySelectorAll('.serp-type-btn');

  // Interactive Editor Elements
  const editTitle = document.getElementById('editTitle');
  const editDesc = document.getElementById('editDesc');
  const titleCharIndicator = document.getElementById('titleCharIndicator');
  const descCharIndicator = document.getElementById('descCharIndicator');
  const titleProgressBar = document.getElementById('titleProgressBar');
  const descProgressBar = document.getElementById('descProgressBar');
  const titleFeedback = document.getElementById('titleFeedback');
  const descFeedback = document.getElementById('descFeedback');
  const resetEditorBtn = document.getElementById('resetEditorBtn');

  // Current Analyzed Data Cache
  let currentAnalysis = null;
  let originalTitle = '';
  let originalDesc = '';

  // Theme Management
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('indexpulse_theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('indexpulse_theme', 'dark');
    }
  }

  const savedTheme = localStorage.getItem('indexpulse_theme') || 'dark';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    applyTheme(isLight ? 'dark' : 'light');
  });

  // Prevent middle-click autoscroll icon from appearing accidentally
  window.addEventListener('mousedown', (e) => {
    if (e.button === 1) {
      e.preventDefault();
    }
  });

  // Paste from clipboard
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        urlInput.value = text.trim();
        urlInput.focus();
      }
    } catch (_) {
      urlInput.focus();
    }
  });

  // Quick chips
  chipExamples.forEach(chip => {
    chip.addEventListener('click', () => {
      urlInput.value = chip.getAttribute('data-url');
      runAnalysis(urlInput.value);
    });
  });

  // Tabs Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });

  // SERP Views Switching
  serpTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      serpTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-serp');
      document.querySelectorAll('.serp-card-container').forEach(c => c.style.display = 'none');
      const activeCard = document.getElementById(`serp-${target}`);
      if (activeCard) activeCard.style.display = 'block';
    });
  });

  // Form Submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (url) {
      runAnalysis(url);
    }
  });

  // Main Analysis Request
  async function runAnalysis(url) {
    hideError();
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`, {
        signal: controller.signal
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar el análisis.');
      }

      currentAnalysis = data;
      renderAnalysis(data);

      resultsSection.style.display = 'block';
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showError(err.name === 'AbortError'
        ? 'El análisis tardó demasiado y se canceló. Comprueba la URL e inténtalo de nuevo.'
        : err.message);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  function setLoading(loading) {
    if (loading) {
      analyzeBtn.disabled = true;
      btnText.textContent = 'Analizando...';
      btnArrow.style.display = 'none';
      spinner.style.display = 'block';
    } else {
      analyzeBtn.disabled = false;
      btnText.textContent = 'Analizar Web';
      btnArrow.style.display = 'block';
      spinner.style.display = 'none';
    }
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.style.display = 'flex';
  }

  function hideError() {
    errorBanner.style.display = 'none';
  }

  // Render All Data
  function renderAnalysis(data) {
    // 1. Top Bar Summary
    resDomainBadge.textContent = data.domain;
    resTargetUrl.textContent = data.url;
    resProtocolBadge.textContent = data.isHttps ? '🔒 HTTPS Seguro' : '⚠️ HTTP No Seguro';
    resProtocolBadge.style.color = data.isHttps ? 'var(--success-color)' : 'var(--warning-color)';
    resStatusBadge.textContent = `HTTP ${data.status} ${data.status === 200 ? 'OK' : ''}`;
    resSpeedBadge.textContent = `⚡ ${data.responseTime}ms`;

    // Verdict Box
    indexVerdictBox.className = 'indexation-verdict-box';
    if (!data.indexability.isIndexable) {
      indexVerdictBox.classList.add('verdict-danger');
      verdictIcon.textContent = '🚫';
      verdictTitle.textContent = 'Página con Restricciones de Indexación';
      if (data.indexability.hasNoIndex) {
        verdictDesc.textContent = 'Alerta Crítica: Esta página contiene la directiva "noindex". Ningún buscador la mostrará en sus resultados de búsqueda mientras esta etiqueta persista.';
      } else if (data.indexability.robotsTxt.isBlocked) {
        verdictDesc.textContent = 'Alerta: Esta URL está bloqueada por una directiva "Disallow" en robots.txt. Los rastreadores de Google y Bing no pueden inspeccionarla.';
      } else {
        verdictDesc.textContent = `Alerta: El servidor devolvió un estado HTTP ${data.status}. Las páginas no disponibles no pueden indexarse.`;
      }
    } else {
      indexVerdictBox.classList.add('verdict-success');
      verdictIcon.textContent = '🟢';
      verdictTitle.textContent = '¡Página Apta e Indexable!';
      verdictDesc.textContent = 'No se encontraron bloqueos de "noindex" ni directivas prohibitivas en robots.txt. Google, Bing y otros buscadores tienen luz verde para indexar y posicionar este contenido.';
    }

    // 2. Score Gauge
    animateScore(data.score, data.grade, data.gradeColor);

    // 3. Render Engines Grid & Automated Scan Banner
    renderEngines(data.searchEngines, data.presenceSummary);

    // 4. Directives Table
    renderDirectivesTable(data);

    // 5. Robots.txt View
    renderRobotsTxt(data.indexability.robotsTxt);

    // 6. SERP Snippets Previews
    renderSerp(data.serp, data.domain, data.url);

    // 7. On-Page SEO Tab
    renderSeoTab(data);

    // 8. Recommendations Checklist
    renderChecklist(data.audit);
  }

  // Animate Circular Score
  function animateScore(score, grade, color) {
    scoreValue.textContent = score;
    scoreBadge.textContent = grade;
    scoreBadge.style.backgroundColor = color;

    const totalCircumference = 326.7; // 2 * Math.PI * 52
    const offset = totalCircumference - (score / 100) * totalCircumference;
    scoreCircle.style.stroke = color;
    scoreCircle.style.strokeDashoffset = offset;
  }

  // Render Search Engines & Automated Scan Banner
  function renderEngines(engines, presence) {
    const container = document.getElementById('enginesGrid');
    container.innerHTML = '';

    // Update Automated Scan Banner
    const banner = document.getElementById('automatedScanBanner');
    const bannerTitle = document.getElementById('scanBannerTitle');
    const bannerSub = document.getElementById('scanBannerSubtitle');
    const countPill = document.getElementById('scanCountPill');

    const total = presence?.totalIndexed ?? 0;
    const maxEngines = presence?.totalEngines ?? 5;
    const unverified = presence?.unverifiedEngines ?? Object.values(engines).filter(eng => eng.isIndexed === null).length;
    countPill.textContent = `${total} de ${maxEngines} confirmados`;

    if (total >= maxEngines && unverified === 0) {
      banner.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      bannerTitle.innerHTML = '🟢 ¡Comprobación Completada: La Web YA Está Indexada!';
      bannerSub.textContent = `Se confirmó presencia activa en los ${maxEngines} motores consultados.`;
    } else if (total > 0) {
      banner.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      bannerTitle.innerHTML = '🟡 Presencia Parcial en Buscadores';
      bannerSub.textContent = `Presencia confirmada en ${total} de ${maxEngines} buscadores.${unverified ? ` No se pudo verificar en ${unverified} motores.` : ''}`;
    } else {
      banner.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      bannerTitle.innerHTML = '🟡 No se pudo confirmar la indexación';
      bannerSub.textContent = `No se detectaron resultados en las comprobaciones disponibles; ${unverified} motores no se pudieron verificar. Esto no demuestra que la web no esté indexada.`;
    }

    const engineIcons = {
      Google: '🔍',
      'Microsoft Bing': '🔎',
      Bing: '🔎',
      DuckDuckGo: '🦆',
      'Yahoo!': '🟣',
      Yandex: '🇷🇺'
    };

    Object.values(engines).forEach(eng => {
      const card = document.createElement('div');
      card.className = 'engine-card';

      const icon = engineIcons[eng.name] || '🌐';
      const badgeClass = eng.isIndexed === null ? 'unknown' : (eng.isIndexed ? 'success' : 'danger');
      const manualCheckLabel = eng.name === 'Google' ? 'COMPROBAR EN GOOGLE' : `COMPROBAR EN ${eng.name.toUpperCase()}`;
      const badgeText = eng.statusText || (eng.isIndexed ? 'YA INDEXADA' : (eng.isIndexed === null ? manualCheckLabel : 'NO INDEXADA'));

      let sampleResultHtml = '';
      if (eng.sampleResult) {
        sampleResultHtml = `
          <div class="sample-detected-box">
            <div class="sample-detected-header">Resultado Extraído del Índice (${escapeHtml(eng.name)}):</div>
            <div class="sample-detected-title">${escapeHtml(eng.sampleResult.title)}</div>
            <div class="sample-detected-snippet">${escapeHtml(eng.sampleResult.snippet || 'Snippet indexado en este buscador')}</div>
          </div>
        `;
      }

      let linksHtml = `
        <a href="${eng.siteQuery}" target="_blank" rel="noopener noreferrer" class="engine-action-btn">
          Ver consulta "site:" en ${eng.name} ↗
        </a>
      `;

      if (eng.name === 'Google') {
        linksHtml += `
          <a href="${eng.richTestUrl}" target="_blank" rel="noopener noreferrer" class="engine-action-btn">
            Test Resultados Enriquecidos ↗
          </a>
          <a href="${eng.mobileTestUrl}" target="_blank" rel="noopener noreferrer" class="engine-action-btn">
            PageSpeed & Móvil ↗
          </a>
        `;
      } else if (eng.name.includes('Bing')) {
        linksHtml += `
          <a href="${eng.webmasterUrl}" target="_blank" rel="noopener noreferrer" class="engine-action-btn">
            Bing Webmaster Tools ↗
          </a>
        `;
      }

      card.innerHTML = `
        <div class="engine-card-top">
          <div class="engine-logo-name">
            <span class="engine-icon">${icon}</span>
            <span class="engine-name">${eng.name}</span>
          </div>
          <span class="engine-status-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="engine-details">
          ${escapeHtml(eng.details || '')}
        </div>
        ${sampleResultHtml}
        <div class="engine-links-row">
          ${linksHtml}
        </div>
      `;

      container.appendChild(card);
    });
  }

  // Render Directives Table
  function renderDirectivesTable(data) {
    const tbody = document.getElementById('directivesTableBody');
    tbody.innerHTML = '';

    const idx = data.indexability;
    const rows = [
      {
        name: 'Meta Robots (<meta name="robots">)',
        value: idx.metaRobots,
        status: idx.hasNoIndex ? 'err' : 'ok',
        statusText: idx.hasNoIndex ? 'Bloqueo noindex detectado' : 'Permite indexación',
        desc: idx.hasNoIndex ? 'Impide que los motores muestren esta página en sus SERPs.' : 'Los buscadores indexarán la página con normalidad.'
      },
      {
        name: 'Cabecera X-Robots-Tag',
        value: idx.xRobotsTag || 'No enviada por servidor',
        status: idx.xRobotsTag.includes('noindex') ? 'err' : 'ok',
        statusText: idx.xRobotsTag.includes('noindex') ? 'Bloqueo HTTP noindex' : 'Sin bloqueos en cabecera',
        desc: 'Directiva enviada directamente en las cabeceras HTTP antes de descargar el HTML.'
      },
      {
        name: 'Etiqueta Canonical (<link rel="canonical">)',
        value: idx.canonicalTag || 'No declarada',
        status: idx.canonicalStatus === 'self' ? 'ok' : (idx.canonicalStatus === 'different' ? 'warn' : 'err'),
        statusText: idx.canonicalStatus === 'self' ? 'Autorreferenciada (Correcto)' : (idx.canonicalStatus === 'different' ? 'Apunta a otra URL' : 'Falta etiqueta canonical'),
        desc: idx.canonicalStatus === 'self' ? 'Consolida la autoridad en esta misma URL.' : (idx.canonicalStatus === 'different' ? 'Indica a Google que prefiera indexar la URL alternativa declarada.' : 'Riesgo de contenido duplicado.')
      },
      {
        name: 'Archivo robots.txt',
        value: idx.robotsTxt.found ? `${idx.robotsTxt.directives.length} reglas detectadas` : 'No encontrado (404)',
        status: idx.robotsTxt.isBlocked ? 'warn' : (idx.robotsTxt.found ? 'ok' : 'warn'),
        statusText: idx.robotsTxt.isBlocked ? 'Ruta restringida por Disallow' : (idx.robotsTxt.found ? 'Permite rastreo' : 'No disponible'),
        desc: idx.robotsTxt.isBlocked ? 'Los bots respetarán el archivo y evitarán rastrear esta página.' : 'Define qué secciones del sitio web pueden visitar los buscadores.'
      },
      {
        name: 'Mapa del Sitio (Sitemap XML)',
        value: idx.sitemap.found ? idx.sitemap.url : 'No detectado automáticamente',
        status: idx.sitemap.found ? 'ok' : 'warn',
        statusText: idx.sitemap.found ? 'Sitemap localizado' : 'No encontrado',
        desc: idx.sitemap.found ? 'Ayuda a Google a descubrir todas las URLs del sitio más rápido.' : 'Se recomienda vincularlo en robots.txt o Search Console.'
      }
    ];

    rows.forEach(r => {
      const tr = document.createElement('tr');
      const icon = r.status === 'ok' ? '✓' : (r.status === 'warn' ? '⚠' : '✗');
      tr.innerHTML = `
        <td><strong>${r.name}</strong></td>
        <td><span class="tag-badge">${escapeHtml(r.value)}</span></td>
        <td><span class="status-cell-badge ${r.status}">${icon} ${r.statusText}</span></td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${r.desc}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Render robots.txt
  function renderRobotsTxt(robotsData) {
    const link = document.getElementById('robotsTxtLink');
    const code = document.getElementById('robotsTxtCode');

    link.href = robotsData.url;
    if (robotsData.found && robotsData.directives.length > 0) {
      code.textContent = robotsData.directives.join('\n');
    } else if (robotsData.found) {
      code.textContent = '# Archivo robots.txt vacío o sin directivas explícitas.';
    } else {
      code.textContent = `# No se pudo localizar robots.txt en ${robotsData.url} (Código HTTP diferente a 200).`;
    }
  }

  // Render SERP
  function renderSerp(serp, domain, fullUrl) {
    originalTitle = serp.title || '';
    originalDesc = serp.metaDescription || '';

    // Favicons
    const faviconUrl = serp.favicon;
    document.getElementById('gFaviconImg').src = faviconUrl;
    document.getElementById('gMobileFavicon').src = faviconUrl;

    // Site Name and Breadcrumb
    const siteName = serp.og?.siteName || domain.replace('www.', '');
    document.getElementById('gSiteName').textContent = siteName;
    document.getElementById('gBreadcrumb').textContent = serp.breadcrumbDisplay || domain;
    document.getElementById('gMobileSiteName').textContent = siteName;
    document.getElementById('gMobileUrl').textContent = fullUrl;

    // Bing Elements
    document.getElementById('bingUrl').textContent = fullUrl;

    // Social Elements
    document.getElementById('socialDomain').textContent = domain.toUpperCase();
    document.getElementById('socialImagePreview').src = serp.og.image || '';

    // Populate Interactive Editor
    editTitle.value = originalTitle;
    editDesc.value = originalDesc;

    updateSerpDisplays(originalTitle, originalDesc, domain);
  }

  // Live SERP update as user types in editor
  function updateSerpDisplays(title, desc, domain) {
    const finalTitle = title || 'Sin título definido';
    const finalSnippet = desc || 'Sin meta descripción configurada. Los motores de búsqueda extraerán fragmentos del contenido visible.';

    // Google Desktop
    document.getElementById('gTitleDisplay').textContent = finalTitle;
    document.getElementById('gSnippetDisplay').textContent = finalSnippet;

    // Pixel width estimation
    const pixelWidth = estimatePixels(finalTitle);
    const pixelCounter = document.getElementById('desktopPixelCounter');
    pixelCounter.textContent = `${pixelWidth}px / 580px`;
    if (pixelWidth > 580) {
      pixelCounter.style.color = 'var(--danger-color)';
    } else {
      pixelCounter.style.color = 'var(--text-dim)';
    }

    // Google Mobile
    document.getElementById('gMobileTitle').textContent = finalTitle;
    document.getElementById('gMobileSnippet').textContent = finalSnippet;

    // Bing
    document.getElementById('bingTitle').textContent = finalTitle;
    document.getElementById('bingSnippet').textContent = finalSnippet;

    // Social
    document.getElementById('socialTitle').textContent = finalTitle;
    document.getElementById('socialDesc').textContent = finalSnippet;

    // Update Editor Inputs indicators & progress bars
    const tLen = title.length;
    titleCharIndicator.textContent = `${tLen} / 60 caracteres`;
    const tPct = Math.min(100, (tLen / 60) * 100);
    titleProgressBar.style.width = `${tPct}%`;
    if (tLen < 30) {
      titleProgressBar.style.backgroundColor = 'var(--warning-color)';
      titleFeedback.textContent = 'Demasiado corto. Se recomienda entre 45 y 60 caracteres.';
    } else if (tLen > 65 || pixelWidth > 580) {
      titleProgressBar.style.backgroundColor = 'var(--danger-color)';
      titleFeedback.textContent = '¡Atención! Excede los 580px y se cortará en los resultados con (...).';
    } else {
      titleProgressBar.style.backgroundColor = 'var(--success-color)';
      titleFeedback.textContent = '¡Longitud ideal para Google!';
    }

    const dLen = desc.length;
    descCharIndicator.textContent = `${dLen} / 160 caracteres`;
    const dPct = Math.min(100, (dLen / 160) * 100);
    descProgressBar.style.width = `${dPct}%`;
    if (dLen < 70) {
      descProgressBar.style.backgroundColor = 'var(--warning-color)';
      descFeedback.textContent = 'Demasiado corta. Aprovecha entre 120 y 160 caracteres.';
    } else if (dLen > 165) {
      descProgressBar.style.backgroundColor = 'var(--danger-color)';
      descFeedback.textContent = 'Supera los 160 caracteres y podría truncarse.';
    } else {
      descProgressBar.style.backgroundColor = 'var(--success-color)';
      descFeedback.textContent = '¡Longitud perfecta para el snippet!';
    }
  }

  editTitle.addEventListener('input', () => {
    updateSerpDisplays(editTitle.value, editDesc.value, currentAnalysis?.domain || '');
  });

  editDesc.addEventListener('input', () => {
    updateSerpDisplays(editTitle.value, editDesc.value, currentAnalysis?.domain || '');
  });

  resetEditorBtn.addEventListener('click', () => {
    editTitle.value = originalTitle;
    editDesc.value = originalDesc;
    updateSerpDisplays(originalTitle, originalDesc, currentAnalysis?.domain || '');
  });

  // Render On-Page SEO Details
  function renderSeoTab(data) {
    const c = data.contentAnalysis;
    document.getElementById('seoWordsCount').textContent = c.wordCount.toLocaleString();
    document.getElementById('seoRatio').textContent = `${c.textToCodeRatio}%`;
    document.getElementById('seoImagesCount').textContent = c.images.total;
    document.getElementById('seoImagesNoAlt').textContent = `${c.images.missingAlt} sin ALT`;
    document.getElementById('seoLinksCount').textContent = (c.links.internal + c.links.external);
    document.getElementById('seoInternalLinks').textContent = c.links.internal;
    document.getElementById('seoExternalLinks').textContent = c.links.external;

    // Headings
    const hContainer = document.getElementById('headingsBreakdown');
    hContainer.innerHTML = '';
    const allHeadings = [
      ...c.headings.h1.map(t => ({ tag: 'H1', text: t })),
      ...c.headings.h2.slice(0, 6).map(t => ({ tag: 'H2', text: t })),
      ...c.headings.h3.slice(0, 4).map(t => ({ tag: 'H3', text: t }))
    ];

    if (allHeadings.length === 0) {
      hContainer.innerHTML = '<p class="text-danger">No se detectaron etiquetas de encabezado H1, H2 o H3 en el documento.</p>';
    } else {
      allHeadings.forEach(h => {
        const item = document.createElement('div');
        item.className = 'heading-item';
        item.innerHTML = `
          <span class="heading-tag-label">&lt;${h.tag}&gt;</span>
          <span class="heading-text">${escapeHtml(h.text)}</span>
        `;
        hContainer.appendChild(item);
      });
    }

    // Keywords Table
    const kwTbody = document.getElementById('keywordsTableBody');
    kwTbody.innerHTML = '';
    if (c.topKeywords.length === 0) {
      kwTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-dim);">No se detectaron palabras clave destacadas.</td></tr>';
    } else {
      c.topKeywords.forEach(k => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHtml(k.word)}</strong></td>
          <td>${k.count} veces</td>
          <td><span class="tag-badge">${k.density}%</span></td>
        `;
        kwTbody.appendChild(tr);
      });
    }

    // Images preview
    const imgGrid = document.getElementById('imagesPreviewGrid');
    imgGrid.innerHTML = '';
    if (c.images.samples.length === 0) {
      imgGrid.innerHTML = '<p style="color: var(--text-dim); grid-column: 1 / -1;">No se encontraron imágenes en el documento HTML inspeccionado.</p>';
    } else {
      c.images.samples.forEach(img => {
        const card = document.createElement('div');
        card.className = 'img-audit-card';
        card.innerHTML = `
          <img class="img-audit-thumb" src="${escapeHtml(img.src)}" alt="Miniatura" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 60%22 fill=%22%232d3748%22><text x=%2250%%22 y=%2250%%22 fill=%22%23a0aec0%22 font-size=%2210%22 text-anchor=%22middle%22>Img</text></svg>';">
          <div class="img-audit-alt" title="${escapeHtml(img.alt || 'Sin atributo ALT')}">
            ${img.alt ? escapeHtml(img.alt) : '<em>Sin texto descriptivo ALT</em>'}
          </div>
          <span class="img-status-tag ${img.hasAlt ? 'ok' : 'missing'}">
            ${img.hasAlt ? '✓ Atributo ALT presente' : '✗ Falta atributo ALT'}
          </span>
        `;
        imgGrid.appendChild(card);
      });
    }
  }

  // Render Checklist
  function renderChecklist(audit) {
    const issuesPill = document.getElementById('issuesPill');
    const totalIssues = audit.stats.critical + audit.stats.warnings;
    issuesPill.textContent = totalIssues;

    document.getElementById('countAll').textContent = audit.issues.length + audit.passed.length;
    document.getElementById('countCritical').textContent = audit.stats.critical;
    document.getElementById('countWarning').textContent = audit.stats.warnings;
    document.getElementById('countPassed').textContent = audit.stats.passed;

    renderChecklistFiltered('all');

    // Filter Buttons
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        renderChecklistFiltered(pill.getAttribute('data-filter'));
      });
    });
  }

  function renderChecklistFiltered(filter) {
    const container = document.getElementById('checklistContainer');
    container.innerHTML = '';

    if (!currentAnalysis) return;
    const { issues, passed } = currentAnalysis.audit;

    let items = [];
    if (filter === 'all') {
      items = [...issues, ...passed.map(p => ({ ...p, type: 'passed' }))];
    } else if (filter === 'critical') {
      items = issues.filter(i => i.type === 'critical');
    } else if (filter === 'warning') {
      items = issues.filter(i => i.type === 'warning');
    } else if (filter === 'passed') {
      items = passed.map(p => ({ ...p, type: 'passed' }));
    }

    if (items.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-dim); padding: 40px 0;">No hay elementos en esta categoría.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'checklist-card';

      let icon = '🟢';
      let borderCol = 'var(--success-color)';
      if (item.type === 'critical') {
        icon = '🔴';
        borderCol = 'var(--danger-color)';
      } else if (item.type === 'warning') {
        icon = '🟡';
        borderCol = 'var(--warning-color)';
      } else if (item.type === 'info') {
        icon = 'ℹ️';
        borderCol = 'var(--info-color)';
      }

      card.style.borderLeft = `4px solid ${borderCol}`;
      card.innerHTML = `
        <div class="check-icon-col">${icon}</div>
        <div class="check-content-col">
          <div class="check-header">
            <span class="check-title">${escapeHtml(item.title)}</span>
            <span class="check-category-pill">${escapeHtml(item.category)}</span>
          </div>
          <p class="check-desc">${escapeHtml(item.desc)}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Print button
  document.getElementById('printReportBtn').addEventListener('click', () => {
    window.print();
  });

  // Pixel Width Estimator
  function estimatePixels(text) {
    let width = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if ('ijl|!I.,;: '.includes(char)) width += 4.5;
      else if ('mwMWOQ@#%&'.includes(char)) width += 13.5;
      else if (char === char.toUpperCase() && char.match(/[A-Z]/)) width += 11;
      else width += 8.8;
    }
    return Math.round(width);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
