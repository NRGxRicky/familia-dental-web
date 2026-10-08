const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

(async () => {
  const whatsappUrl = 'https://wa.me/522211939115';
  const outSvg = path.resolve('assets/images/qr_whatsapp_vector.svg');
  const outPng = path.resolve('assets/images/qr_whatsapp_clean.png');

  // 1. Generate crisp Vector SVG
  const svgString = await QRCode.toString(whatsappUrl, {
    type: 'svg',
    margin: 1,
    color: {
      dark: '#122947', // Deep luxury navy blue or pure black
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H' // High error correction level for maximum readability
  });
  fs.writeFileSync(outSvg, svgString, 'utf8');
  console.log('✅ QR Vector SVG generated at:', outSvg);

  // 2. Generate 2048x2048 Ultra High Definition PNG
  await QRCode.toFile(outPng, whatsappUrl, {
    width: 2048,
    margin: 1,
    color: {
      dark: '#122947',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  });
  console.log('✅ QR Ultra-HD PNG generated at:', outPng);
})();
