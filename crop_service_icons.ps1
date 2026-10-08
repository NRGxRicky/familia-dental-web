Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\delfi\.gemini\antigravity\brain\a0856885-e336-48e9-9338-70ec6ce6d71d\dental_services_icons_sheet_1787079467688.jpg'
$outDir = 'C:\Users\delfi\Documents\Clinica Dental\assets\icons\services'

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$img = [System.Drawing.Image]::FromFile($src)
$W = $img.Width
$H = $img.Height

Write-Host "Source dimensions: $W x $H"

# The grid is 4 columns x 4 rows
# Cell width ~ W/4, Cell height ~ H/4
$cellW = $W / 4.0
$cellH = $H / 4.0

# Define the 11 services and their grid coordinates (col: 0..3, row: 0..3)
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

# Circle box padding ratio within each cell
$padRatio = 0.04
$cropW = [int]($cellW * (1.0 - ($padRatio * 2)))
$cropH = [int]($cellH * (1.0 - ($padRatio * 2)))

foreach ($ic in $icons) {
    $col = $ic.col
    $row = $ic.row
    $name = $ic.name

    $srcX = [int]($col * $cellW + ($cellW * $padRatio))
    $srcY = [int]($row * $cellH + ($cellH * $padRatio))

    $cropRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $cropW, $cropH)
    $destBmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
    $g.DrawImage($img, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

    $savePath = Join-Path $outDir "$name.png"
    $destBmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $destBmp.Dispose()
    Write-Host "Saved icon: $name.png"
}

$img.Dispose()
Write-Host "All icons cropped successfully!"
