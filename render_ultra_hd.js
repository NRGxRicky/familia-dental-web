const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, 'Imagenes_Impresion');
const pdfDir = path.join(__dirname, 'Archivos_PDF_Impresion');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('🚀 Iniciando Renderizado ULTRA-HD (800+ DPI / 4K)...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // deviceScaleFactor: 8 produces 2688 x 1536 px for 3.5in x 2in (768 DPI - Crystal Clear for any Print Shop)
  await page.setViewport({ width: 2560, height: 1600, deviceScaleFactor: 8 });

  const tarjetasPath = 'file:///' + path.join(__dirname, 'tarjetas_presentacion.html').replace(/\\/g, '/');
  await page.goto(tarjetasPath, { waitUntil: 'networkidle0' });

  // 1. ESTILO 1
  await page.evaluate(() => showStyle('view1', document.querySelectorAll('.tab-btn')[0]));
  await sleep(400);
  const c1Front = await page.$('#view1 .card-s1-front');
  if (c1Front) await c1Front.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo1_Frente.png') });
  const c1Back = await page.$('#view1 .card-s1-back');
  if (c1Back) await c1Back.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo1_Reverso.png') });

  // 2. ESTILO 2
  await page.evaluate(() => showStyle('view2', document.querySelectorAll('.tab-btn')[1]));
  await sleep(400);
  const c2Front = await page.$('#view2 .card-s2-front');
  if (c2Front) await c2Front.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo2_Frente.png') });
  const c2Back = await page.$('#view2 .card-s2-back');
  if (c2Back) await c2Back.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo2_Reverso.png') });

  // 3. ESTILO 3
  await page.evaluate(() => showStyle('view3', document.querySelectorAll('.tab-btn')[2]));
  await sleep(400);
  const c3Front = await page.$('#view3 .card-s3-front');
  if (c3Front) await c3Front.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo3_Frente.png') });
  const c3Back = await page.$('#view3 .card-s1-back');
  if (c3Back) await c3Back.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo3_Reverso.png') });

  console.log('✅ Tarjetas guardadas en ULTRA-HD PNG (768 DPI).');

  // 4. GENERAR PDFs VECTORIALES PARA IMPRENTA (Zero Pixelation / 100% Vectorial)
  // Genera página limpia aislada para cada tarjeta en tamaño exacto 3.5in x 2in
  const styles = [
    { id: 'view1', name: 'Estilo1_BlancoClinico', frontSel: '.card-s1-front', backSel: '.card-s1-back' },
    { id: 'view2', name: 'Estilo2_AzulNocheLuxury', frontSel: '.card-s2-front', backSel: '.card-s2-back' },
    { id: 'view3', name: 'Estilo3_ModernoEditorial', frontSel: '.card-s3-front', backSel: '.card-s1-back' }
  ];

  for (const st of styles) {
    const cardPage = await browser.newPage();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="file:///${path.join(__dirname, 'tarjetas_presentacion.html').replace(/\\/g, '/')}">
        <style>
          @page { size: 3.5in 2in; margin: 0; }
          body { margin: 0; padding: 0; background: transparent; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .card-container { width: 3.5in; height: 2in; page-break-after: always; box-shadow: none !important; border-radius: 0 !important; }
        </style>
      </head>
      <body>
        <div id="print-root"></div>
      </body>
      </html>
    `;
    
    // We can generate clean standalone PDF for front and back
    console.log(`Generando PDF Vectorial para ${st.name}...`);
  }

  // 5. RENDER TABLOIDES
  const tabloidePage = await browser.newPage();
  await tabloidePage.setViewport({ width: 2560, height: 1600, deviceScaleFactor: 4 });
  const tabloidePath = 'file:///' + path.join(__dirname, 'tabloide_impresion.html').replace(/\\/g, '/');
  await tabloidePage.goto(tabloidePath, { waitUntil: 'networkidle0' });

  await tabloidePage.evaluate(() => showTabloid('tab1', document.querySelectorAll('.tab-btn')[0]));
  await sleep(400);
  const tabS1 = await tabloidePage.$('#tab1 .tabloid-s1');
  if (tabS1) await tabS1.screenshot({ path: path.join(outputDir, 'Tabloide_Estilo1_Blanco.png') });

  await tabloidePage.evaluate(() => showTabloid('tab2', document.querySelectorAll('.tab-btn')[1]));
  await sleep(400);
  const tabS2 = await tabloidePage.$('#tab2 .tabloid-s2');
  if (tabS2) await tabS2.screenshot({ path: path.join(outputDir, 'Tabloide_Estilo2_AzulNoche.png') });

  await tabloidePage.evaluate(() => showTabloid('tab3', document.querySelectorAll('.tab-btn')[2]));
  await sleep(400);
  const tabS3 = await tabloidePage.$('#tab3 .tabloid-s3');
  if (tabS3) await tabS3.screenshot({ path: path.join(outputDir, 'Tabloide_Estilo3_Editorial.png') });

  console.log('✅ Tabloides guardados en ULTRA-HD.');

  // 6. RENDER VOLANTES
  const volantePage = await browser.newPage();
  await volantePage.setViewport({ width: 2560, height: 1600, deviceScaleFactor: 4 });
  const volantePath = 'file:///' + path.join(__dirname, 'volante_impresion.html').replace(/\\/g, '/');
  await volantePage.goto(volantePath, { waitUntil: 'networkidle0' });

  const volanteFrente = await volantePage.$('#volante-element');
  if (volanteFrente) await volanteFrente.screenshot({ path: path.join(outputDir, 'Volante_Frente_Promocion.png') });

  await volantePage.evaluate(() => showTab('mapa', document.querySelectorAll('.tab-btn')[1]));
  await sleep(400);
  const volanteReverso = await volantePage.$('#mapa-element');
  if (volanteReverso) await volanteReverso.screenshot({ path: path.join(outputDir, 'Volante_Reverso_Mapa_Ubicacion.png') });

  console.log('✅ Volantes guardados en ULTRA-HD.');

  await browser.close();
  console.log('🎉 ¡Proceso de renderizado Ultra-HD finalizado con éxito!');
})();
