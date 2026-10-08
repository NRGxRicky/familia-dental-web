const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, 'Imagenes_Impresion');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('Iniciando renderizado de imágenes de alta resolución...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1400, deviceScaleFactor: 3 });

  // 1. RENDER TARJETAS
  const tarjetasPath = 'file:///' + path.join(__dirname, 'tarjetas_presentacion.html').replace(/\\/g, '/');
  await page.goto(tarjetasPath, { waitUntil: 'networkidle0' });

  await page.evaluate(() => showStyle('view1', document.querySelectorAll('.tab-btn')[0]));
  await sleep(400);
  const cardS1Front = await page.$('#view1 .card-s1-front');
  if (cardS1Front) await cardS1Front.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo1_Frente.png') });
  const cardS1Back = await page.$('#view1 .card-s1-back');
  if (cardS1Back) await cardS1Back.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo1_Reverso.png') });

  await page.evaluate(() => showStyle('view2', document.querySelectorAll('.tab-btn')[1]));
  await sleep(400);
  const cardS2Front = await page.$('#view2 .card-s2-front');
  if (cardS2Front) await cardS2Front.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo2_Frente.png') });
  const cardS2Back = await page.$('#view2 .card-s2-back');
  if (cardS2Back) await cardS2Back.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo2_Reverso.png') });

  await page.evaluate(() => showStyle('view3', document.querySelectorAll('.tab-btn')[2]));
  await sleep(400);
  const cardS3Front = await page.$('#view3 .card-s3-front');
  if (cardS3Front) await cardS3Front.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo3_Frente.png') });
  const cardS3Back = await page.$('#view3 .card-s1-back');
  if (cardS3Back) await cardS3Back.screenshot({ path: path.join(outputDir, 'Tarjeta_Estilo3_Reverso.png') });

  console.log('Tarjetas guardadas en PNG.');

  // 2. RENDER TABLOIDES
  const tabloidePath = 'file:///' + path.join(__dirname, 'tabloide_impresion.html').replace(/\\/g, '/');
  await page.goto(tabloidePath, { waitUntil: 'networkidle0' });

  await page.evaluate(() => showTabloid('tab1', document.querySelectorAll('.tab-btn')[0]));
  await sleep(400);
  const tabS1 = await page.$('#tab1 .tabloid-s1');
  if (tabS1) await tabS1.screenshot({ path: path.join(outputDir, 'Tabloide_Estilo1_Blanco.png') });

  await page.evaluate(() => showTabloid('tab2', document.querySelectorAll('.tab-btn')[1]));
  await sleep(400);
  const tabS2 = await page.$('#tab2 .tabloid-s2');
  if (tabS2) await tabS2.screenshot({ path: path.join(outputDir, 'Tabloide_Estilo2_AzulNoche.png') });

  await page.evaluate(() => showTabloid('tab3', document.querySelectorAll('.tab-btn')[2]));
  await sleep(400);
  const tabS3 = await page.$('#tab3 .tabloid-s3');
  if (tabS3) await tabS3.screenshot({ path: path.join(outputDir, 'Tabloide_Estilo3_Editorial.png') });

  console.log('Tabloides guardados en PNG.');

  // 3. RENDER VOLANTE FRENTE
  const volantePath = 'file:///' + path.join(__dirname, 'volante_impresion.html').replace(/\\/g, '/');
  await page.goto(volantePath, { waitUntil: 'networkidle0' });
  await sleep(400);
  const volanteEl = await page.$('#volante-element');
  if (volanteEl) await volanteEl.screenshot({ path: path.join(outputDir, 'Volante_Frente_Promocion.png') });

  console.log('Volante Frente guardado en PNG.');

  // 4. RENDER VOLANTE REVERSO (MAPA DE UBICACIÓN)
  const mapaPath = 'file:///' + path.join(__dirname, 'mapa_ubicacion.html').replace(/\\/g, '/');
  await page.goto(mapaPath, { waitUntil: 'networkidle0' });
  await sleep(400);
  const mapaEl = await page.$('#map-element');
  if (mapaEl) await mapaEl.screenshot({ path: path.join(outputDir, 'Volante_Reverso_Mapa_Ubicacion.png') });

  console.log('Volante Reverso Mapa guardado en PNG.');

  await browser.close();
  console.log('¡Todas las imágenes se generaron correctamente en alta definición!');
})();
