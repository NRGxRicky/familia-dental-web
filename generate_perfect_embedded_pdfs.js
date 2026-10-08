const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const baseDir = __dirname;
const pdfDir = path.join(baseDir, 'PDF_Para_Imprenta');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

function getBase64Image(relPath) {
  const fullPath = path.join(baseDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error('File not found for base64:', fullPath);
    return '';
  }
  const ext = path.extname(fullPath).toLowerCase();
  let mime = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
  else if (ext === '.svg') mime = 'image/svg+xml';
  const data = fs.readFileSync(fullPath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

(async () => {
  console.log('🌟 Generando PDFs con TODAS las imágenes incrustadas en Base64 (Sin imágenes rotas)...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  const tarjetasPath = 'file:///' + path.join(baseDir, 'tarjetas_presentacion.html').replace(/\\/g, '/');
  await page.goto(tarjetasPath, { waitUntil: 'networkidle0' });

  // Read all assets as base64
  const logoColor4k = getBase64Image('Logo/logo oficial/png/logocompleto_4k.png');
  const logoBlanco4k = getBase64Image('Logo/logo oficial/png/logocompleto_blanco_4k.png');
  const logoMiniColor = getBase64Image('Logo/logo oficial/png/logosimple_png.png');
  const logoMiniBlanco = getBase64Image('Logo/logo oficial/png/logosimple_blanco.png');
  const qrClean = getBase64Image('assets/images/qr_whatsapp_clean.png');

  const iconNames = [
    'limpieza', 'resinas', 'blanqueamiento', 'diseno_sonrisa',
    'ortodoncia', 'endodoncia', 'implantes', 'cirugias',
    'extracciones', 'protesis', 'pediatricos'
  ];

  const iconsBase64 = {};
  for (const name of iconNames) {
    iconsBase64[name] = getBase64Image(`assets/icons/services/${name}.png`);
  }

  // Get CSS
  const cssRules = await page.evaluate(() => {
    let s = '';
    for (const sheet of document.styleSheets) {
      try { for (const rule of sheet.cssRules) s += rule.cssText + '\n'; } catch (e) {}
    }
    return s;
  });

  // Services HTML builder with embedded base64
  const buildServicesGrid = (isDark = false) => {
    const textColor = isDark ? '#FFFFFF' : '#0B1E36';
    const labels = {
      limpieza: 'Limpieza', resinas: 'Resinas', blanqueamiento: 'Blanqueamiento',
      diseno_sonrisa: 'D. Sonrisa', ortodoncia: 'Ortodoncia', endodoncia: 'Endodoncia',
      implantes: 'Implantes', cirugias: 'Cirugías', extracciones: 'Extracciones',
      protesis: 'Prótesis', pediatricos: 'Pediatría'
    };

    return `
      <div class="card-services-grid">
        ${iconNames.map(name => `
          <div class="card-svc-item">
            <img src="${iconsBase64[name]}" alt="${labels[name]}">
            <span style="color: ${textColor} !important;">${labels[name]}</span>
          </div>
        `).join('')}
      </div>
    `;
  };

  // Card 1 Frente & Reverso
  const c1FrontHtml = `
    <div class="card-s1-front">
      <img src="${logoColor4k}" alt="Logo Frente">
    </div>
  `;

  const c1BackHtml = `
    <div class="card-s1-back">
      <div class="card-s1-back-header">
        <span class="card-services-header">✦ NUESTROS SERVICIOS ✦</span>
        <img src="${logoMiniColor}" alt="Logo Mini" class="card-mini-logo">
      </div>
      ${buildServicesGrid(false)}
      <div class="card-s1-back-body">
        <div class="card-contact-items">
          <div>📞 Citas & WA: 221 193 9115</div>
          <div>✉️ familiadentalpue@gmail.com</div>
          <div>📍 11 Sur 2504, Col. Chula Vista, Puebla</div>
          <div>🕒 Lun-Vie 9:30am-6:00pm | Sáb previa cita</div>
        </div>
        <div class="card-qr-box">
          <img src="${qrClean}" alt="QR WhatsApp">
        </div>
      </div>
    </div>
  `;

  // Card 2 Frente & Reverso (Dark Luxury)
  const c2FrontHtml = `
    <div class="card-s2-front">
      <img src="${logoBlanco4k}" alt="Logo Frente Blanco">
    </div>
  `;

  const c2BackHtml = `
    <div class="card-s2-back">
      <div class="card-s1-back-header">
        <span class="card-services-header" style="color:#C8A96E !important;">✦ NUESTROS SERVICIOS ✦</span>
        <img src="${logoMiniBlanco}" alt="Logo Mini Blanco" class="card-mini-logo">
      </div>
      ${buildServicesGrid(true)}
      <div class="card-s1-back-body">
        <div class="card-contact-items" style="color:#FFFFFF !important;">
          <div>📞 WA: 221 193 9115</div>
          <div>✉️ familiadentalpue@gmail.com</div>
          <div>📍 11 Sur 2504, Col. Chula Vista, Puebla</div>
          <div>🕒 Lun-Vie 9:30am-6:00pm | Sáb previa cita</div>
        </div>
        <div class="card-qr-box" style="background:#FFF">
          <img src="${qrClean}" alt="QR WhatsApp">
        </div>
      </div>
    </div>
  `;

  // Card 3 Frente & Reverso (Moderno Editorial)
  const c3FrontHtml = `
    <div class="card-s3-front">
      <img src="${logoColor4k}" alt="Logo Frente">
    </div>
  `;

  const c3BackHtml = c1BackHtml; // Same back layout

  const makePdfDocument = (cardsArray) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        ${cssRules}
        @page {
          size: 3.5in 2in;
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .pdf-page-container {
          width: 3.5in;
          height: 2in;
          page-break-after: always;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .pdf-page-container:last-child {
          page-break-after: avoid;
        }
        .card-s1-front, .card-s1-back, .card-s2-front, .card-s2-back, .card-s3-front {
          box-shadow: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
        }
      </style>
    </head>
    <body>
      ${cardsArray.map(c => `<div class="pdf-page-container">${c}</div>`).join('')}
    </body>
    </html>
  `;

  const exportPdf = async (cards, filename) => {
    const p = await browser.newPage();
    await p.setContent(makePdfDocument(cards), { waitUntil: 'networkidle0' });
    await p.pdf({
      path: path.join(pdfDir, filename),
      width: '3.5in',
      height: '2in',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    await p.close();
    console.log('✅ Generated PDF:', filename);
  };

  // Generate All Clean Vector PDFs
  await exportPdf([c1FrontHtml], 'Tarjeta_Estilo1_Frente.pdf');
  await exportPdf([c1BackHtml], 'Tarjeta_Estilo1_Reverso.pdf');
  await exportPdf([c1FrontHtml, c1BackHtml], 'Tarjeta_Estilo1_Completa_2Caras.pdf');

  await exportPdf([c2FrontHtml], 'Tarjeta_Estilo2_Frente.pdf');
  await exportPdf([c2BackHtml], 'Tarjeta_Estilo2_Reverso.pdf');
  await exportPdf([c2FrontHtml, c2BackHtml], 'Tarjeta_Estilo2_Completa_2Caras.pdf');

  await exportPdf([c3FrontHtml], 'Tarjeta_Estilo3_Frente.pdf');
  await exportPdf([c3BackHtml], 'Tarjeta_Estilo3_Reverso.pdf');
  await exportPdf([c3FrontHtml, c3BackHtml], 'Tarjeta_Estilo3_Completa_2Caras.pdf');

  await browser.close();
  console.log('🎉 ¡Todos los PDFs generados con imágenes 100% incrustadas sin errores!');
})();
