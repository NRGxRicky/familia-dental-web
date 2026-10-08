const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const srcPath = 'file:///' + path.resolve('Logo/logo oficial/logocompleto.jpeg').replace(/\\/g, '/');
  
  await page.setContent(`
    <html>
      <body>
        <canvas id="c"></canvas>
        <canvas id="c_white"></canvas>
      </body>
    </html>
  `);

  const { dataUrlColor, dataUrlWhite } = await page.evaluate(async (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        
        const canvas = document.getElementById('c');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        const canvasW = document.getElementById('c_white');
        canvasW.width = w;
        canvasW.height = h;
        const ctxW = canvasW.getContext('2d');
        const imgDataW = ctxW.createImageData(w, h);
        const dW = imgDataW.data;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];

          const minVal = Math.min(r, g, b);
          const maxVal = Math.max(r, g, b);
          const diff = maxVal - minVal;

          let alpha = 255;
          if (minVal > 245 && diff < 15) {
            alpha = 0;
          } else if (minVal > 220) {
            alpha = Math.floor(((255 - minVal) / 35) * 255);
          }

          d[i + 3] = alpha;

          if (alpha > 0) {
            if (r < 100 && g < 120) {
              // Turn navy into pure white for dark backgrounds
              dW[i] = 255;
              dW[i + 1] = 255;
              dW[i + 2] = 255;
            } else {
              dW[i] = r;
              dW[i + 1] = g;
              dW[i + 2] = b;
            }
            dW[i + 3] = alpha;
          } else {
            dW[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        ctxW.putImageData(imgDataW, 0, 0);

        resolve({
          dataUrlColor: canvas.toDataURL('image/png'),
          dataUrlWhite: canvasW.toDataURL('image/png')
        });
      };
      img.src = src;
    });
  }, srcPath);

  const base64Color = dataUrlColor.replace(/^data:image\/png;base64,/, "");
  const base64White = dataUrlWhite.replace(/^data:image\/png;base64,/, "");

  fs.writeFileSync(path.resolve('Logo/logo oficial/png/logocompleto_4k.png'), base64Color, 'base64');
  fs.writeFileSync(path.resolve('Logo/logo oficial/png/logocompleto_blanco_4k.png'), base64White, 'base64');

  console.log('✅ Logos 4K generados en alta resolución (2752 x 1536 px)!');
  await browser.close();
})();
