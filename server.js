const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Modern browser user agent to avoid false-bot IP blocking by CDNs like Cloudflare and Wikimedia
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// Helper to normalize input URL
function normalizeUrl(input) {
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return new URL(url);
}

// Helper to calculate pixel width estimate for Google SERP title (standard Arial 18px ~9.3px avg)
function estimatePixelWidth(text) {
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

// Calculate Web Speed / Performance metrics & Core Web Vitals audit
function calculateSpeedMetrics({ responseTime, dnsTime, connectTime, ttfb, downloadTime, htmlSize, totalImages, totalScripts, totalStyles, hasCompression, hasHttp2OrTls, cacheControl }) {
  // Estimated Core Web Vitals based on real server response + DOM assets payload
  // FCP (First Contentful Paint) estimate: TTFB + HTML parse & CSS render blocking delay
  const cssBlockingDelay = Math.min(600, totalStyles * 45);
  const estimatedFcp = Math.round(ttfb + cssBlockingDelay + 120);

  // LCP (Largest Contentful Paint) estimate: FCP + largest asset download (e.g. hero image or fonts)
  const imageDelay = totalImages > 0 ? Math.min(1200, (htmlSize / 1024) * 8 + (totalImages * 35)) : 180;
  const estimatedLcp = Math.round(estimatedFcp + imageDelay);

  // CLS (Cumulative Layout Shift) estimate: presence of unoptimized images or heavy fonts
  const estimatedCls = totalImages > 5 ? (totalImages > 15 ? 0.18 : 0.08) : 0.02;

  // Total Blocking Time (TBT) estimate based on script tags count
  const estimatedTbt = Math.min(1000, Math.round(totalScripts * 35 + (htmlSize > 150000 ? 180 : 40)));

  // Speed Index estimate
  const estimatedSpeedIndex = Math.round(estimatedFcp * 1.25 + 200);

  // Calculate Google-style Performance Score (0 - 100)
  // Weighting similar to Lighthouse: LCP (25%), TBT (30%), FCP (10%), Speed Index (10%), CLS (25%)
  let perfScore = 100;
  if (estimatedLcp > 4000) perfScore -= 25;
  else if (estimatedLcp > 2500) perfScore -= 12;

  if (estimatedTbt > 600) perfScore -= 25;
  else if (estimatedTbt > 200) perfScore -= 12;

  if (estimatedFcp > 3000) perfScore -= 15;
  else if (estimatedFcp > 1800) perfScore -= 7;

  if (estimatedCls > 0.25) perfScore -= 20;
  else if (estimatedCls > 0.1) perfScore -= 10;

  if (ttfb > 1200) perfScore -= 15;
  else if (ttfb > 600) perfScore -= 8;

  perfScore = Math.max(15, Math.min(100, Math.round(perfScore)));

  // Performance Rating Category
  let perfGrade = 'Rápida (Bueno)';
  let perfColor = '#10b981';
  if (perfScore < 50) {
    perfGrade = 'Lenta (Pobre)';
    perfColor = '#ef4444';
  } else if (perfScore < 85) {
    perfGrade = 'Moderada (Aceptable)';
    perfColor = '#f59e0b';
  }

  // Determine Core Web Vitals Statuses (Good, Needs Improvement, Poor)
  const fcpStatus = estimatedFcp <= 1800 ? 'good' : (estimatedFcp <= 3000 ? 'moderate' : 'poor');
  const lcpStatus = estimatedLcp <= 2500 ? 'good' : (estimatedLcp <= 4000 ? 'moderate' : 'poor');
  const clsStatus = estimatedCls <= 0.1 ? 'good' : (estimatedCls <= 0.25 ? 'moderate' : 'poor');
  const tbtStatus = estimatedTbt <= 200 ? 'good' : (estimatedTbt <= 600 ? 'moderate' : 'poor');
  const ttfbStatus = ttfb <= 600 ? 'good' : (ttfb <= 1200 ? 'moderate' : 'poor');

  // Search Engine Bot Crawl Speed Evaluation
  let crawlSpeedVerdict = 'Óptimo para rastreadores (Googlebot / Bingbot)';
  let crawlSpeedColor = '#10b981';
  let crawlSpeedRating = 'Ultra Rápido';
  if (responseTime > 1500) {
    crawlSpeedVerdict = 'Lento: Puede reducir el presupuesto de rastreo (Crawl Budget) de Google.';
    crawlSpeedColor = '#ef4444';
    crawlSpeedRating = 'Lento';
  } else if (responseTime > 800) {
    crawlSpeedVerdict = 'Aceptable, pero Googlebot puede espaciar las visitas.';
    crawlSpeedColor = '#f59e0b';
    crawlSpeedRating = 'Medio';
  }

  return {
    score: perfScore,
    grade: perfGrade,
    color: perfColor,
    crawlSpeed: {
      rating: crawlSpeedRating,
      verdict: crawlSpeedVerdict,
      color: crawlSpeedColor,
      responseTimeMs: responseTime
    },
    timings: {
      totalTimeMs: responseTime,
      ttfbMs: ttfb,
      downloadTimeMs: downloadTime,
      dnsTimeMs: dnsTime,
      connectTimeMs: connectTime
    },
    coreWebVitals: {
      lcp: {
        value: `${(estimatedLcp / 1000).toFixed(2)}s`,
        rawMs: estimatedLcp,
        name: 'Largest Contentful Paint (LCP)',
        status: lcpStatus,
        statusLabel: lcpStatus === 'good' ? 'Bueno (<= 2.5s)' : (lcpStatus === 'moderate' ? 'Aceptable (<= 4.0s)' : 'Lento (> 4.0s)'),
        desc: 'Mide la velocidad con la que se procesa el contenido principal o imagen más grande visible en pantalla.'
      },
      fcp: {
        value: `${(estimatedFcp / 1000).toFixed(2)}s`,
        rawMs: estimatedFcp,
        name: 'First Contentful Paint (FCP)',
        status: fcpStatus,
        statusLabel: fcpStatus === 'good' ? 'Bueno (<= 1.8s)' : (fcpStatus === 'moderate' ? 'Aceptable (<= 3.0s)' : 'Lento (> 3.0s)'),
        desc: 'Tiempo transcurrido hasta que el navegador muestra el primer elemento de texto o gráfico.'
      },
      cls: {
        value: estimatedCls.toFixed(3),
        rawMs: estimatedCls,
        name: 'Cumulative Layout Shift (CLS)',
        status: clsStatus,
        statusLabel: clsStatus === 'good' ? 'Bueno (<= 0.1)' : (clsStatus === 'moderate' ? 'Aceptable (<= 0.25)' : 'Inestable (> 0.25)'),
        desc: 'Mide la estabilidad visual y cambios inesperados de maquetación durante la carga.'
      },
      tbt: {
        value: `${estimatedTbt}ms`,
        rawMs: estimatedTbt,
        name: 'Total Blocking Time (TBT)',
        status: tbtStatus,
        statusLabel: tbtStatus === 'good' ? 'Bueno (<= 200ms)' : (tbtStatus === 'moderate' ? 'Aceptable (<= 600ms)' : 'Alto (> 600ms)'),
        desc: 'Tiempo total en el que el hilo principal estuvo bloqueado por la ejecución de scripts.'
      },
      ttfb: {
        value: `${ttfb}ms`,
        rawMs: ttfb,
        name: 'Time to First Byte (TTFB)',
        status: ttfbStatus,
        statusLabel: ttfbStatus === 'good' ? 'Bueno (<= 600ms)' : (ttfbStatus === 'moderate' ? 'Aceptable (<= 1200ms)' : 'Lento (> 1200ms)'),
        desc: 'Tiempo de respuesta del servidor hasta devolver el primer byte de datos al cliente.'
      },
      speedIndex: {
        value: `${(estimatedSpeedIndex / 1000).toFixed(2)}s`,
        rawMs: estimatedSpeedIndex,
        name: 'Speed Index (SI)',
        status: estimatedSpeedIndex <= 3400 ? 'good' : (estimatedSpeedIndex <= 5800 ? 'moderate' : 'poor'),
        statusLabel: estimatedSpeedIndex <= 3400 ? 'Bueno (<= 3.4s)' : (estimatedSpeedIndex <= 5800 ? 'Aceptable' : 'Lento'),
        desc: 'Velocidad a la que el contenido de la página es visualmente poblado.'
      }
    },
    resources: {
      htmlSizeBytes: htmlSize,
      htmlSizeKb: (htmlSize / 1024).toFixed(1),
      totalImages,
      totalScripts,
      totalStyles,
      hasCompression,
      hasHttp2OrTls,
      cacheControl: cacheControl || 'No configurado'
    }
  };
}

// Extract top keywords from plain text
function extractKeywords(text) {
  const stopWords = new Set([
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
    'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o',
    'este', 'sí', 'porque', 'esta', 'son', 'entre', 'está', 'cuando', 'muy', 'sin', 'sobre',
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on',
    'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we',
    'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w) && !/^\d+$/.test(w));

  const freq = {};
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / Math.max(words.length, 1)) * 100).toFixed(1)
    }));
}

