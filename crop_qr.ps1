Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile('C:\Users\delfi\Documents\Clinica Dental\assets\images\qr_whatsapp_real.jpg')
$w = $img.Width
$h = $img.Height

# Crop to just the QR code (skip logo and text at top, whitespace at bottom)
$x = [int]($w * 0.18)
$y = [int]($h * 0.35)
$cw = [int]($w * 0.64)
$ch = [int]($h * 0.55)

$cropRect = New-Object System.Drawing.Rectangle($x, $y, $cw, $ch)
$bmp = New-Object System.Drawing.Bitmap($cw, $ch)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save('C:\Users\delfi\Documents\Clinica Dental\assets\images\qr_whatsapp_cropped.png', [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "QR recortado guardado exitosamente"
