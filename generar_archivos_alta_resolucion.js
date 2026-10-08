const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const baseDir = __dirname;
const mainOutputDir = path.join(baseDir, 'Imagenes_Impresion');
const ultraHdDir = path.join(mainOutputDir, 'PNG_UltraHD_1200DPI');
const pdfDir = path.join(baseDir, 'PDF_Para_Imprenta');

[mainOutputDir, ultraHdDir, pdfDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('🌟 Iniciando Generación de Tarjetas en MÁXIMA DEFINICIÓN (1200 DPI + PDF Vectorial)...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 1. RENDER ULTRA HD PNG (deviceScaleFactor: 12 -> 4032 x 2304 px / 1152 DPI)
  await page.setViewport({ width: 2560, height: 1600, deviceScaleFactor: 12 });
  const tarjetasPath = 'file:///' + path.join(baseDir, 'tarjetas_presentacion.html').replace(/\\/g, '/');
  await page.goto(tarjetasPath, { waitUntil: 'networkidle0' });

  // --- ESTILO 1 ---
  await page.evaluate(() => showStyle('view1', document.querySelectorAll('.tab-btn')[0]));
  await sleep(500);
  const c1Front = await page.$('#view1 .card-s1-front');
  if (c1Front) {
    await c1Front.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo1_Frente.png') });
    await c1Front.screenshot({ path: path.join(ultraHdDir, 'Tarjeta_Estilo1_Frente_1200DPI.png') });
  }
  const c1Back = await page.$('#view1 .card-s1-back');
  if (c1Back) {
    await c1Back.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo1_Reverso.png') });
    await c1Back.screenshot({ path: path.join(ultraHdDir, 'Tarjeta_Estilo1_Reverso_1200DPI.png') });
  }

  // --- ESTILO 2 ---
  await page.evaluate(() => showStyle('view2', document.querySelectorAll('.tab-btn')[1]));
  await sleep(500);
  const c2Front = await page.$('#view2 .card-s2-front');
  if (c2Front) {
    await c2Front.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo2_Frente.png') });
    await c2Front.screenshot({ path: path.join(ultraHdDir, 'Tarjeta_Estilo2_Frente_1200DPI.png') });
  }
  const c2Back = await page.$('#view2 .card-s2-back');
  if (c2Back) {
    await c2Back.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo2_Reverso.png') });
    await c2Back.screenshot({ path: path.join(ultraHdDir, 'Tarjeta_Estilo2_Reverso_1200DPI.png') });
  }

  // --- ESTILO 3 ---
  await page.evaluate(() => showStyle('view3', document.querySelectorAll('.tab-btn')[2]));
  await sleep(500);
  const c3Front = await page.$('#view3 .card-s3-front');
  if (c3Front) {
    await c3Front.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo3_Frente.png') });
    await c3Front.screenshot({ path: path.join(ultraHdDir, 'Tarjeta_Estilo3_Frente_1200DPI.png') });
  }
  const c3Back = await page.$('#view3 .card-s1-back');
  if (c3Back) {
    await c3Back.screenshot({ path: path.join(mainOutputDir, 'Tarjeta_Estilo3_Reverso.png') });
    await c3Back.screenshot({ path: path.join(ultraHdDir, 'Tarjeta_Estilo3_Reverso_1200DPI.png') });
  }

  console.log('✅ Tarjetas PNG en Ultra-HD (4032 x 2304 px / 1152 DPI) generadas con éxito.');

  // 2. GENERAR PDFs VECTORIALES PARA IMPRENTAS (Sin píxeles, vectores nativos 100% nítidos)
  const renderCardPdf = async (elementId, outputPdfName) => {
    const pdfPage = await browser.newPage();
    await pdfPage.goto(tarjetasPath, { waitUntil: 'networkidle0' });
    
    // Create dedicated clean isolated container for print
    await pdfPage.evaluate((targetId) => {
      document.body.innerHTML = '';
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.background = 'transparent';
        document.body.appendChild(targetEl);
        targetEl.style.boxShadow = 'none';
        targetEl.style.borderRadius = '0';
        targetEl.style.border = 'none';
        targetEl.style.margin = '0';
      }
    }, elementId);

    await pdfPage.pdf({
      path: path.join(pdfDir, outputPdfName),
      width: '3.5in',
      height: '2in',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    await pdfPage.close();
  };

  console.log('📄 Generando PDFs de Alta Definición Vectorial...');
  await renderCardPdf('#view1 .card-s1-front', 'Tarjeta_Estilo1_Frente.pdf');
  await renderCardPdf('#view1 .card-s1-back', 'Tarjeta_Estilo1_Reverso.pdf');
  await renderCardPdf('#view2 .card-s2-front', 'Tarjeta_Estilo2_Frente.pdf');
  await renderCardPdf('#view2 .card-s2-back', 'Tarjeta_Estilo2_Reverso.pdf');
  await renderCardPdf('#view3 .card-s3-front', 'Tarjeta_Estilo3_Frente.pdf');
  await renderCardPdf('#view3 .card-s1-back', 'Tarjeta_Estilo3_Reverso.pdf');

  console.log('✅ Archivos PDF Vectoriales para Imprenta guardados en /PDF_Para_Imprenta/');

  // 3. RENDER TABLOIDES Y VOLANTES EN ULTRA HD
  const tabloidePage = await browser.newPage();
  await tabloidePage.setViewport({ width: 2560, height: 1600, deviceScaleFactor: 5 });
  const tabloidePath = 'file:///' + path.join(baseDir, 'tabloide_impresion.html').replace(/\\/g, '/');
  await tabloidePage.goto(tabloidePath, { waitUntil: 'networkidle0' });

  await tabloidePage.evaluate(() => showTabloid('tab1', document.querySelectorAll('.tab-btn')[0]));
  await sleep(400);
  const tabS1 = await tabloidePage.$('#tab1 .tabloid-s1');
  if (tabS1) await tabS1.screenshot({ path: path.join(mainOutputDir, 'Tabloide_Estilo1_Blanco.png') });

  await tabloidePage.evaluate(() => showTabloid('tab2', document.querySelectorAll('.tab-btn')[1]));
  await sleep(400);
  const tabS2 = await tabloidePage.$('#tab2 .tabloid-s2');
  if (tabS2) await tabS2.screenshot({ path: path.join(mainOutputDir, 'Tabloide_Estilo2_AzulNoche.png') });

  await tabloidePage.evaluate(() => showTabloid('tab3', document.querySelectorAll('.tab-btn')[2]));
  await sleep(400);
  const tabS3 = await tabloidePage.$('#tab3 .tabloid-s3');
  if (tabS3) await tabS3.screenshot({ path: path.join(mainOutputDir, 'Tabloide_Estilo3_Editorial.png') });

  console.log('✅ Tabloides Ultra-HD guardados.');

  const volantePage = await browser.newPage();
  await volantePage.setViewport({ width: 2560, height: 1600, deviceScaleFactor: 4 });
  const volantePath = 'file:///' + path.join(baseDir, 'volante_impresion.html').replace(/\\/g, '/');
  await volantePage.goto(volantePath, { waitUntil: 'networkidle0' });
  await sleep(400);

  const volanteFrente = await volantePage.$('#volante-element');
  if (volanteFrente) await volanteFrente.screenshot({ path: path.join(mainOutputDir, 'Volante_Frente_Promocion.png') });

  // Mapa Reverso
  const mapaPath = 'file:///' + path.join(baseDir, 'mapa_ubicacion.html').replace(/\\/g, '/');
  await volantePage.goto(mapaPath, { waitUntil: 'networkidle0' });
  await sleep(400);
  const mapaEl = await volantePage.$('#map-element');
  if (mapaEl) await mapaEl.screenshot({ path: path.join(mainOutputDir, 'Volante_Reverso_Mapa_Ubicacion.png') });

  console.log('✅ Volantes Ultra-HD guardados.');

  await browser.close();
  console.log('🎉 ¡TODOS LOS ARCHIVOS SE GENERARON EN MÁXIMA DEFINICIÓN PROFESIONAL!');
})();