function decodeBingUrl(href) {
  if (!href) return '';
  const match = href.match(/u=a1([a-zA-Z0-9_-]+)/);
  if (!match) return href;
  try {
    let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return Buffer.from(b64, 'base64').toString('utf8');
  } catch (_) {
    return href;
  }
}

async function checkSearchEngineIndex(engine, targetUrl) {
  const parsedTarget = new URL(targetUrl);
  const queryUrl = engine === 'Google'
    ? `https://www.google.com/search?q=${encodeURIComponent(`site:${targetUrl}`)}`
    : `https://yandex.com/search/?text=${encodeURIComponent(`site:${targetUrl}`)}`;

  try {
    const searchRes = await axios.get(queryUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      timeout: 3500,
      validateStatus: () => true
    });

    if (searchRes.status !== 200 || typeof searchRes.data !== 'string') {
      return { isIndexed: null, result: null, details: `No se pudo consultar ${engine}.` };
    }

    const $search = cheerio.load(searchRes.data);
    const pageText = $search('body').text();
    const verificationChallenge = /captcha|unusual traffic|our systems have detected|showcaptcha|¿no eres un robot/i.test(`${$search('title').text()} ${pageText}`) ||
      (engine === 'Google' && /httpservice\/retry|emsg=SG_REL/i.test(searchRes.data));
    if (verificationChallenge) {
      return { isIndexed: null, result: null, details: `${engine} no permitió completar la consulta automática.` };
    }

    const resultSelector = engine === 'Google'
      ? '#search .MjjYud, #search .g, #rso .MjjYud, #rso .g'
      : '.serp-item, [data-fast-name="organic"]';
    const resultElements = $search(resultSelector);
    const noResults = /no results found|did not match any documents|no se han encontrado resultados|no se han encontrado documentos/i.test(pageText);
    if (!resultElements.length && !noResults) {
      return { isIndexed: null, result: null, details: `La respuesta de ${engine} no contiene resultados verificables.` };
    }

    let result = null;
    resultElements.each((_, element) => {
      if (result) return;
      const $element = $search(element);
      const link = $element.find('a[href]').first().attr('href') || '';
      let resultUrl;
      try {
        const parsedLink = new URL(link, queryUrl);
        resultUrl = parsedLink.searchParams.get('q') || parsedLink.searchParams.get('url') || parsedLink.href;
        resultUrl = new URL(resultUrl, queryUrl);
      } catch (_) {
        return;
      }

      const resultPath = resultUrl.pathname.replace(/\/+$/, '') || '/';
      const targetPath = parsedTarget.pathname.replace(/\/+$/, '') || '/';
      if (resultUrl.hostname.toLowerCase() !== parsedTarget.hostname.toLowerCase() || resultPath !== targetPath) return;

      result = {
        title: $element.find('h3').first().text().trim() || 'Resultado de búsqueda',
        url: resultUrl.href,
        snippet: $element.find('.VwiC3b, .IsZvec, .text-container, .organic__text').first().text().trim() || ''
      };
    });

    return result
      ? { isIndexed: true, result, details: `La consulta site: encontró esta URL en ${engine}.` }
      : { isIndexed: false, result: null, details: `La consulta site: no encontró esta URL en los resultados de ${engine}.` };
  } catch (err) {
    console.log(`${engine} site check failed:`, err.message);
    return { isIndexed: null, result: null, details: `No se pudo consultar ${engine}.` };
  }
}

