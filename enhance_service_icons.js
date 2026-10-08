const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const iconDir = path.resolve('assets/icons/services');
  const files = fs.readdirSync(iconDir).filter(f => f.endsWith('.png'));

  for (const file of files) {
    const fullPath = path.join(iconDir, file);
    const fileUrl = 'file:///' + fullPath.replace(/\\/g, '/');

    const enhancedDataUrl = await page.evaluate(async (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');

          // Draw with contrast and sharpness
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, w, h);
          const d = imgData.data;

          for (let i = 0; i < d.length; i += 4) {
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            let a = d[i + 3];

            // Darken navy/dark strokes to make them extra bold and defined for print
            if (r < 110 && g < 130 && b < 160) {
              // Deep navy/black stroke intensification
              d[i] = Math.max(0, r - 30);
              d[i + 1] = Math.max(0, g - 30);
              d[i + 2] = Math.max(0, b - 20);
            } else if (r > 160 && g > 130 && b < 120) {
              // Gold stroke enhancement (richer, bolder gold)
              d[i] = Math.min(235, r + 15);
              d[i + 1] = Math.min(195, g + 10);
              d[i + 2] = Math.max(40, b - 15);
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = src;
      });
    }, fileUrl);

    const base64 = enhancedDataUrl.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(fullPath, base64, 'base64');
    console.log('✅ Enhanced icon:', file);
  }

  await browser.close();
  console.log('🎉 Todos los íconos han sido engrosados y contrastados para imprenta!');
})();
