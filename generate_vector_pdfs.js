const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const pdfDir = path.join(__dirname, 'PDF_Para_Imprenta');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const tarjetasPath = 'file:///' + path.join(__dirname, 'tarjetas_presentacion.html').replace(/\\/g, '/');

  const generateCleanPdf = async (viewId, cardClass, outName) => {
    await page.goto(tarjetasPath, { waitUntil: 'networkidle0' });
    
    // Extract HTML and CSS
    const cardHtml = await page.evaluate((c) => {
      const el = document.querySelector(c);
      return el ? el.outerHTML : '';
    }, cardClass);

    const cssText = await page.evaluate(() => {
      let styles = '';
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            styles += rule.cssText + '\n';
          }
        } catch (e) {}
      }
      return styles;
    });

    const printPage = await browser.newPage();
    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <base href="${tarjetasPath}">
        <style>
          ${cssText}
          @page { size: 3.5in 2in; margin: 0; }
          html, body { margin: 0; padding: 0; background: transparent; width: 3.5in; height: 2in; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .card-s1-front, .card-s1-back, .card-s2-front, .card-s2-back, .card-s3-front { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; }
        </style>
      </head>
      <body>
        ${cardHtml}
      </body>
      </html>
    `;

    await printPage.setContent(docHtml, { waitUntil: 'networkidle0' });

    await printPage.pdf({
      path: path.join(pdfDir, outName),
      width: '3.5in',
      height: '2in',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    await printPage.close();
    console.log('✅ Generated PDF:', outName);
  };

  await generateCleanPdf('view1', '#view1 .card-s1-front', 'Tarjeta_Estilo1_Frente.pdf');
  await generateCleanPdf('view1', '#view1 .card-s1-back', 'Tarjeta_Estilo1_Reverso.pdf');
  await generateCleanPdf('view2', '#view2 .card-s2-front', 'Tarjeta_Estilo2_Frente.pdf');
  await generateCleanPdf('view2', '#view2 .card-s2-back', 'Tarjeta_Estilo2_Reverso.pdf');
  await generateCleanPdf('view3', '#view3 .card-s3-front', 'Tarjeta_Estilo3_Frente.pdf');
  await generateCleanPdf('view3', '#view3 .card-s1-back', 'Tarjeta_Estilo3_Reverso.pdf');

  // Also combined 2-page PDF for Estilo 1, 2, 3
  const generateCombinedPdf = async (frontClass, backClass, outName) => {
    const printPage = await browser.newPage();
    await page.goto(tarjetasPath, { waitUntil: 'networkidle0' });

    const frontHtml = await page.evaluate((c) => document.querySelector(c)?.outerHTML || '', frontClass);
    const backHtml = await page.evaluate((c) => document.querySelector(c)?.outerHTML || '', backClass);
    const cssText = await page.evaluate(() => {
      let styles = '';
      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) styles += rule.cssText + '\n'; } catch (e) {}
      }
      return styles;
    });

    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <base href="${tarjetasPath}">
        <style>
          ${cssText}
          @page { size: 3.5in 2in; margin: 0; }
          html, body { margin: 0; padding: 0; background: transparent; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-card { width: 3.5in; height: 2in; page-break-after: always; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          .card-s1-front, .card-s1-back, .card-s2-front, .card-s2-back, .card-s3-front { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; }
        </style>
      </head>
      <body>
        <div class="page-card">${frontHtml}</div>
        <div class="page-card">${backHtml}</div>
      </body>
      </html>
    `;

    await printPage.setContent(docHtml, { waitUntil: 'networkidle0' });
    await printPage.pdf({
      path: path.join(pdfDir, outName),
      width: '3.5in',
      height: '2in',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    await printPage.close();
    console.log('✅ Generated 2-Page Print PDF:', outName);
  };

  await generateCombinedPdf('#view1 .card-s1-front', '#view1 .card-s1-back', 'Tarjeta_Estilo1_Completa_2Paginas.pdf');
  await generateCombinedPdf('#view2 .card-s2-front', '#view2 .card-s2-back', 'Tarjeta_Estilo2_Completa_2Paginas.pdf');
  await generateCombinedPdf('#view3 .card-s3-front', '#view3 .card-s1-back', 'Tarjeta_Estilo3_Completa_2Paginas.pdf');

  await browser.close();
  console.log('🎉 Todos los PDFs Vectoriales listos para enviar a imprenta!');
})();
