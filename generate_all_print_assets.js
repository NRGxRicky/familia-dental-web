const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const baseDir = __dirname;
const mainOutputDir = path.join(baseDir, 'Imagenes_Impresion');
const pdfDir = path.join(baseDir, 'PDF_Para_Imprenta');

[mainOutputDir, pdfDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('🌟 Iniciando Generación de Tarjetas para Imprenta...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 1. RENDER ULTRA HD PNG (deviceScaleFactor: 12 -> 4032 x 2304 px / 1152 DPI)
  await page.setViewport({ width: 2560, height: 1600, deviceScaleFactor: 12 });
  const tarjetasPath = 'file:///' + path.join(baseDir, 'tarjetas_presentacion.html').replace(/\\/g, '/');
  await page.goto(tarjetasPath, { waitUntil: 'networkidle0' });

  // ESTILO 1
  await page.evaluate(() => showStyle('view1', document.querySelectorAll('.tab-btn')[0]));
  await sleep(400);
  const c1Front = await page.$('#view1 .card-s1-front');
  if (c1Front) await c1Front.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo1_Frente.png') });
  const c1Back = await page.$('#view1 .card-s1-back');
  if (c1Back) await c1Back.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo1_Reverso.png') });

  // ESTILO 2
  await page.evaluate(() => showStyle('view2', document.querySelectorAll('.tab-btn')[1]));
  await sleep(400);
  const c2Front = await page.$('#view2 .card-s2-front');
  if (c2Front) await c2Front.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo2_Frente.png') });
  const c2Back = await page.$('#view2 .card-s2-back');
  if (c2Back) await c2Back.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo2_Reverso.png') });

  // ESTILO 3
  await page.evaluate(() => showStyle('view3', document.querySelectorAll('.tab-btn')[2]));
  await sleep(400);
  const c3Front = await page.$('#view3 .card-s3-front');
  if (c3Front) await c3Front.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo3_Frente.png') });
  const c3Back = await page.$('#view3 .card-s1-back');
  if (c3Back) await c3Back.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo3_Reverso.png') });

  console.log('✅ Tarjetas PNG en Ultra-HD (4032 x 2304 px / 1152 DPI) generadas.');

  // 2. GENERAR PDFs VECTORIALES PARA IMPRENTA
  // Extraemos estilos y HTML de cada tarjeta
  const cssText = await page.evaluate(() => {
    let s = '';
    for (const sheet of document.styleSheets) {
      try { for (const rule of sheet.cssRules) s += rule.cssText + '\n'; } catch (e) {}
    }
    return s;
  });

  const getHtml = async (sel) => {
    return await page.evaluate((s) => document.querySelector(s)?.outerHTML || '', sel);
  };

  const c1fHtml = await getHtml('#view1 .card-s1-front');
  const c1bHtml = await getHtml('#view1 .card-s1-back');
  const c2fHtml = await getHtml('#view2 .card-s2-front');
  const c2bHtml = await getHtml('#view2 .card-s2-back');
  const c3fHtml = await getHtml('#view3 .card-s3-front');
  const c3bHtml = await getHtml('#view3 .card-s1-back');

  const makePdfDoc = (cardHtmlList) => `
    <!DOCTYPE html>
    <html>
    <head>
      <base href="${tarjetasPath}">
      <style>
        ${cssText}
        @page { size: 3.5in 2in; margin: 0; }
        html, body { margin: 0; padding: 0; background: transparent; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page-box { width: 3.5in; height: 2in; page-break-after: always; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .card-s1-front, .card-s1-back, .card-s2-front, .card-s2-back, .card-s3-front { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; }
      </style>
    </head>
    <body>
      ${cardHtmlList.map(h => `<div class="page-box">${h}</div>`).join('')}
    </body>
    </html>
  `;

  const renderPdfFile = async (htmlList, fileName) => {
    const p = await browser.newPage();
    await p.setContent(makePdfDoc(htmlList), { waitUntil: 'load' });
    await p.pdf({
      path: path.join(pdfDir, fileName),
      width: '3.5in',
      height: '2in',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    await p.close();
    console.log('✅ PDF Vectorial generado:', fileName);
  };

  // PDFs individuales
  await renderPdfFile([c1fHtml], 'Tarjeta_Estilo1_Frente.pdf');
  await renderPdfFile([c1bHtml], 'Tarjeta_Estilo1_Reverso.pdf');
  await renderPdfFile([c1fHtml, c1bHtml], 'Tarjeta_Estilo1_Completa_2Caras.pdf');

  await renderPdfFile([c2fHtml], 'Tarjeta_Estilo2_Frente.pdf');
  await renderPdfFile([c2bHtml], 'Tarjeta_Estilo2_Reverso.pdf');
  await renderPdfFile([c2fHtml, c2bHtml], 'Tarjeta_Estilo2_Completa_2Caras.pdf');

  await renderPdfFile([c3fHtml], 'Tarjeta_Estilo3_Frente.pdf');
  await renderPdfFile([c3bHtml], 'Tarjeta_Estilo3_Reverso.pdf');
  await renderPdfFile([c3fHtml, c3bHtml], 'Tarjeta_Estilo3_Completa_2Caras.pdf');

  console.log('📄 Todos los PDFs Vectoriales listos en /PDF_Para_Imprenta/');

  await browser.close();
  console.log('🎉 ¡PROCESO FINALIZADO CON ÉXITO!');
})();
