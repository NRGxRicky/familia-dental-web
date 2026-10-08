Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\delfi\.gemini\antigravity\brain\a0856885-e336-48e9-9338-70ec6ce6d71d\dental_services_icons_sheet_1787079467688.jpg'
$outDir = 'C:\Users\delfi\Documents\Clinica Dental\assets\icons\services'

$img = [System.Drawing.Image]::FromFile($src)

$colCenters = @(150, 395, 640, 885)
$rowCenters = @(150, 395, 640, 885)
$targetSize = 220

$icons = @(
    @{ name = 'limpieza';       col = 0; row = 0 },
    @{ name = 'resinas';        col = 1; row = 0 },
    @{ name = 'blanqueamiento'; col = 2; row = 0 },
    @{ name = 'diseno_sonrisa'; col = 3; row = 0 },
    @{ name = 'ortodoncia';     col = 0; row = 1 },
    @{ name = 'endodoncia';     col = 1; row = 1 },
    @{ name = 'implantes';      col = 2; row = 1 },
    @{ name = 'cirugias';       col = 3; row = 1 },
    @{ name = 'extracciones';   col = 0; row = 2 },
    @{ name = 'protesis';       col = 1; row = 2 },
    @{ name = 'pediatricos';    col = 2; row = 2 }
)

foreach ($ic in $icons) {
    $cx = $colCenters[$ic.col]
    $cy = $rowCenters[$ic.row]
    $name = $ic.name

    $srcX = [int]($cx - ($targetSize / 2))
    $srcY = [int]($cy - ($targetSize / 2))

    $cropRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $targetSize, $targetSize)
    $destBmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetSize, $targetSize)
    $g.DrawImage($img, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

    $savePath = Join-Path $outDir "$name.png"
    $destBmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $destBmp.Dispose()
    Write-Host "Perfect cropped: $name.png"
}

$img.Dispose()
Write-Host "Done!"
