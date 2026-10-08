const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve('c:/Users/delfi/Documents/Clinica Dental/node_modules/puppeteer'));

const baseDir = 'c:/Users/delfi/Documents/Clinica Dental';
const pdfDir = path.join(baseDir, 'PDF_Para_Imprenta');
const imgDir = path.join(baseDir, 'Imagenes_Impresion');

if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// Read the original image with green letters
const originalImgPath = path.join(baseDir, 'assets/images/receta_original.jpg');
const originalImgBase64 = `data:image/jpeg;base64,${fs.readFileSync(originalImgPath).toString('base64')}`;

// Template for 2 prescriptions on 1 Letter sheet (8.5in x 11in)
function generateLetterHtml(options = {}) {
  const { showGuide = true, padding = '0.1in 0.2in' } = options;

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Receta Médica - 2 en Hoja Carta</title>
    <style>
      @page {
        size: letter portrait;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        width: 8.5in;
        height: 11in;
        margin: 0;
        padding: 0;
        background: #ffffff;
      }
      .page-container {
        width: 8.5in;
        height: 11in;
        display: flex;
        flex-direction: column;
        position: relative;
        background: #ffffff;
        overflow: hidden;
      }
      .receta-box {
        width: 8.5in;
        height: 5.5in;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${padding};
        position: relative;
        background: #ffffff;
      }
      .receta-box img {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        display: block;
      }
      ${showGuide ? `
      .divider-guide {
        position: absolute;
        top: 5.5in;
        left: 0;
        width: 100%;
        height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      }
      .guide-line {
        position: absolute;
        left: 0.25in;
        right: 0.25in;
        border-top: 1px dashed #94a3b8;
      }
      .guide-label {
        position: relative;
        background: #ffffff;
        padding: 0 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 7.5pt;
        font-weight: 600;
        color: #64748b;
        letter-spacing: 1.2px;
        text-transform: uppercase;
      }
      ` : ''}
    </style>
  </head>
  <body>
    <div class="page-container">
      <div class="receta-box">
        <img src="${originalImgBase64}" alt="Receta 1" />
      </div>
      ${showGuide ? `
      <div class="divider-guide">
        <div class="guide-line"></div>
        <span class="guide-label">✂ Línea de corte / Media Carta</span>
      </div>
      ` : ''}
      <div class="receta-box">
        <img src="${originalImgBase64}" alt="Receta 2" />
      </div>
    </div>
  </body>
  </html>
  `;
}

// Template for 1 prescription on Half-Letter (8.5in x 5.5in)
function generateMediaCartaHtml() {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Receta Médica - Media Carta</title>
    <style>
      @page {
        size: 8.5in 5.5in;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        width: 8.5in;
        height: 5.5in;
        margin: 0;
        padding: 0;
        background: #ffffff;
      }
      .card-container {
        width: 8.5in;
        height: 5.5in;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.1in 0.2in;
        background: #ffffff;
        overflow: hidden;
      }
      .card-container img {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="card-container">
      <img src="${originalImgBase64}" alt="Receta Media Carta" />
    </div>
  </body>
  </html>
  `;
}

(async () => {
  console.log('🌟 Generando PDFs con las letras verdes originales...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });

  // 1. PDF 2 por Hoja Carta con Guía de Corte
  console.log('📄 Generando: Receta_Dra_Laura_Santos_2_por_Hoja_Carta.pdf');
  await page.setContent(generateLetterHtml({ showGuide: true, padding: '0.1in 0.2in' }), { waitUntil: 'load' });
  await page.pdf({
    path: path.join(pdfDir, 'Receta_Dra_Laura_Santos_2_por_Hoja_Carta.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  // Guardar vista previa PNG
  await page.screenshot({ path: path.join(imgDir, 'Receta_2_en_Carta_VistaPrevia.png'), fullPage: true });

  // 2. PDF 2 por Hoja Carta Sin Guía
  console.log('📄 Generando: Receta_Dra_Laura_Santos_2_por_Hoja_Carta_SinGuias.pdf');
  await page.setContent(generateLetterHtml({ showGuide: false, padding: '0.1in 0.2in' }), { waitUntil: 'load' });
  await page.pdf({
    path: path.join(pdfDir, 'Receta_Dra_Laura_Santos_2_por_Hoja_Carta_SinGuias.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  // 3. PDF 2 por Hoja Carta Al Corte (Full Bleed)
  console.log('📄 Generando: Receta_Dra_Laura_Santos_2_por_Hoja_Carta_FullBleed.pdf');
  await page.setContent(generateLetterHtml({ showGuide: false, padding: '0' }), { waitUntil: 'load' });
  await page.pdf({
    path: path.join(pdfDir, 'Receta_Dra_Laura_Santos_2_por_Hoja_Carta_FullBleed.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  // 4. PDF Media Carta Individual (5.5" x 8.5")
  console.log('📄 Generando: Receta_Dra_Laura_Santos_Media_Carta_Individual.pdf');
  await page.setViewport({ width: 816, height: 528, deviceScaleFactor: 2 });
  await page.setContent(generateMediaCartaHtml(), { waitUntil: 'load' });
  await page.pdf({
    path: path.join(pdfDir, 'Receta_Dra_Laura_Santos_Media_Carta_Individual.pdf'),
    width: '8.5in',
    height: '5.5in',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('✅ ¡Todos los PDFs han sido actualizados con letras negras!');
  await browser.close();
})();
