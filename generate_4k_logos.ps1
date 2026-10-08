Add-Type -AssemblyName System.Drawing

$src = 'Logo\logo oficial\logocompleto.jpeg'
$outPng = 'Logo\logo oficial\png\logocompleto_4k.png'
$outBlanco = 'Logo\logo oficial\png\logocompleto_blanco_4k.png'

$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path $src))
$w = $img.Width
$h = $img.Height

Write-Host "Processing $w x $h image..."

$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bmpBlanco = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bmpBlancoData = $bmpBlanco.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$srcData = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$byteCount = [Math]::Abs($srcData.Stride) * $h
$srcBytes = New-Object byte[] $byteCount
$destBytes = New-Object byte[] $byteCount
$blancoBytes = New-Object byte[] $byteCount

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $byteCount)

for ($i = 0; $i -lt $byteCount; $i += 4) {
    $b = $srcBytes[$i]
    $g = $srcBytes[$i + 1]
    $r = $srcBytes[$i + 2]

    $minVal = [Math]::Min($r, [Math]::Min($g, $b))
    $maxVal = [Math]::Max($r, [Math]::Max($g, $b))
    $diff = $maxVal - $minVal

    if ($minVal -gt 248 -and $diff -lt 12) {
        $alpha = 0
    } elseif ($minVal -gt 220) {
        $alphaFactor = (255.0 - $minVal) / 35.0
        if ($alphaFactor -gt 1.0) { $alphaFactor = 1.0 }
        if ($alphaFactor -lt 0.0) { $alphaFactor = 0.0 }
        $alpha = [byte]($alphaFactor * 255)
    } else {
        $alpha = 255
    }

    $destBytes[$i] = $b
    $destBytes[$i + 1] = $g
    $destBytes[$i + 2] = $r
    $destBytes[$i + 3] = [byte]$alpha

    if ($alpha -gt 0) {
        if ($r -lt 100 -and $g -lt 120) {
            $blancoBytes[$i] = 255
            $blancoBytes[$i + 1] = 255
            $blancoBytes[$i + 2] = 255
        } else {
            $blancoBytes[$i] = $b
            $blancoBytes[$i + 1] = $g
            $blancoBytes[$i + 2] = $r
        }
        $blancoBytes[$i + 3] = [byte]$alpha
    } else {
        $blancoBytes[$i] = 0
        $blancoBytes[$i + 1] = 0
        $blancoBytes[$i + 2] = 0
        $blancoBytes[$i + 3] = 0
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($destBytes, 0, $bmpData.Scan0, $byteCount)
[System.Runtime.InteropServices.Marshal]::Copy($blancoBytes, 0, $bmpBlancoData.Scan0, $byteCount)

$img.UnlockBits($srcData)
$bmp.UnlockBits($bmpData)
$bmpBlanco.UnlockBits($bmpBlancoData)

$targetPngPath = Join-Path (Get-Location).Path $outPng
$targetBlancoPath = Join-Path (Get-Location).Path $outBlanco

$bmp.Save($targetPngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmpBlanco.Save($targetBlancoPath, [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$bmp.Dispose()
$bmpBlanco.Dispose()

Write-Host "Saved 4K high-res PNG logos successfully!"
