const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve('c:/Users/delfi/Documents/Clinica Dental/node_modules/puppeteer'));

const baseDir = 'c:/Users/delfi/Documents/Clinica Dental';
const pdfDir = path.join(baseDir, 'PDF_Para_Imprenta');
const imgDir = path.join(baseDir, 'Imagenes_Impresion');

if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

(async () => {
  console.log('🚀 Actualizando Hoja Membretada con marca de agua y pie 100% limpio (sin arco gris)...');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // 1. Base image for header and footer
  const imgPath = path.join(baseDir, 'assets/images/hoja_membretada_limpia.png');
  const base64 = fs.readFileSync(imgPath).toString('base64');

  // 2. Original high-res transparent watermark
  const watermarkPath = path.join(baseDir, 'assets/images/marca_de_agua_original.png');
  const watermarkB64 = `data:image/png;base64,${fs.readFileSync(watermarkPath).toString('base64')}`;

  await page.setContent(`
    <!DOCTYPE html>
    <html><body>
      <canvas id="c"></canvas>
      <img id="img" src="data:image/png;base64,${base64}" />
    </body></html>
  `);

  const slices = await page.evaluate(() => {
    const img = document.getElementById('img');
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');

    // 1. Header (y: 0 to 205)
    c.width = img.naturalWidth;
    c.height = 205;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, img.naturalWidth, 205, 0, 0, img.naturalWidth, 205);
    const headerDataUrl = c.toDataURL('image/png');

    // 2. Clean Footer SIN FIRMA a la derecha & SIN ARCO GRIS DE LA MARCA DE AGUA ANTERIOR
    c.width = img.naturalWidth;
    c.height = 171;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 620, img.naturalWidth, 171, 0, 0, img.naturalWidth, 171);
    
    const fImgData = ctx.getImageData(0, 0, c.width, c.height);
    const fData = fImgData.data;

    // Scan each column from top to bottom.
    // Everything above the dark green curve is set to pure white (#FFFFFF)!
    for (let x = 0; x < c.width; x++) {
      let greenY = c.height;
      for (let y = 0; y < c.height; y++) {
        const idx = (y * c.width + x) * 4;
        const r = fData[idx];
        const g = fData[idx + 1];
        if (r < 50 && g > 25 && g > r * 1.3) {
          greenY = y;
          break;
        }
      }
      // Fill everything above the green curve with pure white
      for (let y = 0; y < greenY; y++) {
        const idx = (y * c.width + x) * 4;
        fData[idx] = 255;
        fData[idx + 1] = 255;
        fData[idx + 2] = 255;
        fData[idx + 3] = 255;
      }
    }
    ctx.putImageData(fImgData, 0, 0);
    const footerCleanDataUrl = c.toDataURL('image/png');

    // 3. Signature Block (line + Dra. Laura Santos Cruz)
    c.width = 300;
    c.height = 36;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 715, 638, 300, 36, 0, 0, 300, 36);
    const sImgData = ctx.getImageData(0, 0, c.width, c.height);
    const sData = sImgData.data;
    for (let i = 0; i < sData.length; i += 4) {
      const r = sData[i];
      const g = sData[i+1];
      const b = sData[i+2];
      if (r > 245 && g > 245 && b > 245) {
        sData[i+3] = 0;
      }
    }
    ctx.putImageData(sImgData, 0, 0);
    const sigDataUrl = c.toDataURL('image/png');

    return { headerDataUrl, footerCleanDataUrl, sigDataUrl };
  });

  const { headerDataUrl, footerCleanDataUrl, sigDataUrl } = slices;

  // Save the cleaned footer file to disk so html page can also load it
  const cleanFooterB64 = footerCleanDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(path.join(baseDir, 'assets/images/membrete_footer_clean.png'), Buffer.from(cleanFooterB64, 'base64'));

  const buildHtml = (withSignature = true) => `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Hoja Membretada Tamaño Carta</title>
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
      .letterhead-sheet {
        width: 8.5in;
        height: 11in;
        position: relative;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
      }
      .header-wrapper {
        width: 100%;
        padding: 0.35in 0.4in 0 0.4in;
        position: relative;
        z-index: 10;
      }
      .header-wrapper img {
        width: 100%;
        height: auto;
        display: block;
      }
      /* Marca de agua original en alta resolución */
      .watermark-wrapper {
        position: absolute;
        top: 49%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6.0in;
        opacity: 0.12;
        pointer-events: none;
        z-index: 2;
      }
      .watermark-wrapper img {
        width: 100%;
        height: auto;
        display: block;
      }
      .content-wrapper {
        flex: 1;
        position: relative;
        z-index: 5;
        padding: 0.2in 0.8in;
      }
      ${withSignature ? `
      .signature-centered {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 1.5in;
        width: 2.6in;
        z-index: 15;
      }
      .signature-centered img {
        width: 100%;
        height: auto;
        display: block;
      }
      ` : ''}
      .footer-wrapper {
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 10;
      }
      .footer-wrapper img {
        width: 100%;
        height: auto;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="letterhead-sheet">
      <div class="header-wrapper">
        <img src="${headerDataUrl}" alt="Encabezado Dra. Laura Santos Cruz" />
      </div>

      <div class="watermark-wrapper">
        <img src="${watermarkB64}" alt="Marca de Agua Original Dra. Santos" />
      </div>

      <div class="content-wrapper">
        <!-- Espacio amplio para redacción de documentos, notas médicas, etc. -->
      </div>

      ${withSignature ? `
      <div class="signature-centered">
        <img src="${sigDataUrl}" alt="Firma Centrada Dra. Laura Santos Cruz" />
      </div>
      ` : ''}

      <div class="footer-wrapper">
        <img src="${footerCleanDataUrl}" alt="Pie de Página Dra. Laura Santos Cruz" />
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });

  // 1. Hoja Membretada con Firma Centrada y Marca de Agua Oficial
  console.log('📄 Generando: Hoja_Membretada_Dra_Laura_Santos_Carta.pdf');
  await page.setContent(buildHtml(true), { waitUntil: 'load' });
  await page.pdf({
    path: path.join(pdfDir, 'Hoja_Membretada_Dra_Laura_Santos_Carta.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await page.screenshot({ path: path.join(imgDir, 'Hoja_Membretada_Carta_VistaPrevia.png'), fullPage: true });

  // 2. Hoja Membretada Sin Firma
  console.log('📄 Generando: Hoja_Membretada_Dra_Laura_Santos_Carta_SinFirma.pdf');
  await page.setContent(buildHtml(false), { waitUntil: 'load' });
  await page.pdf({
    path: path.join(pdfDir, 'Hoja_Membretada_Dra_Laura_Santos_Carta_SinFirma.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('✅ ¡Hoja membretada generada con pie de página 100% limpio y sin arco gris!');
  await browser.close();
})();