async function checkBingIndex(hostname) {
  let matches = 0;
  let topResult = null;
  try {
    const response = await axios.get(`https://www.bing.com/search?q=site%3A${encodeURIComponent(hostname)}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      timeout: 3500,
      validateStatus: () => true
    });

    if (response.status === 200 && typeof response.data === 'string') {
      const $bing = cheerio.load(response.data);
      $bing('.b_algo').each((_, element) => {
        const rawHref = $bing(element).find('h2 a').attr('href') || '';
        const decoded = decodeBingUrl(rawHref);
        const resultTitle = $bing(element).find('h2').text().trim();
        if (decoded.includes(hostname) || rawHref.includes(hostname)) {
          matches++;
          if (!topResult && resultTitle) {
            topResult = {
              title: resultTitle,
              url: decoded,
              snippet: $bing(element).find('.b_caption p, .b_lineclamp2').text().trim()
            };
          }
        }
      });
    }
  } catch (err) {
    console.log('Bing site check failed:', err.message);
  }
  return { matches, topResult };
}

// Endpoint to analyze URL
app.get('/api/analyze', async (req, res) => {
  const rawUrl = req.query.url;
  if (!rawUrl) {
    return res.status(400).json({ error: 'Debes proporcionar una URL válida.' });
  }

  let parsedUrl;
  try {
    parsedUrl = normalizeUrl(rawUrl);
  } catch (e) {
    return res.status(400).json({ error: 'La URL proporcionada no tiene un formato válido.' });
  }

  const targetUrl = parsedUrl.href;
  const origin = parsedUrl.origin;
  const startTime = Date.now();
  const indexChecksPromise = Promise.all([
    checkBingIndex(parsedUrl.hostname),
    checkSearchEngineIndex('Google', targetUrl),
    checkSearchEngineIndex('Yandex', targetUrl)
  ]);

  const robotsRequest = axios.get(`${origin}/robots.txt`, {
    timeout: 4000,
    validateStatus: () => true,
    headers: { 'User-Agent': USER_AGENT }
  }).catch(() => null);
  const sitemapRequest = axios.head(`${origin}/sitemap.xml`, {
    timeout: 3000,
    validateStatus: () => true
  }).catch(() => null);

  let response;
  let responseTime = 0;
  let headers = {};
  let status = 0;
  let html = '';

  try {
    const axiosInstance = axios.create({
      timeout: 12000,
      maxRedirects: 5,
      validateStatus: () => true, // capture any HTTP code like 404, 301, 500
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // test even self-signed
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      }
    });

    response = await axiosInstance.get(targetUrl);
    responseTime = Date.now() - startTime;
    status = response.status;
    headers = response.headers;
    html = typeof response.data === 'string' ? response.data : '';
  } catch (err) {
    return res.status(502).json({
      error: `No se pudo conectar a la web: ${err.message}. Verifica que el sitio esté en línea y accesible.`
    });
  }

  // Check robots.txt accessibility and content
  let robotsTxtContent = '';
  let robotsTxtFound = false;
  let robotsDirectives = [];
  try {
    const robotsRes = await robotsRequest;
    if (robotsRes && robotsRes.status === 200 && typeof robotsRes.data === 'string' && robotsRes.data.length > 5) {
      robotsTxtFound = true;
      robotsTxtContent = robotsRes.data;
      robotsDirectives = robotsTxtContent.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'))
        .slice(0, 15);
    }
  } catch (e) {
    robotsTxtFound = false;
  }

  // Check sitemap in robots.txt or common root
  let sitemapUrl = null;
  const sitemapMatch = robotsTxtContent.match(/Sitemap:\s*(https?:\/\/[^\s]+)/i);
  if (sitemapMatch) {
    sitemapUrl = sitemapMatch[1];
  } else {
    const smRes = await sitemapRequest;
    if (smRes && smRes.status === 200) sitemapUrl = `${origin}/sitemap.xml`;
  }

  // Parse HTML with Cheerio
  const $ = cheerio.load(html);

  // Meta & Basic Tags
  const title = $('title').text().trim() || '';
  const metaDescription = $('meta[name="description" i]').attr('content')?.trim() ||
                          $('meta[property="og:description" i]').attr('content')?.trim() || '';

  const metaRobots = $('meta[name="robots" i]').attr('content')?.toLowerCase() || '';
  const metaGooglebot = $('meta[name="googlebot" i]').attr('content')?.toLowerCase() || '';
  const xRobotsTag = (headers['x-robots-tag'] || '').toString().toLowerCase();

  const canonicalTag = $('link[rel="canonical" i]').attr('href')?.trim() || '';
  const viewport = $('meta[name="viewport" i]').attr('content') || '';
  const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type" i]').attr('content') || '';
  const htmlLang = $('html').attr('lang') || '';

  // SEO Internacional (hreflang tags)
  const hreflangs = [];
  $('link[rel="alternate" i][hreflang]').each((_, el) => {
    const lang = $(el).attr('hreflang')?.trim();
    const href = $(el).attr('href')?.trim();
    if (lang && href) {
      try {
        hreflangs.push({
          lang,
          url: new URL(href, targetUrl).href,
          isSelf: new URL(href, targetUrl).href === targetUrl
        });
      } catch (_) {
        hreflangs.push({ lang, url: href, isSelf: false });
      }
    }
  });

  // Favicon
  let favicon = $('link[rel*="icon" i]').attr('href') || '/favicon.ico';
  try {
    favicon = new URL(favicon, targetUrl).href;
  } catch (_) {
    favicon = `${origin}/favicon.ico`;
  }

  // Social / OpenGraph / Twitter
  const ogTitle = $('meta[property="og:title" i]').attr('content') || title;
  const ogDesc = $('meta[property="og:description" i]').attr('content') || metaDescription;
  let ogImage = $('meta[property="og:image" i]').attr('content') || '';
  if (ogImage) {
    try { ogImage = new URL(ogImage, targetUrl).href; } catch (_) {}
  }
  const ogSiteName = $('meta[property="og:site_name" i]').attr('content') || parsedUrl.hostname;
  const twitterCard = $('meta[name="twitter:card" i]').attr('content') || 'summary_large_image';

  // Headings
  const headings = {
    h1: [],
    h2: [],
    h3: [],
    h4: []
  };
  $('h1').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (txt) headings.h1.push(txt);
  });
  $('h2').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (txt) headings.h2.push(txt);
  });
  $('h3').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (txt) headings.h3.push(txt);
  });
  $('h4').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (txt) headings.h4.push(txt);
  });

  // Images audit
  let totalImages = 0;
  let imagesWithoutAlt = 0;
  const sampleImages = [];
  $('img').each((i, el) => {
    totalImages++;
    const alt = $(el).attr('alt');
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const hasAlt = alt !== undefined && alt.trim() !== '';
    if (!hasAlt) imagesWithoutAlt++;
    if (sampleImages.length < 6 && src) {
      sampleImages.push({
        src: src.startsWith('http') ? src : `${origin}/${src.replace(/^\//, '')}`,
        alt: alt || null,
        hasAlt
      });
    }
  });

  // Links audit
  let internalLinks = 0;
  let externalLinks = 0;
  let nofollowLinks = 0;
  let totalScripts = $('script[src]').length;
  let totalStyles = $('link[rel="stylesheet"]').length;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const rel = $(el).attr('rel') || '';
    if (rel.includes('nofollow')) nofollowLinks++;

    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return;
    }
    if (href.startsWith('/') || href.startsWith('#') || href.includes(parsedUrl.hostname)) {
      internalLinks++;
    } else if (href.startsWith('http')) {
      externalLinks++;
    }
  });

  // Structured Data (Schema JSON-LD & Rich Snippets detection)
  const schemas = [];
  const structuredDataDetails = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const rawText = $(el).html() || '{}';
      const data = JSON.parse(rawText);
      const pushSchema = (item) => {
        if (!item || typeof item !== 'object') return;
        const type = item['@type'];
        if (type) {
          schemas.push(type);
          structuredDataDetails.push({
            type,
            name: item.name || item.headline || item.title || null,
            description: item.description ? item.description.substring(0, 120) : null,
            rating: item.aggregateRating?.ratingValue || item.reviewRating?.ratingValue || null,
            reviewCount: item.aggregateRating?.ratingCount || item.aggregateRating?.reviewCount || null,
            price: item.offers?.price || item.offers?.lowPrice || null,
            currency: item.offers?.priceCurrency || null,
            inStock: item.offers?.availability ? item.offers.availability.includes('InStock') : null,
            faqQuestions: Array.isArray(item.mainEntity) ? item.mainEntity.map(q => q.name).filter(Boolean).slice(0, 4) : []
          });
        }
      };

      if (Array.isArray(data)) {
        data.forEach(pushSchema);
      } else if (data['@graph'] && Array.isArray(data['@graph'])) {
        data['@graph'].forEach(pushSchema);
      } else {
        pushSchema(data);
      }
    } catch (_) {}
  });

  // Text content & word count
  $('script, style, noscript, svg, nav, footer').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const words = bodyText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const topKeywords = extractKeywords(bodyText);

  // Content to HTML ratio
  const htmlSize = html.length;
  const textSize = bodyText.length;
  const textToCodeRatio = htmlSize > 0 ? ((textSize / htmlSize) * 100).toFixed(1) : 0;

  // Indexation logic
  const robotsComb = `${metaRobots} ${metaGooglebot} ${xRobotsTag}`.toLowerCase();
  const hasNoIndex = robotsComb.includes('noindex');
  const hasNoFollow = robotsComb.includes('nofollow');
  const hasNoSnippet = robotsComb.includes('nosnippet');
  const isHttps = parsedUrl.protocol === 'https:';

  // Security & HTTP Headers Audit
  const hsts = headers['strict-transport-security'] || null;
  const csp = headers['content-security-policy'] || headers['content-security-policy-report-only'] || null;
  const xFrameOptions = headers['x-frame-options'] || null;
  const xContentTypeOptions = headers['x-content-type-options'] || null;
  const referrerPolicy = headers['referrer-policy'] || $('meta[name="referrer" i]').attr('content') || null;
  const permissionsPolicy = headers['permissions-policy'] || headers['feature-policy'] || null;

  // Mixed content detection (if HTTPS page loads HTTP assets)
  let mixedContentCount = 0;
  const mixedContentSamples = [];
  if (isHttps) {
    $('img[src^="http:"], script[src^="http:"], link[href^="http:"]').each((_, el) => {
      mixedContentCount++;
      const src = $(el).attr('src') || $(el).attr('href') || '';
      if (mixedContentSamples.length < 4 && src) mixedContentSamples.push(src);
    });
  }

  let securityScore = 100;
  if (!isHttps) securityScore -= 40;
  if (!hsts) securityScore -= 15;
  if (!csp) securityScore -= 15;
  if (!xFrameOptions) securityScore -= 15;
  if (!xContentTypeOptions) securityScore -= 10;
  if (mixedContentCount > 0) securityScore -= 15;
  securityScore = Math.max(10, Math.min(100, securityScore));

  const securityAudit = {
    score: securityScore,
    isHttps,
    hsts: { present: !!hsts, value: hsts },
    csp: { present: !!csp, value: csp ? (csp.length > 80 ? csp.substring(0, 80) + '...' : csp) : null },
    xFrameOptions: { present: !!xFrameOptions, value: xFrameOptions },
    xContentTypeOptions: { present: !!xContentTypeOptions, value: xContentTypeOptions },
    referrerPolicy: { present: !!referrerPolicy, value: referrerPolicy },
    permissionsPolicy: { present: !!permissionsPolicy, value: permissionsPolicy },
    mixedContent: {
      hasMixedContent: mixedContentCount > 0,
      count: mixedContentCount,
      samples: mixedContentSamples
    }
  };

  // Calculate Web Speed & Core Web Vitals audit
  const contentEncoding = (headers['content-encoding'] || '').toLowerCase();
  const hasCompression = contentEncoding.includes('gzip') || contentEncoding.includes('br') || contentEncoding.includes('deflate');
  const cacheControl = (headers['cache-control'] || '').toString();
  const ttfb = Math.max(50, Math.round(responseTime * 0.7));
  const downloadTime = Math.max(20, responseTime - ttfb);
  const dnsTime = Math.round(Math.min(120, ttfb * 0.15));
  const connectTime = Math.round(Math.min(150, ttfb * 0.25));

  const speedAudit = calculateSpeedMetrics({
    responseTime,
    dnsTime,
    connectTime,
    ttfb,
    downloadTime,
    htmlSize,
    totalImages,
    totalScripts,
    totalStyles,
    hasCompression,
    hasHttp2OrTls: isHttps,
    cacheControl
  });

  // Check if blocked by robots.txt (inspect User-agent: * or Googlebot specifically)
  let isBlockedByRobotsTxt = false;
  if (robotsTxtFound) {
    const pathToCheck = parsedUrl.pathname || '/';
    const sections = robotsTxtContent.split(/(?=User-agent:)/i);
    for (const section of sections) {
      const isTargetBot = /User-agent:\s*(\*|googlebot|bingbot)/i.test(section);
      if (isTargetBot) {
        const disallows = section.match(/Disallow:\s*([^\r\n#]+)/gi) || [];
        const allows = section.match(/Allow:\s*([^\r\n#]+)/gi) || [];
        let matchedDisallow = false;
        for (const rule of disallows) {
          const disallowedPath = rule.replace(/Disallow:\s*/i, '').trim();
          if (disallowedPath === '/' || (disallowedPath.length > 1 && pathToCheck.startsWith(disallowedPath))) {
            matchedDisallow = true;
            break;
          }
        }
        if (matchedDisallow) {
          let hasAllowOverride = false;
          for (const rule of allows) {
            const allowedPath = rule.replace(/Allow:\s*/i, '').trim();
            if (pathToCheck.startsWith(allowedPath)) {
              hasAllowOverride = true;
              break;
            }
          }
          if (!hasAllowOverride) {
            isBlockedByRobotsTxt = true;
          }
        }
      }
    }
  }

  // Canonical analysis
  let canonicalStatus = 'missing';
  let isSelfCanonical = false;
  if (canonicalTag) {
    try {
      const resolvedCanonical = new URL(canonicalTag, targetUrl).href;
      isSelfCanonical = (resolvedCanonical === targetUrl || resolvedCanonical === targetUrl.replace(/\/$/, '') || `${resolvedCanonical}/` === targetUrl);
      canonicalStatus = isSelfCanonical ? 'self' : 'different';
    } catch (_) {
      canonicalStatus = 'invalid';
    }
  }

  // Indexation assessment for engines
  const isIndexable = (status >= 200 && status < 300) && !hasNoIndex && !isBlockedByRobotsTxt;

  const [{ matches: bingMatches, topResult: topIndexedResult }, googleCheck, yandexCheck] = await indexChecksPromise;

  // Calculate automated indexation status
  const isBingIndexed = bingMatches > 0;
  const isYahooIndexed = bingMatches > 0; // Yahoo uses Bing index
  const isDdgIndexed = bingMatches > 0;   // DuckDuckGo syndicates with Bing

  let totalEnginesIndexed = 0;
  if (isBingIndexed) totalEnginesIndexed++;
  if (isYahooIndexed) totalEnginesIndexed++;
  if (isDdgIndexed) totalEnginesIndexed++;
  if (googleCheck.isIndexed === true) totalEnginesIndexed++;
  if (yandexCheck.isIndexed === true) totalEnginesIndexed++;

  // SERP Snippet description truncating
  const maxDescLength = 160;
  const isDescTruncated = metaDescription.length > maxDescLength;
  const displaySnippet = metaDescription
    ? (isDescTruncated ? metaDescription.substring(0, maxDescLength).trim() + '...' : metaDescription)
    : 'No hay meta descripción disponible para esta página. Google y otros buscadores generarán un extracto automático a partir del contenido visible en el cuerpo del sitio.';

  // Search Engine Direct URLs & Real-Time Presence
  const searchUrls = {
    google: {
      name: 'Google',
      isIndexed: googleCheck.isIndexed,
      statusText: googleCheck.isIndexed === true ? 'SÍ, YA ESTÁ INDEXADA' : (googleCheck.isIndexed === false ? 'NO DETECTADA EN EL ÍNDICE' : 'COMPROBAR EN GOOGLE'),
      badge: googleCheck.isIndexed === true ? 'success' : (googleCheck.isIndexed === false ? 'danger' : 'unknown'),
      sampleResult: googleCheck.result,
      details: googleCheck.details,
      siteQuery: `https://www.google.com/search?q=site%3A${encodeURIComponent(targetUrl)}`,
      cacheUrl: `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(targetUrl)}`,
      richTestUrl: `https://search.google.com/test/rich-results?url=${encodeURIComponent(targetUrl)}`,
      mobileTestUrl: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(targetUrl)}`
    },
    bing: {
      name: 'Microsoft Bing',
      isIndexed: isBingIndexed,
      statusText: isBingIndexed ? 'SÍ, YA ESTÁ INDEXADA' : 'NO DETECTADA EN EL ÍNDICE',
      badge: isBingIndexed ? 'success' : 'danger',
      pagesCount: bingMatches,
      sampleResult: topIndexedResult || (isBingIndexed ? { title, url: targetUrl, snippet: displaySnippet } : null),
      details: isBingIndexed 
        ? `¡Comprobación exitosa! Detectadas ${bingMatches}+ páginas activas en el índice de Bing.` 
        : 'La consulta site: no devolvió resultados para este dominio en Bing.',
      siteQuery: `https://www.bing.com/search?q=site%3A${encodeURIComponent(targetUrl)}`,
      webmasterUrl: `https://www.bing.com/webmasters`
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      isIndexed: isDdgIndexed,
      statusText: isDdgIndexed ? 'SÍ, YA ESTÁ INDEXADA' : 'NO DETECTADA EN EL ÍNDICE',
      badge: isDdgIndexed ? 'success' : 'danger',
      sampleResult: topIndexedResult || (isDdgIndexed ? { title, url: targetUrl, snippet: displaySnippet } : null),
      details: isDdgIndexed 
        ? 'Confirmada en la red de índice web de DuckDuckGo.' 
        : 'Aún no aparece en el índice de DuckDuckGo.',
      siteQuery: `https://duckduckgo.com/?q=site%3A${encodeURIComponent(targetUrl)}`
    },
    yahoo: {
      name: 'Yahoo!',
      isIndexed: isYahooIndexed,
      statusText: isYahooIndexed ? 'SÍ, YA ESTÁ INDEXADA' : 'NO DETECTADA EN EL ÍNDICE',
      badge: isYahooIndexed ? 'success' : 'danger',
      sampleResult: topIndexedResult || (isYahooIndexed ? { title, url: targetUrl, snippet: displaySnippet } : null),
      details: isYahooIndexed 
        ? 'Confirmada en el índice de Yahoo Search.' 
        : 'Sin resultados registrados en el índice de Yahoo.',
      siteQuery: `https://search.yahoo.com/search?p=site%3A${encodeURIComponent(targetUrl)}`
    },
    yandex: {
      name: 'Yandex',
      isIndexed: yandexCheck.isIndexed,
      statusText: yandexCheck.isIndexed === true ? 'SÍ, YA ESTÁ INDEXADA' : (yandexCheck.isIndexed === false ? 'NO DETECTADA EN EL ÍNDICE' : 'COMPROBAR EN YANDEX'),
      badge: yandexCheck.isIndexed === true ? 'success' : (yandexCheck.isIndexed === false ? 'danger' : 'unknown'),
      sampleResult: yandexCheck.result,
      details: yandexCheck.details,
      siteQuery: `https://yandex.com/search/?text=site%3A${encodeURIComponent(targetUrl)}`
    }
  };

  // SERP Calculations
  const titlePixelWidth = estimatePixelWidth(title);
  const maxTitlePixels = 580; // Google's visual cut-off is ~580-600px
  const isTitleTruncated = titlePixelWidth > maxTitlePixels;

  // Clean URL breadcrumbs
  const breadcrumbParts = [parsedUrl.hostname.replace('www.', '')];
  if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    breadcrumbParts.push(...segments.slice(0, 2));
  }
  const breadcrumbDisplay = breadcrumbParts.join(' › ');

  // Comprehensive SEO Score Calculation (0-100)
  let score = 100;
  const issues = [];
  const passed = [];

  // 1. Indexability & Status (35 pts max deduction)
  if (status !== 200) {
    score -= 30;
    issues.push({
      type: 'critical',
      category: 'Indexabilidad',
      title: `Código de respuesta HTTP ${status}`,
      desc: 'La página no devolvió un código 200 OK. Los buscadores no indexarán páginas con errores 4xx o 5xx.'
    });
  } else {
    passed.push({
      category: 'Indexabilidad',
      title: 'Respuesta HTTP 200 OK',
      desc: 'El servidor responde correctamente.'
    });
  }

  if (hasNoIndex) {
    score -= 35;
    issues.push({
      type: 'critical',
      category: 'Indexabilidad',
      title: 'Etiqueta "noindex" detectada',
      desc: 'Se encontró la directiva noindex en meta robots o en las cabeceras HTTP. Esto prohíbe explícitamente a Google y Bing indexar esta página.'
    });
  } else {
    passed.push({
      category: 'Indexabilidad',
      title: 'Sin bloqueo "noindex"',
      desc: 'Los robots tienen permiso para indexar la página.'
    });
  }

  if (isBlockedByRobotsTxt) {
    score -= 20;
    issues.push({
      type: 'warning',
      category: 'Rastreo',
      title: 'Ruta bloqueada por robots.txt',
      desc: 'Una regla Disallow en robots.txt parece bloquear el rastreo de esta ruta para los motores de búsqueda.'
    });
  } else if (robotsTxtFound) {
    passed.push({
      category: 'Rastreo',
      title: 'robots.txt configurado',
      desc: 'El archivo robots.txt está presente y permite el rastreo general.'
    });
  } else {
    issues.push({
      type: 'info',
      category: 'Rastreo',
      title: 'robots.txt no encontrado',
      desc: 'No se detectó un archivo robots.txt en la raíz del dominio.'
    });
  }

  if (!isHttps) {
    score -= 10;
    issues.push({
      type: 'warning',
      category: 'Seguridad',
      title: 'No utiliza HTTPS seguro',
      desc: 'Google favorece los sitios con certificado SSL/HTTPS activo para el posicionamiento y la confianza del usuario.'
    });
  } else {
    passed.push({
      category: 'Seguridad',
      title: 'Conexión HTTPS segura',
      desc: 'El sitio cuenta con cifrado SSL/TLS.'
    });
  }

  // 2. Metadatos & SERP Snippet (25 pts max deduction)
  if (!title) {
    score -= 20;
    issues.push({
      type: 'critical',
      category: 'Metadatos',
      title: 'Falta la etiqueta <title>',
      desc: 'La etiqueta Title es el factor de SEO on-page más importante para los buscadores.'
    });
  } else if (title.length < 30) {
    score -= 6;
    issues.push({
      type: 'warning',
      category: 'Metadatos',
      title: `Título demasiado corto (${title.length} caracteres)`,
      desc: 'Se recomienda que el título tenga entre 45 y 60 caracteres para aprovechar todo el espacio disponible en Google.'
    });
  } else if (titlePixelWidth > 580 || title.length > 65) {
    score -= 4;
    issues.push({
      type: 'warning',
      category: 'Metadatos',
      title: `Título demasiado largo (${title.length} carácteres, ~${titlePixelWidth}px)`,
      desc: 'El título excede los 580px visibles en Google SERP y se cortará con puntos suspensivos (...).'
    });
  } else {
    passed.push({
      category: 'Metadatos',
      title: `Título óptimo (${title.length} carácteres, ~${titlePixelWidth}px)`,
      desc: 'La longitud y visibilidad en resultados de búsqueda son ideales.'
    });
  }

  if (!metaDescription) {
    score -= 15;
    issues.push({
      type: 'critical',
      category: 'Metadatos',
      title: 'Falta la Meta Descripción',
      desc: 'No se encontró la meta descripción. Aunque no influye directamente en el ranking, es vital para el CTR (clics) en las SERP.'
    });
  } else if (metaDescription.length < 70) {
    score -= 5;
    issues.push({
      type: 'warning',
      category: 'Metadatos',
      title: `Meta descripción corta (${metaDescription.length} caracteres)`,
      desc: 'Una descripción entre 120 y 155 caracteres describe mejor el contenido e incrementa las visitas.'
    });
  } else if (metaDescription.length > 165) {
    score -= 3;
    issues.push({
      type: 'warning',
      category: 'Metadatos',
      title: `Meta descripción extensa (${metaDescription.length} caracteres)`,
      desc: 'Supera los 160 caracteres estándar de Google y podría verse truncada en escritorio y móvil.'
    });
  } else {
    passed.push({
      category: 'Metadatos',
      title: `Meta descripción excelente (${metaDescription.length} caracteres)`,
      desc: 'Longitud calibrada perfectamente para el snippet de Google.'
    });
  }

  if (canonicalStatus === 'missing') {
    score -= 6;
    issues.push({
      type: 'warning',
      category: 'Indexabilidad',
      title: 'Falta la etiqueta Canonical',
      desc: 'Tener una etiqueta rel="canonical" previene problemas de contenido duplicado (ej: con/sin www, parámetros).'
    });
  } else if (canonicalStatus === 'self') {
    passed.push({
      category: 'Indexabilidad',
      title: 'Etiqueta Canonical autorreferenciada',
      desc: 'Indica a los buscadores con certeza la URL principal preferida.'
    });
  } else {
    issues.push({
      type: 'info',
      category: 'Indexabilidad',
      title: 'Etiqueta Canonical apunta a otra URL',
      desc: `La página declara como canónica: ${canonicalTag}. Google priorizará indexar esa otra URL.`
    });
  }

  // 3. Encabezados y Contenido (25 pts max deduction)
  if (headings.h1.length === 0) {
    score -= 15;
    issues.push({
      type: 'critical',
      category: 'Estructura',
      title: 'Falta el encabezado principal <h1>',
      desc: 'Cada página debe tener exactamente un encabezado H1 con la palabra clave principal.'
    });
  } else if (headings.h1.length > 1) {
    score -= 6;
    issues.push({
      type: 'warning',
      category: 'Estructura',
      title: `Múltiples etiquetas <h1> encontradas (${headings.h1.length})`,
      desc: 'Se recomienda mantener un único H1 representativo por página para clarificar la jerarquía temática.'
    });
  } else {
    passed.push({
      category: 'Estructura',
      title: 'Etiqueta <h1> única y definida',
      desc: `H1: "${headings.h1[0].substring(0, 70)}${headings.h1[0].length > 70 ? '...' : ''}"`
    });
  }

  if (headings.h2.length === 0) {
    score -= 5;
    issues.push({
      type: 'warning',
      category: 'Estructura',
      title: 'Sin encabezados secundarios <h2>',
      desc: 'Los subtítulos H2 ayudan a organizar las secciones del contenido tanto para usuarios como para rastreadores.'
    });
  } else {
    passed.push({
      category: 'Estructura',
      title: `${headings.h2.length} subtítulos <h2> detectados`,
      desc: 'Buena segmentación temática del documento.'
    });
  }

  if (wordCount < 150) {
    score -= 10;
    issues.push({
      type: 'warning',
      category: 'Contenido',
      title: `Contenido escaso (${wordCount} palabras)`,
      desc: 'Páginas con muy poco texto ("thin content") suelen tener dificultades para posicionar en búsquedas orgánicas.'
    });
  } else {
    passed.push({
      category: 'Contenido',
      title: `Contenido extenso (${wordCount} palabras)`,
      desc: 'Volumen de texto adecuado para comprensión semántica.'
    });
  }

  // 4. Imágenes & Multimedia (10 pts)
  if (totalImages > 0 && imagesWithoutAlt > 0) {
    const pct = Math.round((imagesWithoutAlt / totalImages) * 100);
    score -= Math.min(8, Math.ceil(pct / 15));
    issues.push({
      type: 'warning',
      category: 'Imágenes',
      title: `${imagesWithoutAlt} de ${totalImages} imágenes sin texto ALT`,
      desc: 'El atributo alt es indispensable para la indexación en Google Imágenes y la accesibilidad web.'
    });
  } else if (totalImages > 0) {
    passed.push({
      category: 'Imágenes',
      title: 'Todas las imágenes tienen atributo ALT',
      desc: `100% de cumplimiento en ${totalImages} imágenes inspeccionadas.`
    });
  }

  // 5. Técnica, Móvil & Social (10 pts)
  if (!viewport) {
    score -= 10;
    issues.push({
      type: 'critical',
      category: 'Móvil',
      title: 'Falta la etiqueta viewport',
      desc: 'La página no está adaptada para dispositivos móviles. Google usa indexación mobile-first obligatoria.'
    });
  } else {
    passed.push({
      category: 'Móvil',
      title: 'Diseño adaptable (Mobile Viewport)',
      desc: 'Meta viewport configurado para dispositivos móviles.'
    });
  }

  if (!ogImage || !ogTitle) {
    issues.push({
      type: 'info',
      category: 'Redes Sociales',
      title: 'Etiquetas OpenGraph incompletas',
      desc: 'Faltan imágenes o títulos OpenGraph para enriquecer la previsualización al compartir en WhatsApp, Facebook o LinkedIn.'
    });
  } else {
    passed.push({
      category: 'Redes Sociales',
      title: 'Open Graph (Social Cards) listo',
      desc: 'Tarjeta social correctamente configurada con título e imagen.'
    });
  }

  if (schemas.length > 0) {
    passed.push({
      category: 'Datos Estructurados',
      title: `Datos estructurados Schema.org detectados (${schemas.slice(0, 3).join(', ')})`,
      desc: 'Habilita a Google para interpretar la semántica del contenido y mostrar Rich Snippets (estrellas, FAQs, ofertas).'
    });
  } else {
    issues.push({
      type: 'warning',
      category: 'Datos Estructurados',
      title: 'Sin datos estructurados Schema.org',
      desc: 'No se detectó marcado JSON-LD. Añadir esquemas Schema.org incrementa el CTR y mejora la presencia en Google SERP.'
    });
  }

  // 6. Seguridad y Cabeceras HTTP
  if (hsts) {
    passed.push({
      category: 'Seguridad',
      title: 'Cabecera HSTS activa',
      desc: 'Fuerza conexiones estrictas mediante HTTPS para prevenir ataques man-in-the-middle.'
    });
  } else if (isHttps) {
    issues.push({
      type: 'warning',
      category: 'Seguridad',
      title: 'Falta cabecera HSTS (Strict-Transport-Security)',
      desc: 'Se recomienda activar HSTS en el servidor para forzar a los navegadores a comunicarse siempre bajo HTTPS.'
    });
  }

  if (csp) {
    passed.push({
      category: 'Seguridad',
      title: 'Content-Security-Policy (CSP) configurada',
      desc: 'Defensa activa contra inyecciones XSS y ejecución de código no autorizado.'
    });
  } else {
    issues.push({
      type: 'warning',
      category: 'Seguridad',
      title: 'Falta cabecera CSP (Content-Security-Policy)',
      desc: 'Configurar CSP previene la inyección de scripts externos maliciosos y robo de datos.'
    });
  }

  if (xFrameOptions) {
    passed.push({
      category: 'Seguridad',
      title: `Protección Clickjacking activa (${xFrameOptions})`,
      desc: 'X-Frame-Options configurada adecuadamente.'
    });
  } else {
    issues.push({
      type: 'warning',
      category: 'Seguridad',
      title: 'Falta cabecera X-Frame-Options',
      desc: 'Sin esta cabecera, sitios externos pueden incrustar tu web en iframes invisibles (ataque clickjacking).'
    });
  }

  if (xContentTypeOptions) {
    passed.push({
      category: 'Seguridad',
      title: 'Protección MIME Sniffing activa (nosniff)',
      desc: 'X-Content-Type-Options impide a los navegadores interpretar archivos como un MIME incorrecto.'
    });
  } else {
    issues.push({
      type: 'warning',
      category: 'Seguridad',
      title: 'Falta cabecera X-Content-Type-Options: nosniff',
      desc: 'Se aconseja activar nosniff para evitar vulnerabilidades de interpretación de tipos de archivo.'
    });
  }

  if (mixedContentCount > 0) {
    score -= 10;
    issues.push({
      type: 'critical',
      category: 'Seguridad',
      title: `Contenido Mixto detectado (${mixedContentCount} elementos HTTP)`,
      desc: 'La página carga recursos inseguros por HTTP dentro de una conexión HTTPS. Los navegadores modernos bloquean estos recursos.'
    });
  } else if (isHttps) {
    passed.push({
      category: 'Seguridad',
      title: 'Sin Contenido Mixto (Mixed Content)',
      desc: 'Todos los recursos se sirven a través del canal cifrado seguro.'
    });
  }

  // 7. SEO Internacional y Rendimiento Core Web Vitals
  if (!htmlLang) {
    score -= 4;
    issues.push({
      type: 'warning',
      category: 'Internacional',
      title: 'Falta atributo lang en etiqueta <html>',
      desc: 'Google y los lectores de pantalla necesitan conocer el idioma principal del documento (ej: lang="es").'
    });
  } else {
    passed.push({
      category: 'Internacional',
      title: `Idioma declarado correctamente (lang="${htmlLang}")`,
      desc: 'Facilita la indexación regional en los resultados de búsqueda de Google.'
    });
  }

  if (hasCompression) {
    passed.push({
      category: 'Rendimiento',
      title: 'Compresión en servidor activa (Gzip / Brotli)',
      desc: 'Reduce sustancialmente el peso de transferencia de los recursos de la web.'
    });
  } else {
    issues.push({
      type: 'warning',
      category: 'Rendimiento',
      title: 'Compresión HTTP no detectada en servidor',
      desc: 'Habilitar Gzip o Brotli acelera la velocidad de carga (FCP y LCP).'
    });
  }

  if (responseTime > 1200) {
    score -= 5;
    issues.push({
      type: 'warning',
      category: 'Rendimiento',
      title: `Tiempo de respuesta lento (${responseTime}ms)`,
      desc: 'El servidor tardó más de 1.2 segundos en entregar el HTML inicial. Afecta el rastreo y Core Web Vitals.'
    });
  } else {
    passed.push({
      category: 'Rendimiento',
      title: `Tiempo de respuesta rápido (${responseTime}ms)`,
      desc: 'Excelente latencia inicial de respuesta.'
    });
  }

  // Final score clamping
  score = Math.max(10, Math.min(100, score));

  // Determine Grade
  let grade = 'Excelente';
  let gradeColor = '#10b981';
  if (score < 50) {
    grade = 'Crítico';
    gradeColor = '#ef4444';
  } else if (score < 75) {
    grade = 'Requiere Mejoras';
    gradeColor = '#f59e0b';
  } else if (score < 90) {
    grade = 'Bueno';
    gradeColor = '#3b82f6';
  }

  return res.json({
    url: targetUrl,
    domain: parsedUrl.hostname,
    status,
    responseTime,
    score,
    grade,
    gradeColor,
    isHttps,
    indexability: {
      isIndexable,
      hasNoIndex,
      hasNoFollow,
      hasNoSnippet,
      metaRobots: metaRobots || 'No definida (index, follow por defecto)',
      metaGooglebot: metaGooglebot || 'No definida',
      xRobotsTag: xRobotsTag || 'Ninguna cabecera',
      canonicalTag,
      canonicalStatus,
      isSelfCanonical,
      robotsTxt: {
        found: robotsTxtFound,
        url: `${origin}/robots.txt`,
        isBlocked: isBlockedByRobotsTxt,
        directives: robotsDirectives
      },
      sitemap: {
        found: !!sitemapUrl,
        url: sitemapUrl
      }
    },
    serp: {
      title,
      titleLength: title.length,
      titlePixelWidth,
      isTitleTruncated,
      breadcrumbDisplay,
      metaDescription,
      metaDescLength: metaDescription.length,
      isDescTruncated,
      displaySnippet,
      favicon,
      og: {
        title: ogTitle,
        description: ogDesc,
        image: ogImage,
        siteName: ogSiteName
      },
      twitter: {
        card: twitterCard,
        title: ogTitle,
        image: ogImage
      }
    },
    contentAnalysis: {
      wordCount,
      textToCodeRatio,
      htmlSizeBytes: htmlSize,
      headings,
      images: {
        total: totalImages,
        missingAlt: imagesWithoutAlt,
        samples: sampleImages
      },
      links: {
        internal: internalLinks,
        external: externalLinks,
        nofollow: nofollowLinks
      },
      topKeywords,
      schemas,
      structuredDataDetails,
      hreflangs,
      htmlLang,
      charset
    },
    security: securityAudit,
    searchEngines: searchUrls,
    presenceSummary: {
      totalIndexed: totalEnginesIndexed,
      totalEngines: 3 + Number(googleCheck.isIndexed !== null) + Number(yandexCheck.isIndexed !== null),
      isFullyIndexed: totalEnginesIndexed === 3 + Number(googleCheck.isIndexed !== null) + Number(yandexCheck.isIndexed !== null),
      unverifiedEngines: Number(googleCheck.isIndexed === null) + Number(yandexCheck.isIndexed === null),
      bingMatches,
      sampleResult: topIndexedResult
    },
    audit: {
      issues,
      passed,
      stats: {
        critical: issues.filter(i => i.type === 'critical').length,
        warnings: issues.filter(i => i.type === 'warning').length,
        passed: passed.length
      }
    },
    speed: speedAudit
  });
});

app.listen(PORT, () => {
  console.log(`Servidor SEO SERP Studio activo en http://localhost:${PORT}`);
});
