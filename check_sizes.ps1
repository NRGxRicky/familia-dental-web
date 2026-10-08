Add-Type -AssemblyName System.Drawing

function Check-Size($p) {
    if (Test-Path $p) {
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $p))
        $dpiX = [math]::Round($img.HorizontalResolution)
        Write-Host "$p -> $($img.Width) x $($img.Height) px | DPI: $dpiX"
        $img.Dispose()
    } else {
        Write-Host "Not found: $p"
    }
}

Write-Host "--- IMAGENES PRINCIPALES (1200 DPI) ---"
Check-Size 'Imagenes_Impresion\Tarjeta_Estilo1_Frente.png'
Check-Size 'Imagenes_Impresion\Tarjeta_Estilo1_Reverso.png'
Check-Size 'Imagenes_Impresion\Tarjeta_Estilo2_Frente.png'
Check-Size 'Imagenes_Impresion\Tarjeta_Estilo3_Frente.png'

Write-Host "`n--- CARPETA PDF IMPRENTA VECTORIAL ---"
Get-ChildItem 'PDF_Para_Imprenta' | Select-Object Name, Length | Format-Table -AutoSize
