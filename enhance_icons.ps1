Add-Type -AssemblyName System.Drawing

$iconDir = 'assets\icons\services'
$files = Get-ChildItem $iconDir -Filter *.png

foreach ($f in $files) {
    $img = [System.Drawing.Bitmap]::FromFile($f.FullName)
    $w = $img.Width
    $h = $img.Height

    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)

    $bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $srcData = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $byteCount = [Math]::Abs($srcData.Stride) * $h
    $srcBytes = New-Object byte[] $byteCount
    $destBytes = New-Object byte[] $byteCount

    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $byteCount)

    for ($i = 0; $i -lt $byteCount; $i += 4) {
        $b = $srcBytes[$i]
        $g = $srcBytes[$i + 1]
        $r = $srcBytes[$i + 2]
        $a = $srcBytes[$i + 3]

        if ($a -gt 0) {
            # Make dark blue/black strokes extra bold and saturated for offset printing
            if ($r -lt 120 -and $g -lt 140 -and $b -lt 170) {
                # Darken to rich midnight navy
                $r = [byte][Math]::Max(0, $r - 35)
                $g = [byte][Math]::Max(0, $g - 35)
                $b = [byte][Math]::Max(0, $b - 25)
            } elseif ($r -gt 150 -and $g -gt 120) {
                # Enrich gold lines
                $r = [byte][Math]::Min(235, $r + 15)
                $g = [byte][Math]::Min(195, $g + 10)
                $b = [byte][Math]::Max(40, $b - 15)
            }
        }

        $destBytes[$i] = $b
        $destBytes[$i + 1] = $g
        $destBytes[$i + 2] = $r
        $destBytes[$i + 3] = $a
    }

    [System.Runtime.InteropServices.Marshal]::Copy($destBytes, 0, $bmpData.Scan0, $byteCount)

    $img.UnlockBits($srcData)
    $bmp.UnlockBits($bmpData)
    $img.Dispose()

    # Save enhanced
    $tempPath = $f.FullName + '.tmp.png'
    $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Move-Item -Path $tempPath -Destination $f.FullName -Force
    Write-Host "Enriched & emboldened icon: $($f.Name)"
}

Write-Host "All icons emboldened for print!"
